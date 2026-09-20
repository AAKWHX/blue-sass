import type { Locale } from "./config";
import en, { type Dictionary } from "./dictionaries/en";
import ar from "./dictionaries/ar";
import nl from "./dictionaries/nl";
import de from "./dictionaries/de";
import tr from "./dictionaries/tr";
import fr from "./dictionaries/fr";
import es from "./dictionaries/es";

export const dictionaries: Record<Locale, Dictionary> = { en, ar, nl, de, tr, fr, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

export type { Dictionary };
export * from "./config";
