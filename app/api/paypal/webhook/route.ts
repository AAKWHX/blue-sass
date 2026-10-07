import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { getPayPalEnvironment, verifyPayPalWebhook } from "@/lib/paypal";
import { reconcilePayment } from "@/lib/paypal-reconciliation";
import { readBoundedText } from "@/lib/request-body";
import { takeRateLimit, requestIdentity } from "@/lib/rate-limit";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    if (!request.headers.get("paypal-transmission-sig")) return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
    if(!await takeRateLimit(`paypal-webhook:${requestIdentity(request.headers)}`,30,60_000)||!await takeRateLimit("paypal-webhook:global",120,60_000))return NextResponse.json({error:"WEBHOOK_BUSY"},{status:503});
    const raw = await readBoundedText(request, 64_000);
    if (!(await verifyPayPalWebhook(raw, request.headers))) return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
    const event = JSON.parse(raw) as { event_type?: string; resource?: { id?: string; supplementary_data?: { related_ids?: { order_id?: string; capture_id?: string } } } };
    if (!event.event_type?.startsWith("PAYMENT.CAPTURE.")) return NextResponse.json({ ok: true });
    const ids = event.resource?.supplementary_data?.related_ids;
    const orderId = typeof ids?.order_id === "string" ? ids.order_id : "";
    const captureId = typeof ids?.capture_id === "string" ? ids.capture_id : typeof event.resource?.id === "string" ? event.resource.id : "";
    if (!orderId && !captureId) return NextResponse.json({ ok: true });
    const [payment] = await db.select().from(payments).where(and(eq(payments.environment, getPayPalEnvironment()), or(eq(payments.providerOrderId, orderId), eq(payments.providerCaptureId, captureId)))).limit(1);
    if (payment) await reconcilePayment(payment);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // A retry is required if verification/provider/database access is unavailable.
    return NextResponse.json({ error: "WEBHOOK_UNAVAILABLE" }, { status: 503 });
  }
}
