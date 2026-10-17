import type { Metadata } from "next";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";
export function localeAlternates(locale: string, path: string): Metadata["alternates"] {
 if (!isLocale(locale)) return undefined;
 if (path && !/^\/[a-z0-9/-]+$/.test(path)) throw new Error("Invalid metadata path");
 return { canonical: `/${locale}${path}`, languages: { ...Object.fromEntries(locales.map(l => [l, `/${l}${path}`])), "x-default": `/${defaultLocale}${path}` } };
}
export function pageMetadata(locale: string, path: string, title: string, description: string): Metadata {
 if (!isLocale(locale)) return {};
 return { title: { absolute: title }, description, keywords: [title, "Blue Sass"], alternates: localeAlternates(locale, path), openGraph: { title, description, url: `/${locale}${path}`, locale, type: "website", siteName: "Blue Sass" }, twitter: { card: "summary", title, description } };
}
