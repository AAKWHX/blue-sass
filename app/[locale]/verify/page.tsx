import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { consumeVerificationToken } from "@/lib/auth/verification";
import { isDatabaseConfigured } from "@/lib/db";
import { getDictionary, isLocale } from "@/lib/i18n";
import { validateEmail } from "@/lib/validation/contact";
import { Button } from "@/components/ui/button";
import { VerifyResend } from "@/components/auth/verify-resend";

export const metadata = { title: "Confirm your email — AAKWHX" };
export const dynamic = "force-dynamic";

export default async function VerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { locale } = await params;
  const { token, email } = await searchParams;
  const t = getDictionary(isLocale(locale) ? locale : "en").auth;

  type Outcome = "ok" | "already" | "expired" | "invalid";
  let outcome: Outcome = "invalid";
  const address = email ? validateEmail(email) : { ok: false as const };

  if (isDatabaseConfigured && token && address.ok && address.value) {
    const result = await consumeVerificationToken(address.value, token);
    if (result.ok) outcome = result.alreadyVerified ? "already" : "ok";
    else outcome = result.reason === "expired" ? "expired" : "invalid";
  }

  const success = outcome === "ok" || outcome === "already";
  const title =
    outcome === "ok"
      ? t.verifiedTitle
      : outcome === "already"
        ? t.verifiedTitle
        : outcome === "expired"
          ? t.verifyExpiredTitle
          : t.verifyInvalidTitle;
  const body =
    outcome === "ok"
      ? t.verifiedBody
      : outcome === "already"
        ? t.verifyAlready
        : outcome === "expired"
          ? t.verifyExpiredBody
          : t.verifyInvalidBody;

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-20">
      <div className="glass-card w-full max-w-md space-y-5 p-7 text-center">
        <div className="flex justify-center">
          {success ? (
            <CheckCircle2 className="size-12 text-emerald-400" />
          ) : (
            <XCircle className="size-12 text-rose-400" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-ink-hi">{title}</h1>
          <p className="mt-2 text-sm text-ink-low" dir="auto">
            {body}
          </p>
        </div>

        {success ? (
          <Button asChild className="w-full">
            <Link href={`/${locale}/login`}>{t.signIn}</Link>
          </Button>
        ) : (
          <VerifyResend email={address.ok ? (address.value ?? "") : ""} />
        )}
      </div>
    </div>
  );
}
