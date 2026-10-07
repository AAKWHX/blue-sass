"use server";
import { revalidatePath } from "next/cache";
import { quoteReturnPath } from "@/lib/auth/return-path";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError, CredentialsSignin } from "next-auth";
import { headers } from "next/headers";
import { takeRateLimit, requestIdentity } from "@/lib/rate-limit";
import { checkNewPassword, validPasswordLength } from "@/lib/auth/password-policy";
import { securityCopy } from "@/lib/i18n/security-copy";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { db, isDatabaseConfigured } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";
import { issueVerificationToken } from "@/lib/auth/verification";
import { sendEmail } from "@/lib/email/resend";
import { verificationEmail } from "@/lib/email/templates";
import { getSiteUrl } from "@/lib/site-url";
import { getDictionary, isLocale } from "@/lib/i18n";
import { validateEmail, validatePhone } from "@/lib/validation/contact";
import { requireEmailVerification } from "@/lib/auth/policy";

export interface ActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  /** Set after a successful signup so the form can show the "check your inbox" panel. */
  pendingEmail?: string;
}

function dict(locale: string) {
  return getDictionary(isLocale(locale) ? locale : "en");
}

/* ------------------------------------------------------------------ *
 * Shared field validators
 *
 * These re-implement the browser-side checks on the server on purpose: an
 * attacker can POST straight to the server action, so `type="email"` and the
 * phone component's masking are conveniences, never guarantees.
 * ------------------------------------------------------------------ */

function emailField(locale: string) {
  const t = dict(locale).auth;
  return z.string().superRefine((raw, ctx) => {
    const result = validateEmail(raw ?? "");
    if (result.ok) return;
    ctx.addIssue({
      code: "custom",
      message: result.code === "nonAscii" ? t.errEmailNonAscii : t.errEmailFormat,
    });
  });
}

/** Normalises `email` after validation so the rest of the action gets ASCII lowercase. */
function normaliseEmail(raw: string): string {
  return validateEmail(raw).value ?? raw.trim().toLowerCase();
}

function phoneError(locale: string, code: string | undefined, min: number, max: number) {
  const t = dict(locale).auth;
  switch (code) {
    case "letters":
      return t.errPhoneLetters;
    case "required":
      return t.errPhoneRequired;
    case "country":
      return t.errPhoneCountry;
    default:
      return t.errPhoneLength.replace(
        "{expected}",
        min === max
          ? String(min)
          : t.digitsRange.replace("{min}", String(min)).replace("{max}", String(max)),
      );
  }
}

const baseRegisterSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  password: z.string().min(1).max(128),
  company: z.string().trim().max(120).optional(),
  phone: z.string().trim().optional(),
  phoneCountry: z.string().trim().optional(),
  locale: z.string().default("ar"),
});

/**
 * Public sign-up.
 *
 * Deliberately does NOT create a session: the account stays inert until the
 * emailed link is opened. Always creates a `client`; staff roles are granted
 * in admin.
 */
export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = String(formData.get("locale") ?? "ar");
  const t = dict(locale).auth;

  if (!isDatabaseConfigured) {
    return { ok: false, message: "The database is not connected yet. Set DATABASE_URL." };
  }

  const raw = Object.fromEntries(formData);
  const schema = baseRegisterSchema.extend({ email: emailField(locale) });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const { name, password, company } = parsed.data;
  const loc = isLocale(parsed.data.locale) ? parsed.data.locale : "en";
  const email = normaliseEmail(parsed.data.email);
  const security = securityCopy(loc);
  if (!(await takeRateLimit(`signup-ip:${requestIdentity(await headers())}`, 5, 3600_000)) || !(await takeRateLimit("signup-global", 200, 3600_000))) return { ok: false, message: security.retry };
  const passwordCheck = await checkNewPassword(password);
  if (passwordCheck !== "ok") return { ok: false, message: security[passwordCheck], fieldErrors: { password: security[passwordCheck] } };

  // Phone: optional, but when present it must pass the same per-country check
  // the widget applies — the client only ever submits an E.164 string.
  let phoneE164: string | null = null;
  if (parsed.data.phone) {
    const iso = parsed.data.phoneCountry ?? "";
    const submitted = parsed.data.phone;
    // The hidden field already carries `+<dial><national>`; strip the dial code
    // back off so `validatePhone` can re-derive it authoritatively.
    const { countries } = await import("@/lib/validation/countries");
    const country = countries.find((c) => c.iso === iso);
    if (!country) {
      return {
        ok: false,
        message: t.errPhoneCountry,
        fieldErrors: { phone: t.errPhoneCountry },
      };
    }
    const national = submitted.startsWith(`+${country.dial}`)
      ? submitted.slice(country.dial.length + 1)
      : submitted;
    const check = validatePhone(iso, national, { required: true });
    if (!check.ok || !check.e164) {
      const message = phoneError(loc, check.code, country.min, country.max);
      return { ok: false, message, fieldErrors: { phone: message } };
    }
    phoneE164 = check.e164;
  }

  const [existing] = await db
    .select({ id: users.id, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    // An unverified duplicate simply gets a fresh link instead of an error that
    // would leak nothing useful anyway.
    if (!existing.emailVerified && requireEmailVerification) {
      const sent = await dispatchVerification(email, loc);
      return { ok: true, message: sent ? "" : t.emailNotSent, pendingEmail: email };
    }
    return { ok: true, message: t.resendDone, pendingEmail: email };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      company: company || null,
      phone: phoneE164,
      locale: loc,
      role: "client",
      // With confirmation switched off the account is usable immediately.
      emailVerified: requireEmailVerification ? null : new Date(),
    })
    .returning({ id: users.id });

  // Link any earlier quote request from the same address to the new account.
  await db
    .update(leads)
    .set({ convertedUserId: created.id, status: "qualified" })
    .where(eq(leads.email, email));

  // No sending domain yet: skip the email entirely and sign the client in, so
  // signup is not silently broken for anyone who is not the Resend account
  // owner. Everything is still recorded in `users` for the admin to review.
  if (!requireEmailVerification) {
    await signIn("credentials", { email, password, redirect: false });
    revalidatePath("/", "layout");
    redirect(`/${loc}/portal`);
  }

  const sent = await dispatchVerification(email, loc);
  if (!sent) {
    return { ok: true, message: t.emailNotSent, pendingEmail: email };
  }
  return { ok: true, message: "", pendingEmail: email };
}

