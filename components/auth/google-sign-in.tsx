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
    <div>
      <Button type="button" variant="outline" className="h-12 w-full border-[#dadce0] bg-white font-medium text-[#3c4043] shadow-sm hover:bg-[#f8faff] hover:text-[#202124]" disabled={pending}
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
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.35l-3.24-2.55c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.63A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.44H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.56l3.35-2.63Z" />
          <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.44l3.35 2.63C7.18 7.7 9.39 5.94 12 5.94Z" />
        </svg>
        {pending ? t.auth.submitting : t.auth.googleSignIn}
      </Button>
      {failed && <p role="alert" className="mt-2 text-sm text-rose-300">{t.auth.googleError}</p>}
    </div>
  );
}
