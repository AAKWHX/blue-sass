import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { fontVariables, arabicFont } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import "./globals.css";

const copy = {
  ar: { title: "الصفحة غير موجودة", description: "الرابط الذي فتحته غير متوفر أو تم نقله. يمكنك العودة إلى الصفحة الرئيسية أو استكشاف خدماتنا.", home: "العودة للرئيسية", services: "تصفح الخدمات" },
  en: { title: "Page not found", description: "The link you followed is unavailable or has moved. Return to the homepage or explore our services.", home: "Back to home", services: "Explore services" },
  nl: { title: "Pagina niet gevonden", description: "De geopende link bestaat niet of is verplaatst. Ga terug naar de startpagina of bekijk onze diensten.", home: "Terug naar home", services: "Diensten bekijken" },
} as const;

// Next's global fallback bypasses the normal layout tree. Request-only locale
// resolution here does not execute inside valid pages' not-found boundaries.
async function errorLocale() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const segment = pathname.split("/")[1];
  return segment === "ar" || segment === "nl" ? segment : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const c = copy[await errorLocale()];
  return { title: c.title, description: c.description, robots: { index: false, follow: false } };
}

export default async function GlobalNotFound() {
  const locale = await errorLocale();
  const c = copy[locale];
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={fontVariables + (locale === "ar" ? ` ${arabicFont.variable}` : "")}>
      <body className="grid min-h-screen place-items-center bg-[#050608] px-6 py-20 text-center text-white">
        <main aria-labelledby="not-found-title" className="max-w-2xl">
          <p className="font-mono text-sm text-[#AEB6BF]">404</p>
          <h1 id="not-found-title" className="mt-4 text-4xl font-semibold text-white sm:text-6xl">{c.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-white/75">{c.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="unstyled" size="auto" className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><Link href={`/${locale}`}>{c.home}</Link></Button>
            <Button asChild variant="unstyled" size="auto" className="rounded-xl border border-white/60 px-5 py-3 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><Link href={`/${locale}/services`}>{c.services}</Link></Button>
          </div>
        </main>
      </body>
    </html>
  );
}
