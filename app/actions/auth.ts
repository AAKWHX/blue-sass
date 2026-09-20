"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
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
  name: z.string().trim().min(2, "Please enter your full name."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  company: z.string().trim().optional(),
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

  const { name, password, company, locale: loc } = parsed.data;
  const email = normaliseEmail(parsed.data.email);

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
      await dispatchVerification(email, loc);
      return { ok: true, message: "", pendingEmail: email };
    }
    return {
      ok: false,
      message: "An account with this email already exists. Try signing in.",
      fieldErrors: { email: "Already registered." },
    };
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
  const token = await issueVerificationToken(email);
  const origin = await getSiteUrl();
  const link = `${origin}/${locale}/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  const { subject, html, text } = verificationEmail(locale, link);
  const result = await sendEmail({ to: email, subject, html, text });
  return result.ok;
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

  const { password, locale: loc } = parsed.data;
  const email = normaliseEmail(parsed.data.email);

  // Check the confirmation state before signing in, so an unverified account
  // never receives a session cookie.
  const [record] = await db
    .select({ passwordHash: users.passwordHash, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (record?.passwordHash) {
    const correct = await bcrypt.compare(password, record.passwordHash);
    if (correct && !record.emailVerified) {
      if (requireEmailVerification) {
        return { ok: false, message: t.verifyPending, unverifiedEmail: email };
      }
      // Confirmation is off: adopt the legacy account instead of locking it out.
      await db
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.email, email));
    }
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Incorrect email or password." };
    }
    throw error;
  }
  redirect(`/${loc}/portal`);
}

/* ------------------------------------------------------------------ *
 * Resend
 * ------------------------------------------------------------------ */

/** Per-address cooldown, so the button cannot be used to spam an inbox. */
const RESEND_COOLDOWN_MS = 60_000;
const lastSentAt = new Map<string, number>();

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

  const previous = lastSentAt.get(email);
  if (previous && Date.now() - previous < RESEND_COOLDOWN_MS) {
    return { ok: false, message: t.resendThrottled };
  }

  const [record] = await db
    .select({ emailVerified: users.emailVerified, locale: users.locale })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always answer the same way: whether the address exists must not leak.
  if (record && !record.emailVerified) {
    lastSentAt.set(email, Date.now());
    await dispatchVerification(email, record.locale || locale);
  }
  return { ok: true, message: t.resendDone };
}

export async function signOutAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  await signOut({ redirectTo: `/${locale}` });
}

