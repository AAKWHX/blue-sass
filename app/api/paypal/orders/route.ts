import { NextResponse } from "next/server";
import { z } from "zod";
import { assertCanWrite, AuthorisationError, requireViewer } from "@/lib/db/access";
import {
  attachPayPalOrder,
  markPaymentFailed,
  PaymentAccessError,
  PaymentConflictError,
  preparePayPalPayment,
} from "@/lib/db/payments";
import { createPayPalOrder, PayPalApiError, PayPalConfigurationError } from "@/lib/paypal";
import { assertSameOrigin } from "@/lib/api-security";
import { takeRateLimit } from "@/lib/rate-limit";
import { readBoundedText } from "@/lib/request-body";

const bodySchema = z.object({ projectId: z.string().uuid() }).strict();

export async function POST(request: Request) {
  let paymentId: string | undefined;
  let attempt = 0;
  try {
    assertSameOrigin(request, true);
    const viewer = await requireViewer();
    assertCanWrite(viewer);
    if (!(await takeRateLimit(`paypal-create:${viewer.id}`, 10, 60_000))) return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    const body = bodySchema.parse(JSON.parse(await readBoundedText(request, 1024)));
    const prepared = await preparePayPalPayment(body.projectId, viewer.id);
    paymentId = prepared.payment.id;
    attempt = prepared.payment.attempt;

    if (!prepared.needsProviderOrder && prepared.payment.providerOrderId) {
      return NextResponse.json({ orderId: prepared.payment.providerOrderId });
    }

    const order = await createPayPalOrder({
      paymentId: prepared.payment.id,
      amountCents: prepared.payment.amountCents,
      currency: prepared.payment.currency,
      attempt: prepared.payment.attempt,
    });
    if (!order.id) throw new PayPalApiError("PayPal did not return an order ID.", 502);
    await attachPayPalOrder(prepared.payment, order.id);
    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    if (paymentId) await markPaymentFailed(paymentId, error instanceof PayPalApiError ? error.issue ?? "PAYPAL_CREATE_FAILED" : "CREATE_FAILED", attempt).catch(() => undefined);
    if (error instanceof Error && error.message === "BODY_TOO_LARGE") return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 413 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    if (error instanceof AuthorisationError) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    if (error instanceof PaymentAccessError) return NextResponse.json({ error: "PAYMENT_UNAVAILABLE" }, { status: 403 });
    if (error instanceof PaymentConflictError) return NextResponse.json({ error: "PAYMENT_CONFLICT" }, { status: 409 });
    if (error instanceof PayPalConfigurationError) return NextResponse.json({ error: "PAYPAL_NOT_CONFIGURED" }, { status: 503 });
    if (error instanceof PayPalApiError) return NextResponse.json({ error: "PAYPAL_CREATE_FAILED" }, { status: 502 });
    if (error instanceof Error && error.message === "UNTRUSTED_ORIGIN") return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
    return NextResponse.json({ error: "PAYMENT_ERROR" }, { status: 500 });
  }
}
