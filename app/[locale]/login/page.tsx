import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/auth-forms";
import { getViewer } from "@/lib/db/access";
import { isDatabaseConfigured } from "@/lib/db";

export const metadata = { title: "Sign in — AAKWHX" };

export default async function LoginPage({
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
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
