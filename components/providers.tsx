"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { dictionaries, getDir, type Dictionary, type Locale } from "@/lib/i18n";
import { ContentProvider } from "@/lib/content-store";

interface I18nValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <Providers>");
  return ctx;
}

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  useEffect(() => {
    document.cookie = `awwa-locale=${locale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = locale;
    document.documentElement.dir = getDir(locale);
  }, [locale]);

  const i18n = useMemo<I18nValue>(
    () => ({ locale, dir: getDir(locale), t: dictionaries[locale] }),
    [locale],
  );

  return (
    <I18nContext.Provider value={i18n}>
      <ContentProvider>{children}</ContentProvider>
    </I18nContext.Provider>
  );
}
