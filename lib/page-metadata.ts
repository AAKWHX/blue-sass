import type { Metadata } from "next";
import { isLocale, locales } from "@/lib/i18n/config";
export function pageMetadata(locale: string, path: string, title: string, description: string): Metadata {
 if (!isLocale(locale)) return {};
 return { title, description, alternates: { canonical: `/${locale}${path}`, languages: { ...Object.fromEntries(locales.map(l => [l, `/${l}${path}`])), "x-default": `/ar${path}` } }, openGraph: { title, description, url: `/${locale}${path}` } };
}
