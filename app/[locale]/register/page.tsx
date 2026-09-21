import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/auth-forms";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { getViewer } from "@/lib/db/access";
import { isDatabaseConfigured } from "@/lib/db";

export const metadata = { title: "Create account — Blue Sass" };

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (isDatabaseConfigured) {
    const viewer = await getViewer();
    if (viewer) redirect(`/${locale}/portal`);
  }

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-20">
      <div className="w-full max-w-xl">
        {process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && <GoogleSignIn />}
        <RegisterForm />
      </div>
    </div>
  );
}
