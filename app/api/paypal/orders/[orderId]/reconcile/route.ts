import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/api-security";
import { requireViewer } from "@/lib/db/access";
import { getOwnedPayPalPayment } from "@/lib/db/payments";
import { reconcilePayment } from "@/lib/paypal-reconciliation";
import { takeRateLimit } from "@/lib/rate-limit";
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    assertSameOrigin(request); const viewer = await requireViewer();
    if (!(await takeRateLimit(`paypal-reconcile:${viewer.id}`, 5, 60_000))) return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    const id = z.string().regex(/^[A-Za-z0-9_-]{6,64}$/).parse((await params).orderId);
    const { payment } = await getOwnedPayPalPayment(id, viewer.id);
    return NextResponse.json({ status: await reconcilePayment(payment) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "UNAVAILABLE" }, { status: 403 }); }
}
