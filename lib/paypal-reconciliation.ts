import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, type Payment } from "@/lib/db/schema";
import { markPaymentPaid } from "@/lib/db/payments";
import { getPayPalOrder, moneyValue, verifiedCompletedCapture } from "@/lib/paypal";

/** Read provider state; never initiate a charge during reconciliation. */
export async function reconcilePayment(payment: Payment) {
  if (!payment.providerOrderId) return payment.status;
  const order = await getPayPalOrder(payment.providerOrderId);
  const capture = verifiedCompletedCapture(order, { orderId: payment.providerOrderId, paymentId: payment.id, amountCents: payment.amountCents, currency: payment.currency });
  if (capture) { await markPaymentPaid(payment, capture.id); return "paid"; }
  const unit = order.purchase_units?.[0];
  const held = unit?.payments?.captures?.find(item => ["REFUNDED", "PARTIALLY_REFUNDED", "REVERSED"].includes(item.status));
  if (order.id === payment.providerOrderId && order.purchase_units?.length === 1 && unit?.custom_id === payment.id && held && held.id === payment.providerCaptureId && held.amount?.currency_code === payment.currency && held.amount.value === moneyValue(payment.amountCents)) {
    await db.update(payments).set({ status: "failed", failureCode: `PAYPAL_${held.status}`, captureStartedAt: new Date(), updatedAt: new Date() }).where(and(eq(payments.id, payment.id), eq(payments.attempt, payment.attempt), eq(payments.providerOrderId, payment.providerOrderId)));
    return "failed";
  }
  return payment.status;
}
