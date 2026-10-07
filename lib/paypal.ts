import "server-only";

const PAYPAL_BASE_URLS = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
} as const;

type PayPalEnvironment = keyof typeof PAYPAL_BASE_URLS;

export function getPayPalEnvironment(): PayPalEnvironment {
  const environment = process.env.PAYPAL_ENV?.trim() || "sandbox";
  if (!(environment in PAYPAL_BASE_URLS)) {
    throw new PayPalConfigurationError("PAYPAL_ENV must be either sandbox or live.");
  }
  return environment as PayPalEnvironment;
}

export class PayPalConfigurationError extends Error {
  constructor(message = "PayPal is not configured.") {
    super(message);
    this.name = "PayPalConfigurationError";
  }
}

export class PayPalApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly issue?: string,
  ) {
    super(message);
    this.name = "PayPalApiError";
  }
}

function configuration() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  const environment = getPayPalEnvironment();

  if (!clientId || !clientSecret) throw new PayPalConfigurationError();
  if (!(environment in PAYPAL_BASE_URLS)) {
    throw new PayPalConfigurationError("PAYPAL_ENV must be either sandbox or live.");
  }

  return { clientId, clientSecret, environment, baseUrl: PAYPAL_BASE_URLS[environment] };
}

const webhookUrl = "https://www.bluesass.nl/api/paypal/webhook";
export async function verifyPayPalWebhook(raw: string, headers: Headers) {
  const names = ["paypal-auth-algo", "paypal-cert-url", "paypal-transmission-id", "paypal-transmission-sig", "paypal-transmission-time"];
  if (names.some(name => !headers.get(name) || headers.get(name)!.length > 4000)) return false;
  const cert = new URL(headers.get("paypal-cert-url")!);
  if (cert.protocol !== "https:" || cert.username || cert.password || cert.port || !["api.paypal.com", "api.sandbox.paypal.com", "api-m.paypal.com", "api-m.sandbox.paypal.com"].includes(cert.hostname) || !cert.pathname.startsWith("/v1/notifications/certs/")) return false;
  let webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) {
    const registered = await paypalRequest<{ webhooks: Array<{ id: string; url: string }> }>("/v1/notifications/webhooks", { method: "GET" });
    webhookId = registered.webhooks.find(item => item.url === webhookUrl)?.id;
  }
  if (!webhookId) throw new PayPalConfigurationError("PayPal webhook is not registered.");
  const result = await paypalRequest<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({ auth_algo: headers.get(names[0]), cert_url: headers.get(names[1]), transmission_id: headers.get(names[2]), transmission_sig: headers.get(names[3]), transmission_time: headers.get(names[4]), webhook_id: webhookId }).slice(0, -1) + ',"webhook_event":' + raw + '}',
  });
  return result.verification_status === "SUCCESS";
}

export function getPayPalClientConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim() ?? "";
  const environment = process.env.PAYPAL_ENV?.trim() || "sandbox";
  return {
    clientId,
    environment,
    configured: Boolean(clientId && process.env.PAYPAL_CLIENT_SECRET?.trim() && environment in PAYPAL_BASE_URLS),
  };
}

async function accessToken() {
  const { clientId, clientSecret, baseUrl } = configuration();
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  const payload = (await response.json().catch(() => null)) as { access_token?: string } | null;
  if (!response.ok || !payload?.access_token) {
    throw new PayPalApiError("PayPal authentication failed.", response.status);
  }
  return payload.access_token;
}

function extractIssue(payload: unknown) {
  if (!payload || typeof payload !== "object") return undefined;
  const body = payload as { details?: Array<{ issue?: string }>; name?: string };
  return body.details?.[0]?.issue ?? body.name;
}

async function paypalRequest<T>(path: string, init: RequestInit, requestId?: string): Promise<T> {
  const { baseUrl } = configuration();
  const token = await accessToken();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(requestId ? { "PayPal-Request-Id": requestId } : {}),
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const payload = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !payload) {
    const issue = extractIssue(payload);
    throw new PayPalApiError(issue ?? "PayPal request failed.", response.status, issue);
  }
  return payload;
}

export interface PayPalCapture {
  id: string;
  status: string;
  amount?: { currency_code?: string; value?: string };
}

export interface PayPalOrder {
  id: string;
  status: string;
  intent?: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: { captures?: PayPalCapture[] };
  }>;
}

export function moneyValue(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}

export function createPayPalOrder(input: {
  paymentId: string;
  amountCents: number;
  currency: string;
  attempt: number;
}) {
  return paypalRequest<PayPalOrder>(
    "/v2/checkout/orders",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: input.paymentId,
            custom_id: input.paymentId,
            invoice_id: `BS-${input.paymentId}-${input.attempt}`,
            amount: {
              currency_code: input.currency,
              value: moneyValue(input.amountCents),
            },
          },
        ],
      }),
    },
    `${input.paymentId}-create-${input.attempt}`,
  );
}

export function getPayPalOrder(orderId: string) {
  return paypalRequest<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
  });
}

export async function capturePayPalOrder(orderId: string, paymentId: string, attempt: number) {
  try {
    return await paypalRequest<PayPalOrder>(
      `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      { method: "POST", headers: { Prefer: "return=representation" }, body: "{}" },
      `${paymentId}-capture-${attempt}`,
    );
  } catch (error) {
    // A retry can arrive after PayPal captured the order but before our first
    // response reached the app. Read the order and verify it instead of charging again.
    if (error instanceof PayPalApiError && error.issue === "ORDER_ALREADY_CAPTURED") {
      return getPayPalOrder(orderId);
    }
    throw error;
  }
}

export function verifiedCompletedCapture(
  order: PayPalOrder,
  expected: { orderId: string; paymentId: string; amountCents: number; currency: string },
) {
  if (order.id !== expected.orderId || order.status !== "COMPLETED" || order.intent !== "CAPTURE") return null;
  if (order.purchase_units?.length !== 1) return null;
  const unit = order.purchase_units[0];
  if (unit.custom_id !== expected.paymentId) return null;
  const captures = unit.payments?.captures ?? [];
  if (captures.length !== 1) return null;
  const capture = captures[0];
  if (capture.status !== "COMPLETED") return null;
  if (!unit || !capture?.id) return null;

  const currency = capture.amount?.currency_code;
  const value = capture.amount?.value;
  if (currency !== expected.currency || value !== moneyValue(expected.amountCents)) return null;
  return capture;
}
