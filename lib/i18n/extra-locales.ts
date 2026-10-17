import { extraLocales, type ExtraLocale } from "./config";

// Retired translations remain archived; public bundles no longer load their lexicons.
export function localizeForLocale<T>(value: T, _locale: string): T { return value; }
export function withExtraLocales<T extends { en: unknown }>(original: T): T & Record<ExtraLocale, T["en"]> {
  return { ...original, ...Object.fromEntries(extraLocales.map(locale => [locale, original.en])) } as T & Record<ExtraLocale, T["en"]>;
}
