import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/auth-forms";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getViewer } from "@/lib/db/access";
import { isDatabaseConfigured } from "@/lib/db";

export const metadata = { title: "Sign in — AAKWHX" };

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  const t = getDictionary(isLocale(locale) ? locale : "en");
  if (isDatabaseConfigured) {
    const viewer = await getViewer();
    if (viewer) redirect(`/${locale}/portal`);
  }

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-20">
      <div className="w-full max-w-md">
        {error && <p role="alert" className="mb-5 rounded-lg border border-rose-400/30 p-4 text-sm text-rose-300">{error === "OAuthAccountNotLinked" ? t.auth.googleAccountExists : t.auth.googleError}</p>}
        {process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && <GoogleSignIn />}
        <LoginForm />
      </div>
    </div>
  );
}
