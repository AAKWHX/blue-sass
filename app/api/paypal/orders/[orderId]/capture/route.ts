import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/api-security";
import { assertCanWrite, AuthorisationError, requireViewer } from "@/lib/db/access";
import {
  getOwnedPayPalPayment,
  markPaymentFailed,
  markPaymentPaid,
  markPaymentPending,
  PaymentAccessError,
  PaymentConflictError,
} from "@/lib/db/payments";
import {
  capturePayPalOrder,
  PayPalApiError,
  PayPalConfigurationError,
  verifiedCompletedCapture,
} from "@/lib/paypal";
import { purchaseConfirmationEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/site-url";

const orderIdSchema = z.string().min(6).max(64).regex(/^[A-Za-z0-9_-]+$/);

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  let paymentId: string | undefined;
  try {
    assertSameOrigin(request);
    const viewer = await requireViewer();
    assertCanWrite(viewer);
    const orderId = orderIdSchema.parse((await params).orderId);
    const { payment, project } = await getOwnedPayPalPayment(orderId, viewer.id);
    paymentId = payment.id;

    if (payment.status === "paid") {
      return NextResponse.json({ status: "paid" });
    }
    if (payment.status === "failed") {
      return NextResponse.json({ error: "PAYMENT_FAILED" }, { status: 409 });
    }

    const order = await capturePayPalOrder(orderId, payment.id, payment.attempt);
    const capture = verifiedCompletedCapture(order, {
      orderId,
      paymentId: payment.id,
      amountCents: payment.amountCents,
      currency: payment.currency,
    });
    if (capture) {
      const paid = await markPaymentPaid(payment, capture.id);
      const siteUrl = await getSiteUrl();
      const message = purchaseConfirmationEmail(viewer.locale, {
        projectName: project.name,
        amount: new Intl.NumberFormat(viewer.locale, { style: "currency", currency: payment.currency }).format(payment.amountCents / 100),
        reference: capture.id,
        paidAt: paid.paidAt ?? new Date(),
        portalUrl: `${siteUrl}/${viewer.locale}/portal/projects/${project.id}`,
        siteUrl,
      });
      await sendEmail({ to: viewer.email, ...message }).catch(() => undefined);
      return NextResponse.json({ status: "paid" });
    }

    const captures = order.purchase_units?.flatMap((unit) => unit.payments?.captures ?? []) ?? [];
    if (order.status === "COMPLETED" || captures.some((item) => item.status === "DECLINED" || item.status === "FAILED")) {
      await markPaymentFailed(payment.id, order.status === "COMPLETED" ? "VERIFICATION_FAILED" : "PAYPAL_DECLINED");
      return NextResponse.json({ error: "PAYMENT_NOT_COMPLETED" }, { status: 422 });
    }

    await markPaymentPending(payment.id, `PAYPAL_${order.status}`);
    return NextResponse.json({ status: "pending" }, { status: 202 });
  } catch (error) {
    if (paymentId && error instanceof PayPalApiError && error.status >= 400 && error.status < 500) {
      await markPaymentFailed(paymentId, error.issue ?? "PAYPAL_CAPTURE_REJECTED").catch(() => undefined);
    }
    if (error instanceof z.ZodError) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    if (error instanceof AuthorisationError) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    if (error instanceof PaymentAccessError) return NextResponse.json({ error: "PAYMENT_UNAVAILABLE" }, { status: 403 });
    if (error instanceof PaymentConflictError) return NextResponse.json({ error: "PAYMENT_CONFLICT" }, { status: 409 });
    if (error instanceof PayPalConfigurationError) return NextResponse.json({ error: "PAYPAL_NOT_CONFIGURED" }, { status: 503 });
    if (error instanceof PayPalApiError) return NextResponse.json({ error: "PAYPAL_CAPTURE_FAILED" }, { status: 502 });
    if (error instanceof Error && error.message === "UNTRUSTED_ORIGIN") return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
    return NextResponse.json({ error: "PAYMENT_ERROR" }, { status: 500 });
  }
}
