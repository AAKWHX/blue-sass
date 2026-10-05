"use server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/db/access";
import { db } from "@/lib/db";
import { projectBilling, payments } from "@/lib/db/schema";
import { lifecycleState, lockProject } from "@/lib/db/project-lifecycle";

export async function approveProjectPrice(form: FormData) {
  const viewer = await requireRole("super_admin", "admin", "pm");
  const input = z.object({ projectId: z.string().uuid(), amount: z.string().regex(/^\d{1,7}(\.\d{1,2})?$/) }).safeParse(Object.fromEntries(form));
  if (!input.success) return;
  const cents = Math.round(Number(input.data.amount) * 100);
  if (cents < 100 || cents > 100_000_000) return;
  await db.transaction(async tx => {
    const project = await lockProject(tx, input.data.projectId);
    if (!project || !project.clientId || project.currency !== "EUR" || project.stage !== "planning" || (await lifecycleState(project.id, tx)).cancelled) return;
    const [billing] = await tx.select().from(projectBilling).where(eq(projectBilling.projectId, project.id)).limit(1);
    if (!billing) return; // Never change legacy orders into a different billing contract.
    const [active] = await tx.select({ id: payments.id }).from(payments).where(and(eq(payments.projectId, project.id), inArray(payments.status, ["pending", "paid"]))).limit(1);
    if (active) return;
    await tx.update(projectBilling).set({ approvedTotalCents: cents, approvedBy: viewer.id, approvedAt: new Date() }).where(eq(projectBilling.projectId, project.id));
  });
  revalidatePath("/[locale]/portal", "layout");
  revalidatePath("/[locale]/admin", "page");
}
