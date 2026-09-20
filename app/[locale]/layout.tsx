import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fontVariables } from "@/lib/fonts";
import { CursorGlow, ScrollProgress } from "@/components/ui/chrome";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";
import { getDir, isLocale, locales } from "@/lib/i18n";
import { getViewer } from "@/lib/db/access";
import { isDatabaseConfigured } from "@/lib/db";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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

  // Resolved server-side so the header shows the right auth state immediately.
  const signedIn = isDatabaseConfigured ? (await getViewer()) !== null : false;

  return (
    <html lang={locale} dir={getDir(locale)} className={fontVariables} suppressHydrationWarning>
      <body className="bg-base text-ink-mid">
        {/* The full-page shader backdrop: Aurora + MoltenMetal. Fixed and
            never interactive. The old three.js ambient field used to render
            on top of this at the same z-index and hid it, so it is gone. */}
        <AuroraBackdrop />
        <CursorGlow />
        <ScrollProgress />

        <Providers locale={locale}>
          {/* relative + z-content keeps every page above the fixed 3D field. */}
          <div className="relative z-content flex min-h-screen flex-col">
            <SiteHeader signedIn={signedIn} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
