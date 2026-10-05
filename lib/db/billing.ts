import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, projectBilling, projectMilestones, type Project } from "@/lib/db/schema";
import { type ProjectTransaction } from "@/lib/db/project-lifecycle";
import { getPayPalEnvironment } from "@/lib/paypal";
import { billingStages, installmentSchedule, installmentReadiness, type BillingStage } from "@/lib/installments";

/** Internal helper: caller must authenticate and authorize the project first. */
export async function billingState(project: Project, tx: ProjectTransaction | typeof db = db) {
  const [plan] = await tx.select().from(projectBilling).where(eq(projectBilling.projectId, project.id)).limit(1);
  if (!plan) return null;
  const rows = await tx.select().from(payments).where(and(eq(payments.projectId, project.id), eq(payments.environment, getPayPalEnvironment())));
  const milestones = await tx.select().from(projectMilestones).where(eq(projectMilestones.projectId, project.id));
  const schedule = plan.approvedTotalCents ? installmentSchedule(plan.approvedTotalCents) : [];
  const installments = schedule.map(item => ({ ...item, payment: rows.find(row => row.billingStage === item.stage) ?? null }));
  const { next, ready } = installmentReadiness(installments, milestones);
  return { plan, installments, next, ready, paidCents: installments.filter(i => i.payment?.status === "paid").reduce((sum, i) => sum + i.amountCents, 0) };
}

export async function isStagePaid(project: Project, stage: BillingStage, tx: ProjectTransaction) {
  const billing = await billingState(project, tx);
  if (billing) {
    const target = billingStages.indexOf(stage);
    return billing.installments.length === 6 && billing.installments.slice(0, target + 1).every(i => i.payment?.status === "paid");
  }
  const [payment] = await tx.select({ id: payments.id }).from(payments).where(and(eq(payments.projectId, project.id), eq(payments.environment, getPayPalEnvironment()), eq(payments.billingStage, "legacy"), eq(payments.status, "paid"))).limit(1);
  return !!payment;
}
