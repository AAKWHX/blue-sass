import "server-only";
import { and, asc, eq, isNull, inArray, or } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { payments, projectMilestones, projectRequests, projects, projectAgreements, type Payment, type Project } from "@/lib/db/schema";
import { lifecycleState } from "@/lib/db/project-lifecycle";
import { getPayPalEnvironment } from "@/lib/paypal";
import { billingState } from "@/lib/db/billing";
import { lockProject, type ProjectTransaction } from "@/lib/db/project-lifecycle";
import { getPayPalOrder, moneyValue, verifiedCompletedCapture } from "@/lib/paypal";


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

export function projectPaymentAmount(project: Project): { amountCents: number; currency: string } {
  if (project.currency.toUpperCase() !== "EUR") {
    throw new PaymentAccessError("This project does not have a supported payment currency.");
  }

  throw new PaymentAccessError("An approved installment plan is required before payment.");
}
export async function payableProjectAmount(project:Project,tx:Parameters<typeof lockProject>[0]|typeof db=db,lock=false){
 if(project.currency.toUpperCase()!=="EUR")throw new PaymentAccessError();

 return projectPaymentAmount(project);
}

export async function getProjectPayment(projectId: string, userId: string) {
  if (!isDatabaseConfigured) return null;
  try {
    const [project] = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.clientId, userId))).limit(1);
    if (!project) return null;
    const billing = await billingState(project);
    if (billing) return billing.next?.payment ?? (billing.installments.length === 6 && !billing.next ? billing.installments.at(-1)?.payment : null) ?? null;
    const [row] = await db
      .select({ payment: payments })
      .from(payments)
      .innerJoin(projects, eq(projects.id, payments.projectId))
      .where(and(eq(payments.projectId, projectId), eq(payments.environment, getPayPalEnvironment()), eq(payments.billingStage, "legacy"), eq(projects.clientId, userId)))
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
  return prepareProviderPayment(projectId,userId,"paypal");
}

export async function prepareProviderPayment(projectId: string, userId: string, provider:"paypal"|"stripe") {
  if (!isDatabaseConfigured) throw new PaymentAccessError("The database is not configured.");

  return db.transaction(async (tx) => {
    const [project] = await tx
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.clientId, userId)))
      .for("update")
      .limit(1);
    if (!project || project.industry === "commerce" || project.industry === "subscription") throw new PaymentAccessError();

    if(project.currency.toUpperCase()!=="EUR")throw new PaymentAccessError("Unsupported project currency.");
    const lifecycle = await lifecycleState(projectId, tx);
    if (lifecycle.cancelled) throw new PaymentAccessError("A cancelled project cannot be paid.");

    const billing = await billingState(project, tx);
    const [scope] = await tx.select().from(projectAgreements).where(eq(projectAgreements.projectId, projectId)).limit(1);
    if (scope && (!scope.agreement.acceptedAt || scope.agreement.acceptedBy !== userId || scope.agreement.priceCents !== billing?.plan.approvedTotalCents)) throw new PaymentAccessError("Project scope approval is required before payment.");
    if (billing && (!billing.plan.approvedTotalCents || !billing.next || !billing.ready)) throw new PaymentAccessError("The approved stage is not ready for payment.");
    const amount = billing?.next ? { amountCents: billing.next.amountCents, currency: "EUR" } : await payableProjectAmount(project,tx,true);
    const billingStage = billing?.next?.stage ?? "legacy";
    const environment = getPayPalEnvironment();
    const [existing] = await tx
      .select()
      .from(payments)
      .where(and(eq(payments.projectId, projectId), eq(payments.environment, environment), eq(payments.billingStage, billingStage)))
      .for("update")
      .limit(1);

    if(existing && existing.provider !== provider && existing.status === "pending") throw new PaymentConflictError("Another provider already holds this installment.");
    if (existing?.status === "paid") {
      throw new PaymentConflictError("This project has already been paid.");
    }
    if (existing?.status === "failed" && !["STRIPE_EXPIRED", "PAYPAL_VOIDED"].includes(existing.failureCode ?? "")) throw new PaymentConflictError("Previous failure requires provider confirmation.");
    if (existing?.captureStartedAt && existing.status !== "pending") throw new PaymentConflictError("A previous capture requires reconciliation.");
    if (existing?.status === "pending" && existing.failureCode === "PAYPAL_CANCEL_REQUESTED") throw new PaymentConflictError("Cancellation requires provider confirmation.");
    if (existing?.status === "pending" && existing.providerOrderId) {
      return { payment: existing, needsProviderOrder: false };
    }
    if (existing?.status === "pending") {
      // A lost create response is not evidence of failure. Reuse exactly the
      // same attempt and provider idempotency key; never release to another provider.
      const retryWindow = provider === "stripe" ? 23 * 60 * 60_000 : 60 * 60_000;
      if (Date.now() - existing.updatedAt.getTime() > retryWindow) throw new PaymentConflictError("Provider confirmation requires review.");
      return { payment: existing, needsProviderOrder: true };
    }

    if (existing) {
      const [payment] = await tx
        .update(payments)
        .set({
          userId,
          provider,
          providerOrderId: null,
          providerCaptureId: null,
          status: "pending",
          amountCents: amount.amountCents,
          currency: amount.currency,
          attempt: existing.attempt + 1,
          failureCode: null,
          captureStartedAt: null,
          paidAt: null,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existing.id))
        .returning();
      return { payment, needsProviderOrder: true };
    }

    const [payment] = await tx
      .insert(payments)
      .values({ projectId, userId, provider, environment, billingStage, ...amount })
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
    .where(and(eq(payments.providerOrderId, orderId), eq(payments.provider, "paypal"), eq(payments.environment, getPayPalEnvironment()), eq(projects.clientId, userId)))
    .limit(1);
  if (!row || row.project.industry === "commerce" || row.project.industry === "subscription") throw new PaymentAccessError();
  return row;
}

