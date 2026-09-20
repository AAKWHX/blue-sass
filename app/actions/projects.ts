"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import {
  feedback,
  messages,
  projectFiles,
  projectMilestones,
  projects,
} from "@/lib/db/schema";
import {
  assertCanEditProject,
  assertCanViewProject,
  requireViewer,
} from "@/lib/db/access";

export interface MutationState {
  ok: boolean;
  message: string;
}

const unconfigured: MutationState = {
  ok: false,
  message: "The database is not connected yet. Set DATABASE_URL.",
};

/** Recomputes `progress` and `stage` from the milestone list. */
async function recalcProgress(projectId: string) {
  const rows = await db
    .select({ status: projectMilestones.status, stage: projectMilestones.stage })
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, projectId));

  if (rows.length === 0) return;
  const done = rows.filter((r) => r.status === "done").length;
  const progress = Math.round((done / rows.length) * 100);
  const active = rows.find((r) => r.status !== "done");
  await db
    .update(projects)
    .set({
      progress,
      stage: progress === 100 ? "completed" : (active?.stage ?? "planning"),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}

const milestoneSchema = z.object({
  projectId: z.string().uuid(),
  milestoneId: z.string().uuid(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]),
});

/** Staff move a milestone; the client's progress bar updates automatically. */
export async function setMilestoneStatusAction(
  _prev: MutationState,
  formData: FormData,
): Promise<MutationState> {
  if (!isDatabaseConfigured) return unconfigured;
  const parsed = milestoneSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Invalid milestone update." };

  await assertCanEditProject(parsed.data.projectId);
  await db
    .update(projectMilestones)
    .set({ status: parsed.data.status })
    .where(
      and(
        eq(projectMilestones.id, parsed.data.milestoneId),
        eq(projectMilestones.projectId, parsed.data.projectId),
      ),
    );
  await recalcProgress(parsed.data.projectId);
  revalidatePath("/[locale]/portal", "page");
  revalidatePath("/[locale]/admin", "page");
  return { ok: true, message: "Milestone updated." };
}

const feedbackSchema = z.object({
  projectId: z.string().uuid(),
  category: z.enum(["design", "content", "bug", "scope"]),
  body: z.string().trim().min(3, "Write a little more detail.").max(4000),
});

/** Clients and staff both post feedback on a project. */
export async function postFeedbackAction(
  _prev: MutationState,
  formData: FormData,
): Promise<MutationState> {
  if (!isDatabaseConfigured) return unconfigured;
  const parsed = feedbackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const viewer = await requireViewer();
  await assertCanViewProject(parsed.data.projectId);
  await db.insert(feedback).values({
    projectId: parsed.data.projectId,
    authorId: viewer.id,
    category: parsed.data.category,
    body: parsed.data.body,
  });
  revalidatePath("/[locale]/portal", "page");
  return { ok: true, message: "Feedback sent." };
}

const messageSchema = z.object({
  projectId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

export async function postMessageAction(
  _prev: MutationState,
  formData: FormData,
): Promise<MutationState> {
  if (!isDatabaseConfigured) return unconfigured;
  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Write a message first." };

  const viewer = await requireViewer();
  await assertCanViewProject(parsed.data.projectId);
  await db.insert(messages).values({
    projectId: parsed.data.projectId,
    senderId: viewer.id,
    body: parsed.data.body,
  });
  revalidatePath("/[locale]/portal", "page");
  return { ok: true, message: "Message sent." };
}

const mediaSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(1),
  url: z.string().url("Enter a valid URL."),
  kind: z.enum(["image", "video", "demo", "document"]),
  category: z.enum(["design", "document", "contract", "source", "invoice", "media"]),
  visibleToClient: z.coerce.boolean().default(true),
});

/**
 * Attach a deliverable — a screenshot, a video walkthrough, or a live demo
 * link — to the project so the client sees it in their dashboard.
 */
export async function addProjectMediaAction(
  _prev: MutationState,
  formData: FormData,
): Promise<MutationState> {
  if (!isDatabaseConfigured) return unconfigured;
  const raw = Object.fromEntries(formData);
  const parsed = mediaSchema.safeParse({
    ...raw,
    visibleToClient: raw.visibleToClient === "on" || raw.visibleToClient === "true",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const viewer = await assertCanEditProject(parsed.data.projectId);
  await db.insert(projectFiles).values({
    projectId: parsed.data.projectId,
    name: parsed.data.name,
    url: parsed.data.url,
    kind: parsed.data.kind,
    category: parsed.data.category,
    visibleToClient: parsed.data.visibleToClient,
    uploadedBy: viewer.id,
  });
  revalidatePath("/[locale]/portal", "page");
  revalidatePath("/[locale]/admin", "page");
  return { ok: true, message: "Deliverable published." };
}
