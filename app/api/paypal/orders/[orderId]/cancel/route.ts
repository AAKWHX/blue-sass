import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/api-security";
import { assertCanWrite, AuthorisationError, requireViewer } from "@/lib/db/access";
import { cancelPayPalPayment, PaymentAccessError, PaymentConflictError } from "@/lib/db/payments";

const orderIdSchema = z.string().min(6).max(64).regex(/^[A-Za-z0-9_-]+$/);

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    assertSameOrigin(request);
    const viewer = await requireViewer();
    assertCanWrite(viewer);
    const orderId = orderIdSchema.parse((await params).orderId);
    await cancelPayPalPayment(orderId, viewer.id);
    return NextResponse.json({ status: "failed", reason: "cancelled" });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    if (error instanceof AuthorisationError) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    if (error instanceof PaymentAccessError) return NextResponse.json({ error: "PAYMENT_UNAVAILABLE" }, { status: 403 });
    if (error instanceof PaymentConflictError) return NextResponse.json({ error: "PAYMENT_CONFLICT" }, { status: 409 });
    if (error instanceof Error && error.message === "UNTRUSTED_ORIGIN") return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
    return NextResponse.json({ error: "PAYMENT_ERROR" }, { status: 500 });
  }
}
