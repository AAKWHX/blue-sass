import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/page-metadata";
import { indexablePublicPaths } from "@/lib/seo-public-paths";

const origin = "https://www.bluesass.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...new Set(indexablePublicPaths)];
  return locales.flatMap((locale) => paths.map((path) => ({
    url: `${origin}/${locale}${path}`,
    // No reliable content modification date exists for these directory pages.
    // Omit lastModified instead of reporting the build/request time as an edit.
    alternates: { languages: Object.fromEntries(Object.entries(localeAlternates(locale, path)?.languages ?? {}).map(([language, url]) => [language, `${origin}${url}`])) },
  })));
}
