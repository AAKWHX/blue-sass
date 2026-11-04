import "server-only";

const productionOrigins = new Set(["https://www.bluesass.nl", "https://bluesass.nl"]);
const localOrigin = "http://127.0.0.1:3199";

function origin(value: string): string {
  if (value !== value.trim() || /[\\\s]/.test(value)) throw new Error("SITE_ORIGIN_INVALID");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("SITE_ORIGIN_INVALID"); }
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash || !/^https?:$/.test(url.protocol)) throw new Error("SITE_ORIGIN_INVALID");
  if (value !== url.origin && value !== `${url.origin}/`) throw new Error("SITE_ORIGIN_INVALID");
  return url.origin;
}

/** Request and forwarded headers never determine an outbound link origin. */
export async function getSiteUrl(): Promise<string> {
  const env = process.env;
  const isQa = env.QA_PUBLIC_ONLY === "1" || env.BLUE_SASS_R22_PREVIEW === "1";
  if (isQa || env.NODE_ENV !== "production") {
    if (env.VERCEL_URL || env.VERCEL_PROJECT_PRODUCTION_URL || (env.NEXT_PUBLIC_SITE_URL && env.NEXT_PUBLIC_SITE_URL !== localOrigin)) throw new Error("SITE_ORIGIN_INVALID");
    return localOrigin;
  }
  if (env.NEXT_PUBLIC_SITE_URL) {
    const value = origin(env.NEXT_PUBLIC_SITE_URL);
    if (!productionOrigins.has(value)) throw new Error("SITE_ORIGIN_INVALID");
    return value;
  }
  if (env.VERCEL_ENV === "preview") {
    const trusted = env.BLUE_SASS_VERIFIED_PREVIEW_ORIGIN;
    if (!trusted || env.VERCEL !== "1") throw new Error("SITE_ORIGIN_INVALID");
    const value = origin(trusted);
    if (value !== `https://${env.VERCEL_URL}` || !/^https:\/\/blue-sass-[a-z0-9-]+-genel-tek\.vercel\.app$/.test(value)) throw new Error("SITE_ORIGIN_INVALID");
    return value;
  }
  if (env.VERCEL_PROJECT_PRODUCTION_URL && !productionOrigins.has(origin(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`))) throw new Error("SITE_ORIGIN_INVALID");
  return "https://www.bluesass.nl";
}
