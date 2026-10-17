import { extraLocales, type ExtraLocale } from "./config";
import it from "./locales-extra/it.json";
import pt from "./locales-extra/pt.json";
import pl from "./locales-extra/pl.json";
import uk from "./locales-extra/uk.json";
import ru from "./locales-extra/ru.json";
import zh from "./locales-extra/zh.json";
import ja from "./locales-extra/ja.json";
import ko from "./locales-extra/ko.json";

export const extraLexicons: Record<ExtraLocale, Record<string, string>> = { it, pt, pl, uk, ru, zh, ja, ko };
const fragmentKeys = Object.fromEntries(extraLocales.map(locale => [locale, Object.keys(extraLexicons[locale]).filter(key => key.trim().length > 8).sort((a, b) => b.length - a.length)])) as Record<ExtraLocale, string[]>;

export function translateExtraText(value: string, locale: ExtraLocale): string {
  const lexicon = extraLexicons[locale];
  if (Object.hasOwn(lexicon, value)) return lexicon[value];
  // Static fragments from existing dynamic copy, with numbers/arguments untouched.
  const fragments = fragmentKeys[locale].filter(key => value.includes(key));
  let result = value;
  for (const key of fragments) result = result.replaceAll(key, lexicon[key]);
  return result;
}

export function localizeExtra<T>(value: T, locale: ExtraLocale): T {
  if (typeof value === "string") return translateExtraText(value, locale) as T;
  if (typeof value === "function") return ((...args: unknown[]) => localizeExtra(value(...args), locale)) as T;
  if (Array.isArray(value)) return value.map(item => localizeExtra(item, locale)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeExtra(item, locale)])) as T;
  return value;
}

export function localizeForLocale<T>(value: T, locale: string): T {
  return (extraLocales as readonly string[]).includes(locale) ? localizeExtra(value, locale as ExtraLocale) : value;
}

export function withExtraLocales<T extends { en: unknown }>(original: T): T & Record<ExtraLocale, T["en"]> {
  return { ...original, ...Object.fromEntries(extraLocales.map(locale => [locale, localizeExtra(original.en, locale)])) } as T & Record<ExtraLocale, T["en"]>;
}
