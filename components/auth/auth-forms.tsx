"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, Loader2, LogIn, MailCheck, RefreshCw, UserPlus } from "lucide-react";
import {
  loginAction,
  registerAction,
  resendVerificationAction,
  type ActionState,
  type LoginState,
} from "@/app/actions/auth";
import { useI18n } from "@/components/providers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneField } from "@/components/ui/phone-field";
import { validateEmail } from "@/lib/validation/contact";

const initial: ActionState = { ok: false, message: "" };
const initialLogin: LoginState = { ok: false, message: "" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-400">{message}</p>;
}

/**
 * Email box with live ASCII-only feedback. The authoritative check is the
 * identical `validateEmail` call inside the server action.
 */
function EmailField({
  id,
  serverError,
  autoComplete = "email",
}: {
  id: string;
  serverError?: string;
  autoComplete?: string;
}) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const result = validateEmail(value);
  const clientError =
    touched && value && !result.ok
      ? result.code === "nonAscii"
        ? t.auth.errEmailNonAscii
        : t.auth.errEmailFormat
      : undefined;
  const error = clientError ?? serverError;

  return (
    <>
      <Input
        id={id}
        name="email"
        type="email"
        required
        autoComplete={autoComplete}
        className="field"
        dir="ltr"
        spellCheck={false}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => setTouched(true)}
      />
      <FieldError message={error} />
    </>
  );
}

/** Shared "check your inbox" panel with the resend button. */
export function VerifyNotice({ email, tone = "info" }: { email: string; tone?: "info" | "warn" }) {
  const { t, locale } = useI18n();
  const [state, formAction, pending] = useActionState(resendVerificationAction, initial);

  return (
    <div
      className={
        tone === "warn"
          ? "rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"
          : "rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4"
      }
    >
      <div className="flex items-start gap-3">
        <MailCheck className="mt-0.5 size-5 shrink-0 text-neon-cyan" />
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-ink-hi">{t.auth.verifySentTitle}</p>
            <p className="mt-1 text-sm text-ink-low" dir="auto">
              {t.auth.verifySentBody.replace("{email}", email)}
            </p>
          </div>

          {state.message ? (
            <p className={state.ok ? "text-xs text-emerald-300" : "text-xs text-rose-300"}>
              {state.message}
            </p>
          ) : null}

          <form action={formAction}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="email" value={email} />
            <Button type="submit" variant="secondary" size="sm" disabled={pending} className="gap-2">
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              {pending ? t.auth.resending : t.auth.resend}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  const { t, locale } = useI18n();
  const [state, formAction, pending] = useActionState(loginAction, initialLogin);

  return (
    <form action={formAction} className="glass-card space-y-5 p-7">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <h1 className="text-2xl font-bold text-ink-hi">{t.auth.loginTitle}</h1>
        <p className="mt-1.5 text-sm text-ink-low" dir="auto">
          {t.auth.loginSubtitle}
        </p>
      </div>

      {state.unverifiedEmail ? (
        <VerifyNotice email={state.unverifiedEmail} tone="warn" />
      ) : state.message && !state.ok ? (
        <Alert role="alert" className="border-rose-500/40 bg-rose-500/10">
          <AlertDescription className="text-rose-200">{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div>
        <Label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-low">
          {t.auth.email}
        </Label>
        <EmailField id="email" autoComplete="username" />
      </div>

      <div>
        <Label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink-low">
          {t.auth.password}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field"
          dir="ltr"
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full gap-2">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        {pending ? t.auth.submitting : t.auth.signIn}
      </Button>

      <p className="text-center text-sm text-ink-low">
        {t.auth.noAccount}{" "}
        <Link href={`/${locale}/register`} className="font-semibold text-neon-cyan hover:underline">
          {t.auth.signUp}
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const { t, locale } = useI18n();
  const [state, formAction, pending] = useActionState(registerAction, initial);

  // Signup no longer creates a session — on success we swap the form for the
  // "confirm your email" panel instead of redirecting to the portal.
  if (state.pendingEmail) {
    return (
      <div className="glass-card space-y-5 p-7">
        <div className="flex items-center gap-2 text-emerald-300">
          <CheckCircle2 className="size-5" />
          <span className="text-sm font-semibold">{t.auth.registerTitle}</span>
        </div>
        {state.message ? (
          <Alert role="alert" className="border-amber-500/40 bg-amber-500/10">
            <AlertDescription className="text-amber-100">{state.message}</AlertDescription>
          </Alert>
        ) : null}
        <VerifyNotice email={state.pendingEmail} />
        <p className="text-center text-sm text-ink-low">
          {t.auth.haveAccount}{" "}
          <Link href={`/${locale}/login`} className="font-semibold text-neon-cyan hover:underline">
            {t.auth.signIn}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="glass-card space-y-5 p-7">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <h1 className="text-2xl font-bold text-ink-hi">{t.auth.registerTitle}</h1>
        <p className="mt-1.5 text-sm text-ink-low" dir="auto">
          {t.auth.registerSubtitle}
        </p>
      </div>

      {state.message && !state.ok ? (
        <Alert role="alert" className="border-rose-500/40 bg-rose-500/10">
          <AlertDescription className="text-rose-200">{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div>
        <Label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-ink-low">
          {t.auth.name}
        </Label>
        <Input id="name" name="name" required autoComplete="name" className="field" dir="auto" />
        <FieldError message={state.fieldErrors?.name} />
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="reg-email" className="mb-1.5 block text-xs font-semibold text-ink-low">
            {t.auth.email}
          </Label>
          <EmailField id="reg-email" serverError={state.fieldErrors?.email} />
        </div>
        {/* Its own full-width row: the country button plus the number need more
            horizontal space than half a grid column gives them. */}
        <div>
          <Label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-ink-low">
            {t.auth.phone}
          </Label>
          <PhoneField
            locale={locale}
            serverError={state.fieldErrors?.phone}
            strings={{
              country: t.auth.phoneCountry,
              search: t.auth.phoneSearch,
              noResults: t.auth.phoneNoResults,
              placeholder: t.auth.phonePlaceholder,
              hint: t.auth.phoneHint,
              errLetters: t.auth.errPhoneLetters,
              errLength: t.auth.errPhoneLength,
              digitsRange: t.auth.digitsRange,
            }}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="company" className="mb-1.5 block text-xs font-semibold text-ink-low">
          {t.auth.company}
        </Label>
        <Input id="company" name="company" autoComplete="organization" className="field" dir="auto" />
      </div>

      <div>
        <Label htmlFor="reg-password" className="mb-1.5 block text-xs font-semibold text-ink-low">
          {t.auth.password}
        </Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
          dir="ltr"
        />
        <p className="mt-1 text-xs text-ink-low">{t.auth.passwordHint}</p>
        <FieldError message={state.fieldErrors?.password} />
      </div>

      <Button type="submit" disabled={pending} className="w-full gap-2">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        {pending ? t.auth.submitting : t.auth.signUp}
      </Button>

      <p className="text-center text-sm text-ink-low">
        {t.auth.haveAccount}{" "}
        <Link href={`/${locale}/login`} className="font-semibold text-neon-cyan hover:underline">
          {t.auth.signIn}
        </Link>
      </p>
    </form>
  );
}

