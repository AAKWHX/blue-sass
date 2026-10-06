import { Hero } from "@/components/public/hero";
import { Services } from "@/components/public/service-cards";
import { CompanySection } from "@/components/public/company-section";
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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const portfolio = (await portfolioEntries()).slice(0, 3);
  return (
    <div className="public-flow">
      <Hero />
      <AgencyProofStrip />
      <Services solutionsOnly />
      <AuditPromo locale={locale}/>
      <PromotionBanner/>
      {portfolio.length > 0 && <LivePortfolio entries={portfolio} embedded/>}
      <CompanySection />
      <HostingSection />
      <HomeFaq />
      <CallToAction />
    </div>
  );
}
