/**
 * Transactional email via Resend's REST API.
 *
 * Called with `fetch` rather than the SDK to keep the dependency list small and
 * to stay edge-compatible. When `RESEND_API_KEY` is absent (local dev, preview
 * builds) we log the link to the server console instead of failing signup.
 */
import "server-only";

const API = "https://api.resend.com/emails";

export const isEmailConfigured = Boolean(process.env.RESEND_API_KEY);

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? "AAKWHX <onboarding@resend.dev>";
}

export interface SendResult {
  ok: boolean;
  /** True when no provider is configured and the mail was only logged. */
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
    console.warn(
      `[email] RESEND_API_KEY is not set — email to ${options.to} was not sent.\n` +
        `[email] subject: ${options.subject}\n${options.text}`,
    );
    return { ok: true, skipped: true };
  }

  try {
    const response = await fetch(API, {
      method: "POST",
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
      const detail = await response.text().catch(() => "");
      console.error(`[email] Resend responded ${response.status}: ${detail}`);
      return { ok: false, error: `resend_${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    console.error("[email] Resend request failed", error);
    return { ok: false, error: "network" };
  }
}
