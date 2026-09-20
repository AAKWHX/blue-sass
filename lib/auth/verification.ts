/**
 * Email-verification tokens.
 *
 * The raw 256-bit token only ever exists inside the link we email. What we
 * persist in `verification_tokens.token` is its SHA-256 digest, so a dump of
 * the table cannot be replayed to activate somebody else's account.
 *
 * Tokens are valid for 24 hours and are consumed on first use (the row is
 * deleted inside the same request that marks the user verified).
 */
import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/** Namespaced so these rows never collide with Auth.js magic-link tokens. */
export function identifierFor(email: string): string {
  return `verify-email:${email.toLowerCase()}`;
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

/**
 * Issues a fresh token for `email`, invalidating any outstanding one so a
 * resend cannot leave two working links behind.
 * @returns the raw token — never store or log it.
 */
export async function issueVerificationToken(email: string): Promise<string> {
  const identifier = identifierFor(email);
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));

  const raw = randomBytes(32).toString("base64url"); // 256 bits of entropy
  await db.insert(verificationTokens).values({
    identifier,
    token: hashToken(raw),
    expires: new Date(Date.now() + TOKEN_TTL_MS),
  });
  return raw;
}

export type ConsumeResult =
  | { ok: true; email: string; alreadyVerified: boolean }
  | { ok: false; reason: "invalid" | "expired" };

/**
 * Validates a raw token for `email` and, on success, stamps `email_verified`
 * and deletes the row — making the link single-use.
 */
export async function consumeVerificationToken(
  email: string,
  rawToken: string,
): Promise<ConsumeResult> {
  const identifier = identifierFor(email);
  const digest = hashToken(rawToken);

  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.identifier, identifier))
    .limit(1);

  if (!row || !safeEqualHex(row.token, digest)) return { ok: false, reason: "invalid" };

  if (row.expires.getTime() < Date.now()) {
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, identifier),
          eq(verificationTokens.token, row.token),
        ),
      );
    return { ok: false, reason: "expired" };
  }

  const [user] = await db
    .select({ id: users.id, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  if (!user) return { ok: false, reason: "invalid" };

  const alreadyVerified = Boolean(user.emailVerified);
  if (!alreadyVerified) {
    await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id));
  }

  await db
    .delete(verificationTokens)
    .where(
      and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, row.token)),
    );

  return { ok: true, email: email.toLowerCase(), alreadyVerified };
}

/** Housekeeping — safe to call opportunistically. */
export async function purgeExpiredTokens(): Promise<void> {
  await db.delete(verificationTokens).where(lt(verificationTokens.expires, new Date()));
}
