"use client";
import { useActionState } from "react";
import Link from "next/link";
import { requestRecovery, completeRecovery, type RecoveryState } from "@/app/actions/recovery";
import { useI18n } from "@/components/providers";
import { recovery } from "@/lib/i18n/recovery";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

const initial: RecoveryState = { ok: false, message: "" };
export function RecoveryForm() {
  const { locale, t } = useI18n();
  const c = recovery[locale];
  const [sent, send, sending] = useActionState(requestRecovery, initial);
  const [reset, complete, resetting] = useActionState(completeRecovery, initial);
  return <div className="glass-card w-full max-w-md space-y-6 p-6 sm:p-9"><BrandLogo /><h1 className="text-3xl font-semibold">{c.title}</h1><p className="text-sm leading-7 text-ink-low">{c.intro}</p>
    {!reset.complete && <form action={send} className="space-y-4"><input type="hidden" name="locale" value={locale} /><Label htmlFor="recovery-email">{t.auth.email}</Label><Input id="recovery-email" name="email" type="email" autoComplete="email" dir="ltr" required /><Button className="w-full" type="submit" disabled={sending || resetting}>{sending ? t.auth.submitting : c.send}</Button></form>}
    {sent.message && !reset.complete && <p role="status" className="text-sm leading-7">{sent.message}</p>}
    {sent.ok && !reset.complete && <form action={complete} className="space-y-4"><input type="hidden" name="locale" value={locale} /><input type="hidden" name="email" value={sent.email} /><Label htmlFor="recovery-code">{c.code}</Label><Input id="recovery-code" name="code" dir="ltr" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" minLength={8} maxLength={8} required /><Label htmlFor="new-password">{c.password}</Label><Input id="new-password" name="password" type="password" dir="ltr" autoComplete="new-password" minLength={12} maxLength={64} required /><p className="text-xs text-ink-low">{c.hint}</p><Label htmlFor="confirm-password">{c.confirm}</Label><Input id="confirm-password" name="confirm" type="password" dir="ltr" autoComplete="new-password" minLength={12} maxLength={64} required /><Button type="submit" className="w-full" disabled={resetting || sending}>{resetting ? t.auth.submitting : c.reset}</Button></form>}
    {reset.message && <p role="status" className="text-sm leading-7">{reset.message}</p>}
    <Link href={`/${locale}/login`} className="block text-center text-sm underline underline-offset-4">{t.auth.signIn}</Link>
  </div>;
}
