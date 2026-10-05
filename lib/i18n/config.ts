export const baseLocales = ["ar", "en", "nl", "de", "tr", "fr", "es"] as const;
export const extraLocales = ["it", "pt", "pl", "uk", "ru", "zh", "ja", "ko"] as const;
export type ExtraLocale = typeof extraLocales[number];
export const locales = [...baseLocales, ...extraLocales] as const;
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
  it: { name: "Italian", native: "Italiano", flag: "🇮🇹", dir: "ltr" },
  pt: { name: "Portuguese", native: "Português", flag: "🇵🇹", dir: "ltr" },
  pl: { name: "Polish", native: "Polski", flag: "🇵🇱", dir: "ltr" },
  uk: { name: "Ukrainian", native: "Українська", flag: "🇺🇦", dir: "ltr" },
  ru: { name: "Russian", native: "Русский", flag: "🇷🇺", dir: "ltr" },
  zh: { name: "Chinese", native: "中文", flag: "🇨🇳", dir: "ltr" },
  ja: { name: "Japanese", native: "日本語", flag: "🇯🇵", dir: "ltr" },
  ko: { name: "Korean", native: "한국어", flag: "🇰🇷", dir: "ltr" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDir(locale: Locale): "rtl" | "ltr" {
  return localeMeta[locale].dir;
}
