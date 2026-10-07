import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { serviceSlugs } from "@/lib/service-catalog";
import { toolIds } from "@/lib/tools/catalog";

const origin = "https://www.bluesass.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/about", "/services", "/subscriptions", "/hosting", "/projects", "/reviews", "/contact", "/create-project", "/privacy", "/terms", "/tools", "/jobs", "/products", "/marketplace", ...toolIds.map(id=>`/tools/${id}`), ...serviceSlugs.map(slug => `/services/${slug}`)];
  return locales.flatMap((locale) => paths.map((path) => ({
    url: `${origin}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: path ? "monthly" : "weekly",
    priority: path ? 0.7 : 1,
  })));
}
