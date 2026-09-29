"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Clock3, ShieldCheck } from "lucide-react";
import type { paymentCopy } from "@/lib/i18n/payment-copy";

type Copy = (typeof paymentCopy)[keyof typeof paymentCopy];
type CheckoutState = "idle" | "processing" | "paid" | "pending" | "failed" | "cancelled";

type PayPalButtons = {
  render: (element: HTMLElement) => Promise<void>;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style: Record<string, string | number>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onCancel: (data: { orderID?: string }) => void | Promise<void>;
        onError: () => void | Promise<void>;
      }) => PayPalButtons;
    };
  }
}

async function responseBody(response: Response) {
  return response.json().catch(() => ({})) as Promise<{ orderId?: string; status?: string; error?: string }>;
}

export function PayPalCheckout({
  projectId,
  clientId,
  currency,
  copy,
  initialStatus,
}: {
  projectId: string;
  clientId: string;
  currency: string;
  copy: Copy;
  initialStatus: CheckoutState;
}) {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const activeOrder = useRef<string | undefined>(undefined);
  const [state, setState] = useState<CheckoutState>(initialStatus);

  const renderButtons = useCallback(async () => {
    if (rendered.current || !container.current || !window.paypal) return;
    rendered.current = true;
    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", shape: "rect", color: "gold", label: "paypal", height: 48 },
      createOrder: async () => {
        setState("processing");
        const response = await fetch("/api/paypal/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        const body = await responseBody(response);
        if (!response.ok || !body.orderId) {
          setState("failed");
          throw new Error(body.error ?? "PAYPAL_CREATE_FAILED");
        }
        activeOrder.current = body.orderId;
        return body.orderId;
      },
      onApprove: async ({ orderID }) => {
        setState("processing");
        const response = await fetch(`/api/paypal/orders/${encodeURIComponent(orderID)}/capture`, { method: "POST" });
        const body = await responseBody(response);
        if (response.ok && body.status === "paid") {
          setState("paid");
          router.refresh();
          return;
        }
        if (response.status === 202 || body.status === "pending") {
          setState("pending");
          router.refresh();
          return;
        }
        setState("failed");
        throw new Error(body.error ?? "PAYPAL_CAPTURE_FAILED");
      },
      onCancel: async ({ orderID }) => {
        const id = orderID ?? activeOrder.current;
        if (id) await fetch(`/api/paypal/orders/${encodeURIComponent(id)}/cancel`, { method: "POST" }).catch(() => undefined);
        setState("cancelled");
        router.refresh();
      },
      onError: async () => {
        if (activeOrder.current) {
          await fetch(`/api/paypal/orders/${encodeURIComponent(activeOrder.current)}/cancel`, { method: "POST" }).catch(() => undefined);
        }
        setState("failed");
        router.refresh();
      },
    });
    await buttons.render(container.current);
  }, [projectId, router]);

  const status = {
    processing: { icon: Clock3, text: copy.processing, tone: "border-neon-sky/30 bg-neon-sky/10 text-ink-high" },
    paid: { icon: CircleCheck, text: copy.success, tone: "border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald" },
    pending: { icon: Clock3, text: copy.pending, tone: "border-neon-sky/30 bg-neon-sky/10 text-ink-high" },
    failed: { icon: CircleAlert, text: copy.error, tone: "border-red-400/30 bg-red-400/10 text-red-200" },
    cancelled: { icon: CircleAlert, text: `${copy.cancelled}. ${copy.cancelledNote}`, tone: "border-line bg-surface-2 text-ink-low" },
  }[state as Exclude<CheckoutState, "idle">];

  return (
    <div className="space-y-4">
      <Script
        id="paypal-checkout-sdk"
        src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`}
        strategy="afterInteractive"
        onLoad={() => void renderButtons()}
        onReady={() => void renderButtons()}
        onError={() => setState("failed")}
      />
      {status ? (
        <div role="status" className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${status.tone}`}>
          <status.icon className="mt-0.5 size-5 shrink-0" />
          <span>{status.text}</span>
        </div>
      ) : null}
      {state !== "paid" ? <div ref={container} aria-label={copy.pay} className="min-h-12 overflow-hidden rounded-xl" /> : null}
      <div className="flex items-start gap-2 text-xs leading-5 text-ink-low">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-neon-emerald" />
        <span>{copy.secure}</span>
      </div>
    </div>
  );
}
