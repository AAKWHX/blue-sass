import type { ActiveLocale } from "./config";
export const text = (ar: string, en: string, nl: string): Record<ActiveLocale, string> => ({ ar, en, nl });
