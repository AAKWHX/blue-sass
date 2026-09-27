"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { assertCanWrite, requireViewer } from "@/lib/db/access";
import { lifecycleState, lockProject, recordLifecycle } from "@/lib/db/project-lifecycle";
import { experience } from "@/lib/i18n/experience";
import { isLocale } from "@/lib/i18n/config";
import { canChangeRequest } from "@/lib/project-policy";

const schema = z.object({ projectId: z.string().uuid(), operation: z.enum(["edit", "cancel"]), name: z.string().trim().min(2).max(120), summary: z.string().trim().min(3).max(4000), confirmed: z.string().optional() });
export async function updateClientProject(_previous: { ok: boolean; message: string }, form: FormData) {
 const locale = form.get("locale");
 const c = experience(isLocale(locale as string) ? locale as Parameters<typeof experience>[0] : "en");
 const fail = { ok: false, message: c.error };
 if (!isDatabaseConfigured) return fail;
 const parsed = schema.safeParse(Object.fromEntries(form));
 if (!parsed.success) return fail;
 const viewer = await requireViewer();
 assertCanWrite(viewer);
 const { projectId, operation, name, summary, confirmed } = parsed.data;
 const ok = await db.transaction(async tx => {
  const project = await lockProject(tx, projectId);
  if (!project) return false;
  const state = await lifecycleState(projectId, tx);
  if (!canChangeRequest(project, viewer.id, state)) return false;
  if (operation === "cancel") {
   if (confirmed !== "yes") return false;
   await recordLifecycle(tx, projectId, "cancelled", viewer.id);
   await tx.update(projects).set({ visibility: "private", updatedAt: new Date() }).where(eq(projects.id, projectId));
  } else {
   await tx.update(projects).set({ name, summary, updatedAt: new Date() }).where(eq(projects.id, projectId));
  }
  return true;
 });
 if (!ok) return fail;
 revalidatePath("/[locale]/portal", "layout");
 revalidatePath("/[locale]/admin", "page");
 revalidatePath("/[locale]/projects", "page");
 revalidatePath("/[locale]", "page");
 return { ok: true, message: operation === "cancel" ? c.cancelled : c.saved };
}