/** Issues a token and mails the link. Returns false when the provider errored. */
async function dispatchVerification(email: string, locale: string): Promise<boolean> {
  if (!(await takeRateLimit(`verify-email:${email}`, 1, 60_000))) return true;
  const token = await issueVerificationToken(email);
  const origin = await getSiteUrl();
  const link = `${origin}/${locale}/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  const { subject, html, text } = verificationEmail(locale, link);
  const result = await sendEmail({ to: email, subject, html, text });
  // A missing provider key is a safe development fallback, not a delivered
  // message. Never tell a customer that a verification email was sent when it
  // was only skipped.
  return result.ok && !result.skipped;
}

/* ------------------------------------------------------------------ *
 * Login
 * ------------------------------------------------------------------ */

const baseLoginSchema = z.object({
  password: z.string().min(1, "Enter your password."),
  locale: z.string().default("ar"),
});

export interface LoginState extends ActionState {
  /** Set when the credentials were right but the address is unconfirmed. */
  unverifiedEmail?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const locale = String(formData.get("locale") ?? "ar");
  const t = dict(locale).auth;

  if (!isDatabaseConfigured) {
    return { ok: false, message: "The database is not connected yet. Set DATABASE_URL." };
  }

  const schema = baseLoginSchema.extend({ email: emailField(locale) });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const { password } = parsed.data;
  const loc = isLocale(parsed.data.locale) ? parsed.data.locale : "en";
  const email = normaliseEmail(parsed.data.email);
  if (!validPasswordLength(password, true)) return { ok: false, message: "Incorrect email or password." };

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "email_unverified") return { ok: false, message: t.verifyPending, unverifiedEmail: email };
    if (error instanceof AuthError) {
      return { ok: false, message: "Incorrect email or password." };
    }
    throw error;
  }
  revalidatePath("/", "layout");
  redirect(quoteReturnPath(formData.get("next"), loc));
}

/* ------------------------------------------------------------------ *
 * Resend
 * ------------------------------------------------------------------ */

export async function resendVerificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = String(formData.get("locale") ?? "ar");
  const t = dict(locale).auth;

  if (!isDatabaseConfigured) {
    return { ok: false, message: "The database is not connected yet. Set DATABASE_URL." };
  }

  const email = normaliseEmail(String(formData.get("email") ?? ""));
  if (!validateEmail(email).ok) return { ok: false, message: t.errEmailFormat };

  if (!(await takeRateLimit(`verify-ip:${requestIdentity(await headers())}`, 10, 3600_000))) {
    return { ok: false, message: t.resendThrottled };
  }

  const [record] = await db
    .select({ emailVerified: users.emailVerified, locale: users.locale })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always answer the same way: whether the address exists must not leak.
  if (record && !record.emailVerified) {
      const sent = await dispatchVerification(email, record.locale || locale);
      if (!sent) return { ok: false, message: t.emailNotSent };
  }
  return { ok: true, message: t.resendDone };
}

export async function signOutAction(formData: FormData) {
  const raw = String(formData.get("locale") ?? "ar");
  const locale = isLocale(raw) ? raw : "ar";
  await signOut({ redirectTo: `/${locale}` });
}
