import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./lib/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

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

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) {
    // Expose the path to the root layout so it can render <html lang/dir>
    // correctly on the SERVER. Next's internal x-invoke-path is not reliable.
    const headers = new Headers(req.headers);
    headers.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers } });
  }

  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
