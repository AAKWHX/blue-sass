import { publicPageCopy } from "@/lib/i18n/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { arabicFont, fontVariables } from "@/lib/fonts";
import { ScrollProgress } from "@/components/ui/chrome";
import { getDir, isLocale, locales } from "@/lib/i18n";
import { getViewer } from "@/lib/db/access";
import { isDatabaseConfigured } from "@/lib/db";
import { AdSense } from "@/components/adsense";
import { adsensePublisher, isAdsensePublisherVerified, isAdsenseRuntimeEnabled } from "@/lib/advertising";
import { PublicSurface } from "@/components/public/public-surface";
import { NavigationScroll } from "@/components/navigation-scroll";
import "../globals.css";
import "@/components/public/review-polish.css";
import { SitePressFeedback } from "@/components/site-press-feedback";
import "@/components/site-refinement.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Page-specific canonicals belong to pages, never to this shared layout.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
 const { locale } = await params;
 if (!isLocale(locale)) return {};
 const copy = publicPageCopy(locale, "home");
 return { title: copy.title, description: copy.description, keywords: [copy.title, "Blue Sass"],
  openGraph: { type: "website", siteName: "Blue Sass", locale, title: copy.title, description: copy.description },
  twitter: { card: "summary", title: copy.title, description: copy.description } };
}

/**
 * This segment owns <html>, not the root layout.
 *
 * `lang` and `dir` therefore come from the route params and are correct in
 * the SERVER-rendered markup — Arabic ships as RTL rather than shipping LTR
 * and snapping on hydration — while every page still prerenders statically.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.bluesass.nl/#organization",
        name: "Blue Sass",
        alternateName: ["بلو ساس", "BlueSass"],
        url: "https://www.bluesass.nl",
        logo: "https://www.bluesass.nl/icon.png",
        email: "help@bluesass.nl",
        telephone: "+31634543374",
      },
      {
        "@type": "WebSite",
        "@id": "https://www.bluesass.nl/#website",
        name: locale === "ar" ? "بلو ساس" : "Blue Sass",
        alternateName: locale === "ar" ? "Blue Sass" : "بلو ساس",
        url: "https://www.bluesass.nl",
        inLanguage: locale,
        publisher: { "@id": "https://www.bluesass.nl/#organization" },
      },
    ],
  };

  // Resolved server-side so the header shows the right auth state immediately.
   const viewer = isDatabaseConfigured ? await getViewer() : null;

  return (
    <html lang={locale} dir={getDir(locale)} className={`${fontVariables}${locale === "ar" ? ` ${arabicFont.variable}` : ""}`} suppressHydrationWarning>
      <head>{isAdsensePublisherVerified && <meta name="google-adsense-account" content={adsensePublisher}/>}<AdSense signedIn={Boolean(viewer)} publisher={adsensePublisher} enabled={isAdsenseRuntimeEnabled}/></head>
      <body className="bg-base text-ink-mid">
        <NavigationScroll /><SitePressFeedback/>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <ScrollProgress />

        <Providers locale={locale}>
          {/* relative + z-content keeps every page above the fixed 3D field. */}
          <div className="relative z-content flex min-h-screen flex-col">
            <SiteHeader signedIn={Boolean(viewer)} userName={viewer?.name ?? undefined} userImage={viewer?.image ?? undefined} canAdmin={Boolean(viewer?.isOwner || viewer?.permissions.length)} />
            {process.env.QA_PUBLIC_ONLY === "1" && <aside role="status" className="mt-24 border-b border-line bg-surface px-4 py-3 text-center text-sm leading-7 text-ink-high">{{ ar: "نسخة QA محلية للعرض: الحسابات والحفظ والدفع غير متاحة في هذا الوضع.", en: "Local QA preview: accounts, saving and payments are unavailable in this mode.", nl: "Lokale QA-preview: accounts, opslaan en betalen zijn in deze modus niet beschikbaar." }[locale]}</aside>}
            <main className="flex-1"><PublicSurface>{children}</PublicSurface></main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
