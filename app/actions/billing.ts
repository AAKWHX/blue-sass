"use server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission, assertCanViewProject } from "@/lib/db/access";
import { db } from "@/lib/db";
import { projectBilling, payments, adminAudit, projectAgreements } from "@/lib/db/schema";
import { lifecycleState, lockProject } from "@/lib/db/project-lifecycle";

export type PriceApprovalState = { code: "idle" | "saved" | "invalid" | "locked" };
export async function approveProjectPrice(_state: PriceApprovalState, form: FormData): Promise<PriceApprovalState> {
  const viewer = await requirePermission("billing.approve");
  const input = z.object({ projectId: z.string().uuid(), amount: z.string().regex(/^\d{1,7}(\.\d{1,2})?$/) }).safeParse(Object.fromEntries(form));
  if (!input.success) return { code: "invalid" };
  await assertCanViewProject(input.data.projectId);
  const cents = Math.round(Number(input.data.amount) * 100);
  if (cents < 100 || cents > 100_000_000) return { code: "invalid" };
  const saved = await db.transaction(async tx => {
    const project = await lockProject(tx, input.data.projectId);
    const lifecycle = project ? await lifecycleState(project.id, tx) : null;
    if (!project || !project.clientId || project.currency !== "EUR" || project.stage !== "planning" || lifecycle?.cancelled || lifecycle?.locked) return false;
    const [billing] = await tx.select().from(projectBilling).where(eq(projectBilling.projectId, project.id)).limit(1);
    if (!billing) return false;
    const [active] = await tx.select({ id: payments.id }).from(payments).where(and(eq(payments.projectId, project.id), inArray(payments.status, ["pending", "paid"]))).limit(1);
    if (active) return false;
    await tx.update(projectBilling).set({ approvedTotalCents: cents, approvedBy: viewer.id, approvedAt: new Date() }).where(eq(projectBilling.projectId, project.id));
    const [scope] = await tx.select().from(projectAgreements).where(eq(projectAgreements.projectId, project.id)).limit(1);
    if (scope && scope.agreement.priceCents !== cents) await tx.update(projectAgreements).set({ agreement: { ...scope.agreement, version: scope.agreement.version + 1, priceCents: cents, acceptedAt: null, acceptedBy: null }, updatedBy: viewer.id, updatedAt: new Date() }).where(eq(projectAgreements.projectId, project.id));
    await tx.insert(adminAudit).values({ actorId: viewer.id, targetId: project.id, action: "price.approved", details: { previousCents: billing.approvedTotalCents, approvedCents: cents } });
    return true;
  });
  revalidatePath("/[locale]/portal", "layout");
  revalidatePath("/[locale]/admin", "page");
  return { code: saved ? "saved" : "locked" };
}
