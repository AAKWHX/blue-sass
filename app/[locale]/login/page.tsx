import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/auth-forms";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getViewer } from "@/lib/db/access";
import { isDatabaseConfigured } from "@/lib/db";
import { BrandLogo } from "@/components/brand-logo";
import { quoteReturnPath } from "@/lib/auth/return-path";

export const metadata = { title: "Sign in — Blue Sass" };

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { locale } = await params;
  const { error, next } = await searchParams;
  const returnTo = quoteReturnPath(next, locale);
  const t = getDictionary(isLocale(locale) ? locale : "en");
  if (isDatabaseConfigured) {
    const viewer = await getViewer();
    if (viewer) redirect(returnTo);
  }

  return (
    <div className="container-x grid min-h-[76vh] place-items-center py-14 sm:py-20">
      <div className="w-full max-w-md">
        <div className="mb-7 flex justify-center"><BrandLogo /></div>
        {error && <p role="alert" className="mb-5 rounded-lg border border-rose-400/30 p-4 text-sm text-rose-300">{error === "OAuthAccountNotLinked" ? t.auth.googleAccountExists : t.auth.googleError}</p>}
        <LoginForm returnTo={returnTo} googleEnabled={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)} />
      </div>
    </div>
  );
}
