import type { Locale } from "./config";
import en, { type Dictionary } from "./dictionaries/en";
import ar from "./dictionaries/ar";
import nl from "./dictionaries/nl";
import { retiredLocales } from "./config";

export const dictionaries = { en, ar, nl, ...Object.fromEntries(retiredLocales.map(locale => [locale, en])) } as Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

export type { Dictionary };
export * from "./config";