export async function markPaymentPaid(payment: Payment, captureId: string, transaction?: ProjectTransaction) {
  const settle = async (tx: ProjectTransaction) => {
    const now = new Date();
    const project = await lockProject(tx, payment.projectId);
    if (!project) throw new PaymentAccessError();
    const [paid] = await tx.update(payments).set({ status: "paid", providerCaptureId: captureId, failureCode: null, paidAt: now, updatedAt: now }).where(and(eq(payments.id, payment.id), eq(payments.attempt, payment.attempt), eq(payments.providerOrderId, payment.providerOrderId!), eq(payments.provider,payment.provider), or(eq(payments.status,"pending"),and(eq(payments.status,"failed"),isNull(payments.captureStartedAt))))).returning();
    if (!paid) {
      const [current] = await tx.select().from(payments).where(eq(payments.id, payment.id)).limit(1);
      if (current?.status === "paid" && current.provider === payment.provider && current.environment === payment.environment && current.providerOrderId === payment.providerOrderId && current.providerCaptureId === captureId && current.attempt === payment.attempt) return current;
      throw new PaymentConflictError("The payment state changed before it could be recorded.");
    }
    if ((await lifecycleState(project.id, tx)).cancelled) return paid;
    const [request] = await tx.select({ configuration: projectRequests.configuration }).from(projectRequests).where(eq(projectRequests.projectId, paid.projectId)).limit(1);
    const [scope] = await tx.select().from(projectAgreements).where(eq(projectAgreements.projectId, paid.projectId)).limit(1);
    const days = scope?.agreement.acceptedAt ? scope.agreement.deliveryDays : request?.configuration.deliveryDays;
    const firstPayment = payment.billingStage === "legacy" || payment.billingStage === "planning";
    if (firstPayment) await tx.update(projects).set({ startDate: now, ...(days ? { deadline: new Date(now.getTime() + days * 86_400_000) } : {}), updatedAt: now }).where(eq(projects.id, paid.projectId));
    if (days && firstPayment) {
      const milestones = await tx.select({ id: projectMilestones.id }).from(projectMilestones).where(eq(projectMilestones.projectId, paid.projectId)).orderBy(asc(projectMilestones.orderIndex));
      for (const [index, milestone] of milestones.entries()) await tx.update(projectMilestones).set({ dueDate: new Date(now.getTime() + Math.ceil(days * (index + 1) / Math.max(1, milestones.length)) * 86_400_000) }).where(eq(projectMilestones.id, milestone.id));
    }
    const [first] = await tx.select({ id: projectMilestones.id }).from(projectMilestones).where(and(eq(projectMilestones.projectId, paid.projectId), ...(payment.billingStage === "legacy" ? [] : [eq(projectMilestones.stage, payment.billingStage as Project["stage"])]))).orderBy(asc(projectMilestones.orderIndex)).limit(1);
    if (first) await tx.update(projectMilestones).set({ status: "in_progress" }).where(eq(projectMilestones.id, first.id));
    return paid;
  };
  return transaction ? settle(transaction) : db.transaction(settle);
}

