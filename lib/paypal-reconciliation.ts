import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, type Payment } from "@/lib/db/schema";
import { markPaymentPaid } from "@/lib/db/payments";
import { lockProject } from "@/lib/db/project-lifecycle";
import { PaymentConflictError } from "@/lib/db/payments";
import { getPayPalOrder, moneyValue, verifiedCompletedCapture } from "@/lib/paypal";

/** Read provider state; never initiate a charge during reconciliation. */
export async function reconcilePayment(payment: Payment) {
  if (payment.provider !== "paypal") throw new Error("INVALID_PAYMENT_PROVIDER");
  if (!payment.providerOrderId) return payment.status;
  return db.transaction(async tx => {
    await lockProject(tx, payment.projectId);
    const [current] = await tx.select().from(payments).where(eq(payments.id, payment.id)).for("update");
    if (!current || current.provider !== "paypal" || current.environment !== payment.environment || current.attempt !== payment.attempt || current.providerOrderId !== payment.providerOrderId) throw new PaymentConflictError("Payment changed during reconciliation.");
    const order = await getPayPalOrder(current.providerOrderId!);
    const unit = order.purchase_units?.[0];
    if (order.id !== current.providerOrderId || order.intent !== "CAPTURE" || order.purchase_units?.length !== 1 || unit?.custom_id !== current.id) throw new PaymentConflictError("Provider identity mismatch.");
    const captures = unit.payments?.captures ?? [];
    const held = captures.length === 1 ? captures.find(item => ["REFUNDED", "PARTIALLY_REFUNDED", "REVERSED"].includes(item.status)) : undefined;
    if (held && (!current.providerCaptureId || held.id === current.providerCaptureId) && held.amount?.currency_code === current.currency && held.amount.value === moneyValue(current.amountCents)) {
      await tx.update(payments).set({status: "failed", failureCode: `PAYPAL_${held.status}`, providerCaptureId: held.id, captureStartedAt: new Date(), updatedAt: new Date()}).where(eq(payments.id, current.id));
      return "failed";
    }
    const capture = verifiedCompletedCapture(order, {orderId: current.providerOrderId!, paymentId: current.id, amountCents: current.amountCents, currency: current.currency});
    if (capture) { await markPaymentPaid(current, capture.id, tx); return "paid"; }
    if (order.status === "VOIDED" && captures.length === 0 && current.status !== "paid" && !current.captureStartedAt && unit.amount?.currency_code === current.currency && unit.amount.value === moneyValue(current.amountCents)) {
      await tx.update(payments).set({status: "failed", failureCode: "PAYPAL_VOIDED", updatedAt: new Date()}).where(eq(payments.id, current.id));
      return "failed";
    }
    return current.status;
  });
}
