/**
 * Transactional email via Resend's REST API.
 *
 * Called with `fetch` rather than the SDK to keep the dependency list small and
 * to stay edge-compatible. Missing configuration fails closed; verification
 * links and reset codes are never written to logs.
 */
import "server-only";

const API = "https://api.resend.com/emails";

export const isEmailConfigured = Boolean(process.env.RESEND_API_KEY);

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? "Blue Sass <help@bluesass.com>";
}

export interface SendResult {
  ok: boolean;
  /** True when no provider is configured and delivery was not attempted. */
  skipped?: boolean;
  error?: string;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] Delivery is not configured.");
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch(API, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      console.error(`[email] Delivery failed with status ${response.status}`);
      return { ok: false, error: `resend_${response.status}` };
    }
    return { ok: true };
  } catch {
    console.error("[email] Resend request failed.");
    return { ok: false, error: "network" };
  }
}
