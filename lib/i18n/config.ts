export const locales = ["ar", "en", "nl", "de", "tr", "fr", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeMeta: Record<Locale, { name: string; native: string; flag: string; dir: "rtl" | "ltr" }> = {
  ar: { name: "Arabic", native: "العربية", flag: "🇸🇦", dir: "rtl" },
  en: { name: "English", native: "English", flag: "🇬🇧", dir: "ltr" },
  nl: { name: "Dutch", native: "Nederlands", flag: "🇳🇱", dir: "ltr" },
  de: { name: "German", native: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  tr: { name: "Turkish", native: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  fr: { name: "French", native: "Français", flag: "🇫🇷", dir: "ltr" },
  es: { name: "Spanish", native: "Español", flag: "🇪🇸", dir: "ltr" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDir(locale: Locale): "rtl" | "ltr" {
  return localeMeta[locale].dir;
}
