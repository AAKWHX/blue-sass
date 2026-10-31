import { serviceSlugs } from "./lib/service-catalog";
import { toolIds } from "./lib/tools/catalog";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales, retiredLocales } from "./lib/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;
// Explicit App Router pages are separate from the dynamic service catalog.
const staticServicePages: readonly string[] = ["apps", "company", "systems"];

function detectLocale(req: NextRequest): string {
  const cookieLocale = req.cookies.get("awwa-locale")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) return cookieLocale;

  const header = req.headers.get("accept-language");
  if (header) {
    for (const part of header.split(",")) {
      const tag = part.split(";")[0].trim().toLowerCase();
      const base = tag.split("-")[0];
      if ((locales as readonly string[]).includes(base)) return base;
    }
  }
  return defaultLocale;
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];
  if ((retiredLocales as readonly string[]).includes(first)) {
    const url = req.nextUrl.clone();
    url.pathname = `/en${pathname.slice(first.length + 1)}`;
    return NextResponse.redirect(url, 308);
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) {
    // Expose the path to the root layout so it can render <html lang/dir>
    // correctly on the SERVER. Next's internal x-invoke-path is not reliable.
    const headers = new Headers(req.headers);
    headers.set("x-pathname", pathname);
    const parts = pathname.split("/");
    let slug = parts[3] ?? "";
    try { slug = decodeURIComponent(slug); } catch { slug = ""; }
    const unknownService = parts[2] === "services" && Boolean(slug) &&
      !staticServicePages.includes(slug) && !(serviceSlugs as readonly string[]).includes(slug) && !["mobile", "cloud", "security"].includes(slug);
    const unknownTool = parts[2] === "tools" && Boolean(slug) &&
      !(toolIds as readonly string[]).includes(slug);
    if (unknownService || unknownTool) {
      // Route invalid finite-catalog IDs through the full global error document
      // before Next renders a matched dynamic page's late notFound() boundary.
      const missing = req.nextUrl.clone();
      missing.pathname = `/${parts[1]}/__blue-sass-unmatched__`;
      return NextResponse.rewrite(missing, { request: { headers } });
    }
    return NextResponse.next({ request: { headers } });
  }

  if (PUBLIC_FILE.test(pathname)) return NextResponse.next();

  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
