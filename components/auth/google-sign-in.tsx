"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";

export function GoogleSignIn() {
  const { locale, t } = useI18n();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="mb-5">
      <Button type="button" variant="outline" className="w-full bg-white text-black hover:bg-gray-100 hover:text-black" disabled={pending}
        onClick={async () => {
          setPending(true);
          setFailed(false);
          try {
            await signIn("google", { redirectTo: `/${locale}/portal` });
          } catch {
            setFailed(true);
            setPending(false);
          }
        }}>
        <span aria-hidden="true" className="text-lg font-bold">G</span>
        {pending ? t.auth.submitting : t.auth.googleSignIn}
      </Button>
      {failed && <p role="alert" className="mt-2 text-sm text-rose-300">{t.auth.googleError}</p>}
    </div>
  );
}
