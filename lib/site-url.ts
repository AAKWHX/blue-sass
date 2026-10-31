import { headers } from "next/headers";

/**
 * Absolute origin for links inside emails.
 *
 * Prefers an explicit `NEXT_PUBLIC_SITE_URL`, then Vercel's deployment host,
 * and finally the incoming request headers so preview sandboxes work too.
 */
export async function getSiteUrl(): Promise<string> {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Fail closed in production: never derive email links (verification, password
  // reset) from attacker-controllable Host / X-Forwarded-* request headers.
  if (process.env.NODE_ENV === "production") {
    throw new Error("SITE_ORIGIN_NOT_CONFIGURED: set NEXT_PUBLIC_SITE_URL.");
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
