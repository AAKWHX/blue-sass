"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import {
  feedback,
  messages,
  projectFiles,
  projectMilestones,
  projects,
  payments,
} from "@/lib/db/schema";
import {
  assertCanEditProject,
  assertCanViewProject,
  requireViewer,
  requireRole,
  assertCanWrite,
} from "@/lib/db/access";

import { lifecycleState, lockProject, recordLifecycle, type ProjectTransaction } from "@/lib/db/project-lifecycle";
import { getPayPalEnvironment } from "@/lib/paypal";

async function hasCompletedPayment(projectId: string, tx: ProjectTransaction) {
  const [row] = await tx.select({ id: payments.id }).from(payments).where(and(eq(payments.projectId, projectId), eq(payments.environment, getPayPalEnvironment()), eq(payments.status, "paid"))).limit(1);
  return Boolean(row);
}

export interface MutationState {
  ok: boolean;
  message: string;
}

const unconfigured: MutationState = {
  ok: false,
  message: "The database is not connected yet. Set DATABASE_URL.",
};

/** Recomputes `progress` and `stage` from the milestone list. */
async function recalcProgress(projectId: string, tx: ProjectTransaction, actorId: string) {
  const rows = await tx
    .select({ status: projectMilestones.status, stage: projectMilestones.stage })
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, projectId)).orderBy(asc(projectMilestones.orderIndex));

  if (rows.length === 0) return;
  const done = rows.filter((r) => r.status === "done").length;
  const progress = Math.round((done / rows.length) * 100);
  const active = rows.find((r) => r.status !== "done");
  if (progress === 100 || active?.stage !== "planning" || rows.some(r => r.stage !== "planning" && r.status !== "todo")) await recordLifecycle(tx, projectId, "locked", actorId);
  await tx
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

const projectStageSchema = z.object({ projectId: z.string().uuid(), stage: z.enum(["planning", "design", "development", "testing", "review", "completed"]) });
const stageOrder = ["planning", "design", "development", "testing", "review", "completed"] as const;

/** Managers move the complete project workflow; the client sees the update immediately. */
export async function setProjectStageAction(formData: FormData) {
  if (!isDatabaseConfigured) return;
  const viewer = await requireRole("super_admin", "admin", "pm");
  const parsed = projectStageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await db.transaction(async tx => {
    const project = await lockProject(tx, parsed.data.projectId);
    if (!project || (await lifecycleState(project.id, tx)).cancelled) return;
    if (project.clientId && !(await hasCompletedPayment(project.id, tx))) return;
    const targetIndex = stageOrder.indexOf(parsed.data.stage);
    if (project.stage !== "planning" || parsed.data.stage !== "planning") await recordLifecycle(tx, project.id, "locked", viewer.id);
    const rows = await tx.select({ id: projectMilestones.id, stage: projectMilestones.stage }).from(projectMilestones).where(eq(projectMilestones.projectId, project.id));
    for (const row of rows) {
      const index = stageOrder.indexOf(row.stage);
      const status = parsed.data.stage === "completed" || index < targetIndex ? "done" : index === targetIndex ? "in_progress" : "todo";
      await tx.update(projectMilestones).set({ status }).where(eq(projectMilestones.id, row.id));
    }
    await tx.update(projects).set({ stage: parsed.data.stage, progress: parsed.data.stage === "completed" ? 100 : Math.round((targetIndex / 5) * 100), updatedAt: new Date() }).where(eq(projects.id, project.id));
  });
  revalidatePath("/[locale]/portal", "layout");
  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]/projects", "page");
  revalidatePath("/[locale]", "page");
}

/** Staff move a milestone; the client's progress bar updates automatically. */
export async function setMilestoneStatusAction(
  _prev: MutationState,
  formData: FormData,
): Promise<MutationState> {
  if (!isDatabaseConfigured) return unconfigured;
  const parsed = milestoneSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Invalid milestone update." };

  const viewer = await assertCanEditProject(parsed.data.projectId);
  const changed = await db.transaction(async tx => {
    const project = await lockProject(tx, parsed.data.projectId);
    if (!project || (await lifecycleState(project.id, tx)).cancelled) return false;
    if (project.clientId && !(await hasCompletedPayment(project.id, tx))) return false;
    if (project.stage !== "planning") await recordLifecycle(tx, project.id, "locked", viewer.id);
    const rows = await tx.update(projectMilestones).set({ status: parsed.data.status }).where(and(eq(projectMilestones.id, parsed.data.milestoneId), eq(projectMilestones.projectId, project.id))).returning({ id: projectMilestones.id });
    if (!rows.length) return false;
    await recalcProgress(project.id, tx, viewer.id);
    return true;
  });
  if (!changed) return { ok: false, message: "Project is cancelled or milestone was not found." };
  revalidatePath("/[locale]/portal", "layout");
  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]/projects", "page");
  revalidatePath("/[locale]", "page");
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
  assertCanWrite(viewer);
  await assertCanViewProject(parsed.data.projectId);
  await db.insert(feedback).values({
    projectId: parsed.data.projectId,
    authorId: viewer.id,
    category: parsed.data.category,
    body: parsed.data.body,
  });
  revalidatePath("/[locale]/portal", "layout");
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
  assertCanWrite(viewer);
  await assertCanViewProject(parsed.data.projectId);
  await db.insert(messages).values({
    projectId: parsed.data.projectId,
    senderId: viewer.id,
    body: parsed.data.body,
  });
  revalidatePath("/[locale]/portal", "layout");
  return { ok: true, message: "Message sent." };
}

const mediaSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(1),
  url: z.string().url("Enter a valid URL.").refine(value => value.startsWith("https://"), "Use an HTTPS URL."),
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
  revalidatePath("/[locale]/portal", "layout");
  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]/projects", "page");
  revalidatePath("/[locale]", "page");
  return { ok: true, message: "Deliverable published." };
}
