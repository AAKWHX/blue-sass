"use server";

import { and, eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, isDatabaseConfigured } from "@/lib/db";
import { users, verificationTokens, sessions } from "@/lib/db/schema";
import { sendEmail, isEmailConfigured } from "@/lib/email/resend";
import { isLocale } from "@/lib/i18n";
import { recovery } from "@/lib/i18n/recovery";
import { validateEmail } from "@/lib/validation/contact";
import { newResetCode, resetDigest, matchesResetCode, RESET_TTL, RESET_MAX_ATTEMPTS } from "@/lib/auth/reset-code";

export interface RecoveryState { ok: boolean; message: string; email?: string; complete?: boolean }
function input(data: FormData) {
  const rawLocale = String(data.get("locale") ?? "en");
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  return { locale, email, t: recovery[locale] };
}
function secret() { return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? ""; }

export async function requestRecovery(_previous: RecoveryState, data: FormData): Promise<RecoveryState> {
  const { t, email } = input(data);
  if (!validateEmail(email).ok || !isDatabaseConfigured || !isEmailConfigured || !secret()) return { ok: false, message: t.unavailable };
  const identifier = `password-reset:${email}`;
  const code = newResetCode();
  // Transaction advisory locks serialize requests across all Vercel workers.
  const issued = await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${identifier}))`);
    const [previous] = await tx.select().from(verificationTokens).where(eq(verificationTokens.identifier, identifier));
    if (previous && previous.expires.getTime() - RESET_TTL + 60000 > Date.now()) return false;
    const [user] = await tx.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    await tx.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
    await tx.insert(verificationTokens).values({ identifier, token: JSON.stringify({ digest: resetDigest(email, code, secret()), attempts: 0 }), expires: new Date(Date.now() + RESET_TTL) });
    return Boolean(user);
  });
  if (issued) {
    const sent = await sendEmail({ to: email, subject: `Blue Sass — ${t.title}`, html: `<h1>Blue Sass</h1><p>${t.intro}</p><p style="font-size:32px;letter-spacing:6px" dir="ltr">${code}</p>`, text: `${t.intro}\n\n${code}` });
    if (!sent.ok || sent.skipped) return { ok: false, message: t.unavailable };
  }
  return { ok: true, message: t.sent, email };
}

export async function completeRecovery(_previous: RecoveryState, data: FormData): Promise<RecoveryState> {
  const { t, email } = input(data);
  const password = String(data.get("password") ?? "");
  const code = String(data.get("code") ?? "").trim();
  if (password.length < 12 || password.length > 64 || Buffer.byteLength(password, "utf8") > 72 || password !== data.get("confirm")) return { ok: false, message: t.mismatch };
  if (!isDatabaseConfigured || !secret() || !validateEmail(email).ok || !/^\d{8}$/.test(code)) return { ok: false, message: t.invalid };
  const identifier = `password-reset:${email}`;
  const ok = await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${identifier}))`);
    const [row] = await tx.select().from(verificationTokens).where(eq(verificationTokens.identifier, identifier));
    if (!row || row.expires.getTime() <= Date.now()) return false;
    const payload: { digest: string; attempts: number } = JSON.parse(row.token);
    if (payload.attempts >= RESET_MAX_ATTEMPTS) return false;
    if (!matchesResetCode(email, code, payload.digest, secret())) {
      await tx.update(verificationTokens).set({ token: JSON.stringify({ ...payload, attempts: payload.attempts + 1 }) }).where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, row.token)));
      return false;
    }
    const [user] = await tx.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (!user) return false;
    await tx.update(users).set({ passwordHash: await bcrypt.hash(password, 12), emailVerified: new Date() }).where(eq(users.id, user.id));
    await tx.delete(sessions).where(eq(sessions.userId, user.id));
    await tx.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
    return true;
  });
  return { ok, complete: ok, message: ok ? t.success : t.invalid };
}
