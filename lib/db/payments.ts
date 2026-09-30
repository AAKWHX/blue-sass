import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { payments, projectMilestones, projects, type Payment, type Project } from "@/lib/db/schema";
import { lifecycleState } from "@/lib/db/project-lifecycle";
import { reservationDeposit, type ProjectType } from "@/lib/pricing";
import { getPayPalEnvironment } from "@/lib/paypal";

const projectTypes = new Set<ProjectType>(["web", "mobile", "ai", "ecommerce", "erp", "brand"]);

export class PaymentAccessError extends Error {
  constructor(message = "Payment is not available for this project.") {
    super(message);
    this.name = "PaymentAccessError";
  }
}

export class PaymentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentConflictError";
  }
}

export function projectPaymentAmount(project: Project) {
  if (project.currency.toUpperCase() !== "EUR") {
    throw new PaymentAccessError("This project does not have a supported payment currency.");
  }
  if (project.industry === "subscription") {
    if (project.budget <= 0) throw new PaymentAccessError();
    return { amountCents: project.budget * 100, currency: "EUR" };
  }
  if (!projectTypes.has(project.industry as ProjectType)) {
    throw new PaymentAccessError("A payment amount has not been approved for this project.");
  }
  return {
    amountCents: reservationDeposit[project.industry as ProjectType] * 100,
    currency: "EUR",
  };
}

export async function getProjectPayment(projectId: string, userId: string) {
  if (!isDatabaseConfigured) return null;
  try {
    const [row] = await db
      .select({ payment: payments })
      .from(payments)
      .innerJoin(projects, eq(projects.id, payments.projectId))
      .where(and(eq(payments.projectId, projectId), eq(payments.environment, getPayPalEnvironment()), eq(projects.clientId, userId)))
      .limit(1);
    return row?.payment ?? null;
  } catch (error) {
    // Keep existing project pages available during the short deployment window
    // between shipping the code and applying the payment-table migration.
    if (error && typeof error === "object" && "code" in error && error.code === "42P01") return null;
    throw error;
  }
}

export async function preparePayPalPayment(projectId: string, userId: string) {
  if (!isDatabaseConfigured) throw new PaymentAccessError("The database is not configured.");

  return db.transaction(async (tx) => {
    const [project] = await tx
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.clientId, userId)))
      .for("update")
      .limit(1);
    if (!project) throw new PaymentAccessError();

    const lifecycle = await lifecycleState(projectId, tx);
    if (lifecycle.cancelled) throw new PaymentAccessError("A cancelled project cannot be paid.");

    const amount = projectPaymentAmount(project);
    const environment = getPayPalEnvironment();
    const [existing] = await tx
      .select()
      .from(payments)
      .where(and(eq(payments.projectId, projectId), eq(payments.environment, environment)))
      .for("update")
      .limit(1);

    if (existing?.status === "paid") {
      throw new PaymentConflictError("This project has already been paid.");
    }
    if (existing?.status === "pending" && existing.providerOrderId) {
      return { payment: existing, needsProviderOrder: false };
    }
    if (existing?.status === "pending") {
      const age = Date.now() - new Date(existing.updatedAt).getTime();
      if (age < 120_000) {
        throw new PaymentConflictError("A payment request is already being created. Please retry shortly.");
      }
    }

    if (existing) {
      const [payment] = await tx
        .update(payments)
        .set({
          userId,
          providerOrderId: null,
          providerCaptureId: null,
          status: "pending",
          amountCents: amount.amountCents,
          currency: amount.currency,
          attempt: existing.attempt + 1,
          failureCode: null,
          paidAt: null,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existing.id))
        .returning();
      return { payment, needsProviderOrder: true };
    }

    const [payment] = await tx
      .insert(payments)
      .values({ projectId, userId, environment, ...amount })
      .returning();
    return { payment, needsProviderOrder: true };
  });
}

export async function attachPayPalOrder(payment: Payment, orderId: string) {
  const [updated] = await db
    .update(payments)
    .set({ providerOrderId: orderId, updatedAt: new Date() })
    .where(
      and(
        eq(payments.id, payment.id),
        eq(payments.attempt, payment.attempt),
        eq(payments.status, "pending"),
      ),
    )
    .returning();
  if (!updated) throw new PaymentConflictError("The payment request changed before PayPal responded.");
  return updated;
}

export async function getOwnedPayPalPayment(orderId: string, userId: string) {
  const [row] = await db
    .select({ payment: payments, project: projects })
    .from(payments)
    .innerJoin(projects, eq(projects.id, payments.projectId))
    .where(and(eq(payments.providerOrderId, orderId), eq(payments.environment, getPayPalEnvironment()), eq(projects.clientId, userId)))
    .limit(1);
  if (!row) throw new PaymentAccessError();
  return row;
}

export async function markPaymentPaid(payment: Payment, captureId: string) {
  const updated = await db.transaction(async (tx) => {
    const now = new Date();
    const [paid] = await tx.update(payments).set({ status: "paid", providerCaptureId: captureId, failureCode: null, paidAt: now, updatedAt: now }).where(and(eq(payments.id, payment.id), eq(payments.status, "pending"))).returning();
    if (!paid) return null;
    await tx.update(projects).set({ startDate: now, updatedAt: now }).where(eq(projects.id, paid.projectId));
    const [first] = await tx.select({ id: projectMilestones.id }).from(projectMilestones).where(eq(projectMilestones.projectId, paid.projectId)).orderBy(asc(projectMilestones.orderIndex)).limit(1);
    if (first) await tx.update(projectMilestones).set({ status: "in_progress" }).where(eq(projectMilestones.id, first.id));
    return paid;
  });
  if (updated) return updated;
  const [current] = await db.select().from(payments).where(eq(payments.id, payment.id)).limit(1);
  if (current?.status === "paid") return current;
  throw new PaymentConflictError("The payment state changed before it could be recorded.");
}

export async function markPaymentFailed(paymentId: string, code: string) {
  await db
    .update(payments)
    .set({ status: "failed", failureCode: code.slice(0, 120), updatedAt: new Date() })
    .where(and(eq(payments.id, paymentId), eq(payments.status, "pending")));
}

export async function markPaymentPending(paymentId: string, code?: string) {
  await db
    .update(payments)
    .set({ failureCode: code?.slice(0, 120) ?? null, updatedAt: new Date() })
    .where(and(eq(payments.id, paymentId), eq(payments.status, "pending")));
}

export async function cancelPayPalPayment(orderId: string, userId: string) {
  const { payment } = await getOwnedPayPalPayment(orderId, userId);
  if (payment.status === "paid") throw new PaymentConflictError("A completed payment cannot be cancelled.");
  await markPaymentFailed(payment.id, "BUYER_CANCELLED");
  return payment;
}
