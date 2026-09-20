import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/*/admin", "/*/portal", "/*/login", "/*/register"] },
    sitemap: "https://www.bluesass.nl/sitemap.xml",
  };
}
