import { withExtraLocales } from "@/lib/i18n/extra-locales";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fontVariables } from "@/lib/fonts";
import { ScrollProgress } from "@/components/ui/chrome";
import { getDir, isLocale, locales } from "@/lib/i18n";
import { getViewer } from "@/lib/db/access";
import { isDatabaseConfigured } from "@/lib/db";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const seo = withExtraLocales({
  ar: {
    title: "بلو ساس — تصميم مواقع وتطبيقات ومنتجات رقمية",
    description: "بلو ساس شركة متخصصة في تصميم وتطوير المواقع والتطبيقات والأنظمة الذكية. نحوّل فكرتك إلى منتج رقمي واضح، سريع وجاهز للنمو.",
    keywords: ["بلو ساس", "Blue Sass", "تصميم مواقع", "برمجة تطبيقات", "شركة برمجيات في هولندا", "تطوير أنظمة ذكية"],
  },
  en: {
    title: "Blue Sass — Websites, apps and digital products",
    description: "Blue Sass designs and builds websites, mobile apps and intelligent digital systems from idea to launch.",
    keywords: ["Blue Sass", "web development", "mobile apps", "digital product studio", "software agency Netherlands"],
  },
  nl: {
    title: "Blue Sass — Websites, apps en digitale producten",
    description: "Blue Sass ontwerpt en bouwt websites, mobiele apps en slimme digitale systemen van idee tot lancering.",
    keywords: ["Blue Sass", "website laten maken", "app ontwikkeling", "software bureau Nederland"],
  },
  de: {
    title: "Blue Sass — Websites, Apps und digitale Produkte",
    description: "Blue Sass konzipiert und entwickelt Websites, Apps und intelligente digitale Systeme von der Idee bis zum Launch.",
    keywords: ["Blue Sass", "Webentwicklung", "App Entwicklung", "Software Agentur"],
  },
  tr: {
    title: "Blue Sass — Web siteleri, uygulamalar ve dijital ürünler",
    description: "Blue Sass fikirden lansmana kadar web siteleri, mobil uygulamalar ve akıllı dijital sistemler tasarlar ve geliştirir.",
    keywords: ["Blue Sass", "web sitesi geliştirme", "mobil uygulama", "yazılım ajansı"],
  },
  fr: {
    title: "Blue Sass — Sites web, applications et produits numériques",
    description: "Blue Sass conçoit et développe des sites web, des applications et des systèmes numériques intelligents, de l’idée au lancement.",
    keywords: ["Blue Sass", "développement web", "application mobile", "agence logicielle"],
  },
  es: {
    title: "Blue Sass — Sitios web, aplicaciones y productos digitales",
    description: "Blue Sass diseña y desarrolla sitios web, aplicaciones y sistemas digitales inteligentes desde la idea hasta el lanzamiento.",
    keywords: ["Blue Sass", "desarrollo web", "aplicaciones móviles", "agencia de software"],
  },
} as const);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  // Brand search results intentionally use the Arabic brand title and
  // description across every locale, as requested. Locale-specific terms are
  // still included as keywords and hreflang keeps each language discoverable.
  const copy = seo.ar;
  const localeKeywords = seo[locale].keywords;
  const languages = Object.fromEntries(locales.map((language) => [language, `/${language}`]));

  return {
    title: copy.title,
    description: copy.description,
    keywords: [...copy.keywords, ...localeKeywords],
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      url: `/${locale}`,
      siteName: "Blue Sass | بلو ساس",
      locale,
      title: copy.title,
      description: copy.description,
    },
    twitter: {
      card: "summary",
      title: copy.title,
      description: copy.description,
    },
  };
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
    <html lang={locale} dir={getDir(locale)} className={fontVariables} suppressHydrationWarning>
      <body className="bg-base text-ink-mid">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <ScrollProgress />

        <Providers locale={locale}>
          {/* relative + z-content keeps every page above the fixed 3D field. */}
          <div className="relative z-content flex min-h-screen flex-col">
            <SiteHeader signedIn={Boolean(viewer)} userName={viewer?.name ?? undefined} userImage={viewer?.image ?? undefined} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
