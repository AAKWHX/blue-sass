import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

const origin = "https://www.bluesass.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/quote"];
  return locales.flatMap((locale) => paths.map((path) => ({
    url: `${origin}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: path ? "monthly" : "weekly",
    priority: path ? 0.7 : 1,
  })));
}
