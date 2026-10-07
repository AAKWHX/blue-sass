import { Hero } from "@/components/public/hero";
import { Services } from "@/components/public/service-cards";
import { CallToAction } from "@/components/public/process";
import { HomeFaq } from "@/components/public/home-extras";
import { LivePortfolio } from "@/components/public/live-portfolio";
import { portfolioEntries } from "@/lib/db/portfolio";
import { PromotionBanner } from "@/components/public/website-pricing";
import { AgencyProofStrip } from "@/components/ui/agency-proof-strip";
import { HostingSection } from "@/components/public/hosting-section";
import { AuditPromo } from "@/components/public/audit-promo";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { ProductPromoCards } from "@/components/public/product-promo-cards";
import { publicMetrics } from "@/lib/db/site-content";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const [entries, metrics] = await Promise.all([portfolioEntries(), publicMetrics()]);
  const portfolio=entries.slice(0,3);
  return (
    <div className="public-flow">
      <Hero />
      <AgencyProofStrip />
      <Services solutionsOnly />
      <ProductPromoCards locale={locale}/>
      {metrics.length>0&&<section className="section-y"><div className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map((row,index)=><div key={index} className="rounded-2xl border border-white/15 p-6"><p className="text-3xl font-semibold text-white">{new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(row.value)}{row.suffix}</p><p className="mt-3 text-sm text-white/70">{row.label}</p></div>)}</div></section>}
      <AuditPromo locale={locale}/>
      <PromotionBanner/>
      {portfolio.length > 0 && <LivePortfolio entries={portfolio} embedded/>}
      <HostingSection />
      <HomeFaq />
      <CallToAction />
    </div>
  );
}
