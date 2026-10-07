import "server-only";
import { and, asc, eq, isNull, inArray } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { payments, projectMilestones, projectRequests, projects, projectAgreements, marketplaceOrders, marketplaceListings, subscriptionOrders, type Payment, type Project } from "@/lib/db/schema";
import { lifecycleState } from "@/lib/db/project-lifecycle";
import { getPayPalEnvironment } from "@/lib/paypal";
import { billingState } from "@/lib/db/billing";
import { lockProject } from "@/lib/db/project-lifecycle";
import { commerceOrderPrice } from "@/lib/marketplace";


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
  if (project.industry === "subscription" || project.industry === "commerce") {
    if (project.budget <= 0) throw new PaymentAccessError();
    return { amountCents: project.budget * 100, currency: "EUR" };
  }
  throw new PaymentAccessError("An approved installment plan is required before payment.");
}
export async function payableProjectAmount(project:Project,tx:Parameters<typeof lockProject>[0]|typeof db=db,lock=false){
 if(project.currency.toUpperCase()!=="EUR")throw new PaymentAccessError();
 if(project.industry==="commerce"){
  const query=tx.select({snapshot:marketplaceOrders.snapshot,kind:marketplaceOrders.kind,status:marketplaceListings.status,listingKind:marketplaceListings.kind,platform:marketplaceListings.platformProduct,asset:marketplaceListings.assetName}).from(marketplaceOrders).innerJoin(marketplaceListings,eq(marketplaceListings.id,marketplaceOrders.listingId)).where(eq(marketplaceOrders.projectId,project.id));
  const [order]=await (lock?query.for("update"):query).limit(1);
  if(!order||order.status!=="approved"||order.kind!==order.listingKind||project.currency!=="EUR"||(order.kind==="product"&&(!order.platform||!order.asset)))throw new PaymentAccessError("The listing must be approved before payment.");
  return {amountCents:commerceOrderPrice(order.kind,order.snapshot),currency:"EUR"};
 }
 if(project.industry==="subscription"){const [order]=await tx.select({snapshot:subscriptionOrders.snapshot}).from(subscriptionOrders).where(eq(subscriptionOrders.projectId,project.id));if(order){if(!Number.isInteger(order.snapshot.price)||order.snapshot.price<=0)throw new PaymentAccessError();return {amountCents:order.snapshot.price*100,currency:"EUR"};}}
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

    if (existing?.status === "paid") {
      throw new PaymentConflictError("This project has already been paid.");
    }
    if (existing?.captureStartedAt && existing.status !== "pending") throw new PaymentConflictError("A previous capture requires reconciliation.");
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
      .values({ projectId, userId, environment, billingStage, ...amount })
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
    const project = await lockProject(tx, payment.projectId);
    if (!project) throw new PaymentAccessError();
    const [paid] = await tx.update(payments).set({ status: "paid", providerCaptureId: captureId, failureCode: null, paidAt: now, updatedAt: now }).where(and(eq(payments.id, payment.id), eq(payments.attempt, payment.attempt), eq(payments.providerOrderId, payment.providerOrderId!), inArray(payments.status, ["pending", "failed"]))).returning();
    if (!paid) return null;
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
  });
  if (updated) return updated;
  const [current] = await db.select().from(payments).where(eq(payments.id, payment.id)).limit(1);
  if (current?.status === "paid" && current.providerCaptureId === captureId && current.attempt === payment.attempt) return current;
  throw new PaymentConflictError("The payment state changed before it could be recorded.");
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
  await db.transaction(async tx => {
    await lockProject(tx, payment.projectId);
    const [current] = await tx.select().from(payments).where(eq(payments.id, payment.id)).for("update");
    if (!current || current.providerOrderId !== orderId || current.status === "paid" || current.captureStartedAt) throw new PaymentConflictError("Payment confirmation is in progress or completed.");
    await tx.update(payments).set({ status: "failed", failureCode: "BUYER_CANCELLED", updatedAt: new Date() }).where(and(eq(payments.id, current.id), eq(payments.attempt, current.attempt)));
  });
  return payment;
}

/** Claim before contacting PayPal; cancellation and a new attempt cannot pass this lock. */
export async function beginPaymentCapture(payment: Payment) {
  return db.transaction(async tx => {
    const project = await lockProject(tx, payment.projectId);
    const [current] = await tx.select().from(payments).where(eq(payments.id, payment.id)).for("update");
    if (!project || !current || current.attempt !== payment.attempt || current.providerOrderId !== payment.providerOrderId || current.status !== "pending") throw new PaymentConflictError("Payment changed before confirmation.");
    if ((await lifecycleState(project.id, tx)).cancelled) throw new PaymentAccessError();
    if(["subscription","commerce"].includes(project.industry)){const expected=await payableProjectAmount(project,tx,true);if(expected.amountCents!==current.amountCents||expected.currency!==current.currency)throw new PaymentAccessError();}
    const billing = await billingState(project, tx);
    if (!["subscription", "commerce"].includes(project.industry) && (!billing?.ready || billing.next?.stage !== current.billingStage || billing.next.amountCents !== current.amountCents)) throw new PaymentAccessError();
    if (current.captureStartedAt && Date.now() - current.captureStartedAt.getTime() < 90_000) throw new PaymentConflictError("Confirmation is already in progress.");
    await tx.update(payments).set({ captureStartedAt: new Date(), updatedAt: new Date() }).where(eq(payments.id, current.id));
    return current;
  });
}
