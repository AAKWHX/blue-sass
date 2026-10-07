import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { sql } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db/index";

/** Vercel overwrites x-forwarded-for. Never trust a caller-supplied IP elsewhere. */
export function requestIdentity(headers: Pick<Headers, "get">) {
  const ip = process.env.VERCEL === "1" ? headers.get("x-forwarded-for")?.split(",")[0]?.trim() : undefined;
  return ip && isIP(ip) ? ip : "shared-origin";
}

/** Atomic shared limits; store only keyed digests and expire counters. Fail closed. */
export async function takeRateLimit(key: string, limit = 5, windowMs = 60_000): Promise<boolean> {
  if (!isDatabaseConfigured || !Number.isInteger(limit) || limit < 1 || limit > 1_000_000 || windowMs < 1000 || windowMs > 86_400_000) return false;
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) return false;
  const digest = createHmac("sha256", secret).update(key).digest("hex");
  try {
    const rows = await db.execute<{ allowed: boolean }>(sql`
      WITH cleanup AS (
        DELETE FROM public.security_rate_limits WHERE key_hash IN (
          SELECT key_hash FROM public.security_rate_limits WHERE expires_at < now() - interval '1 day' AND key_hash <> ${digest} LIMIT 100
        )
      )
      INSERT INTO public.security_rate_limits (key_hash, hits, expires_at)
      VALUES (${digest}, 1, now() + ${windowMs} * interval '1 millisecond')
      ON CONFLICT (key_hash) DO UPDATE SET
        hits = CASE WHEN security_rate_limits.expires_at <= now() THEN 1 ELSE LEAST(security_rate_limits.hits + 1, ${limit + 1}) END,
        expires_at = CASE WHEN security_rate_limits.expires_at <= now() THEN EXCLUDED.expires_at ELSE security_rate_limits.expires_at END
      RETURNING hits <= ${limit} AS allowed
    `);
    return rows[0]?.allowed === true;
  } catch {
    console.error("[security] Rate limit storage unavailable");
    return false;
  }
}
