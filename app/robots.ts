import type { MetadataRoute } from "next";

const privateDisallows = [
  "/api/",
  "/ar/admin", "/en/admin", "/nl/admin",
  "/ar/portal", "/en/portal", "/nl/portal",
  "/ar/login", "/en/login", "/nl/login",
  "/ar/register", "/en/register", "/nl/register",
  "/ar/forgot-password", "/en/forgot-password", "/nl/forgot-password",
  "/ar/verify", "/en/verify", "/nl/verify",
  "/ar/staff", "/en/staff", "/nl/staff",
  "/ar/quote", "/en/quote", "/nl/quote",
  "/ar/create-project", "/en/create-project", "/nl/create-project",
];

export default function robots(): MetadataRoute.Robots {
  if (process.env.QA_PUBLIC_ONLY === "1") {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: privateDisallows,
    },
    sitemap: "https://www.bluesass.nl/sitemap.xml",
  };
}