export async function markPaymentFailed(paymentId: string, code: string, attempt: number) {
  await db
    .update(payments)
    .set({ status: "failed", failureCode: code.slice(0, 120), updatedAt: new Date() })
    .where(and(eq(payments.id, paymentId), eq(payments.attempt, attempt), eq(payments.status, "pending"), isNull(payments.captureStartedAt)));
}

export async function markPaymentPending(paymentId: string, code?: string) {
  await db
    .update(payments)
    .set({ failureCode: code?.slice(0, 120) ?? null, updatedAt: new Date() })
    .where(and(eq(payments.id, paymentId), eq(payments.status, "pending")));
}

export async function cancelPayPalPayment(orderId: string, userId: string) {
  const { payment } = await getOwnedPayPalPayment(orderId, userId);
  return db.transaction(async tx => {
    const project = await lockProject(tx, payment.projectId);
    const [current] = await tx.select().from(payments).where(eq(payments.id, payment.id)).for("update");
    if (!project || project.clientId !== userId || !current || current.provider !== "paypal" || current.attempt !== payment.attempt || current.providerOrderId !== orderId) throw new PaymentConflictError("Payment changed.");
    if (current.status === "paid") return current;
    if (current.status !== "pending" || current.captureStartedAt) throw new PaymentConflictError("Payment confirmation is in progress or completed.");
    // Orders v2 has no general cancel endpoint. A buyer closing the popup is
    // not a provider-confirmed void. A failed read leaves the reservation intact.
    let order;
    try { order = await getPayPalOrder(orderId); }
    catch {
      const [held] = await tx.update(payments).set({failureCode: "PAYPAL_CANCEL_REQUESTED", updatedAt: new Date()}).where(eq(payments.id, current.id)).returning();
      return held;
    }
    const unit = order.purchase_units?.[0];
    if (order.id !== orderId || order.intent !== "CAPTURE" || order.purchase_units?.length !== 1 || unit?.custom_id !== current.id || unit.amount?.currency_code !== current.currency || unit.amount.value !== moneyValue(current.amountCents)) throw new PaymentConflictError("Provider identity mismatch.");
    const capture = verifiedCompletedCapture(order, { orderId, paymentId: current.id, amountCents: current.amountCents, currency: current.currency });
    if (capture) return markPaymentPaid(current, capture.id, tx);
    const confirmedVoid = order.status === "VOIDED" && !(unit.payments?.captures?.length);
    const [updated] = await tx.update(payments).set({status: confirmedVoid ? "failed" : "pending", failureCode: confirmedVoid ? "PAYPAL_VOIDED" : "PAYPAL_CANCEL_REQUESTED", updatedAt: new Date()}).where(eq(payments.id, current.id)).returning();
    return updated;
  });
}

/** Claim before contacting PayPal; cancellation and a new attempt cannot pass this lock. */
export async function beginPaymentCapture(payment: Payment) {
  return db.transaction(async tx => {
    const project = await lockProject(tx, payment.projectId);
    const [current] = await tx.select().from(payments).where(eq(payments.id, payment.id)).for("update");
    if (!project || !current || current.attempt !== payment.attempt || current.providerOrderId !== payment.providerOrderId || current.status !== "pending" || current.failureCode === "PAYPAL_CANCEL_REQUESTED") throw new PaymentConflictError("Payment changed before confirmation.");
    if ((await lifecycleState(project.id, tx)).cancelled) throw new PaymentAccessError();
    if (["subscription", "commerce"].includes(project.industry)) throw new PaymentAccessError();
    const billing = await billingState(project, tx);
    if (!["subscription", "commerce"].includes(project.industry) && (!billing?.ready || billing.next?.stage !== current.billingStage || billing.next.amountCents !== current.amountCents)) throw new PaymentAccessError();
    if (current.captureStartedAt && Date.now() - current.captureStartedAt.getTime() < 90_000) throw new PaymentConflictError("Confirmation is already in progress.");
    await tx.update(payments).set({ captureStartedAt: new Date(), updatedAt: new Date() }).where(eq(payments.id, current.id));
    return current;
  });
}
