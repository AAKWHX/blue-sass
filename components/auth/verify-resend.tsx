"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { resendVerificationAction, type ActionState } from "@/app/actions/auth";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: ActionState = { ok: false, message: "" };

/**
 * Shown on an invalid/expired confirmation link. The address is prefilled from
 * the link when we could parse one, otherwise the visitor types it.
 */
export function VerifyResend({ email }: { email: string }) {
  const { t, locale } = useI18n();
  const [value, setValue] = useState(email);
  const [state, formAction, pending] = useActionState(resendVerificationAction, initial);

  return (
    <form action={formAction} className="space-y-3 text-start">
      <input type="hidden" name="locale" value={locale} />

      <Input
        name="email"
        type="email"
        required
        dir="ltr"
        spellCheck={false}
        className="field"
        placeholder={t.auth.email}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      {state.message ? (
        <p className={state.ok ? "text-xs text-emerald-300" : "text-xs text-rose-300"}>
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full gap-2">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        {pending ? t.auth.resending : t.auth.resend}
      </Button>

      <p className="text-center text-sm text-ink-low">
        <Link href={`/${locale}/login`} className="font-semibold text-neon-cyan hover:underline">
          {t.auth.signIn}
        </Link>
      </p>
    </form>
  );
}
