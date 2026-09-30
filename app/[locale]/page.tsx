import { Hero } from "@/components/public/hero";
import { Services } from "@/components/public/service-cards";
import { DeliveryJourney } from "@/components/public/delivery-journey";
import { CompanySection } from "@/components/public/company-section";
import { CallToAction } from "@/components/public/process";
import { HomeFaq } from "@/components/public/home-extras";
import { LivePortfolio } from "@/components/public/live-portfolio";
import { portfolioEntries } from "@/lib/db/portfolio";
import { PromotionBanner } from "@/components/public/website-pricing";
import { AgencyProofStrip } from "@/components/ui/agency-proof-strip";
import { StaggerShowcase } from "@/components/ui/stagger-showcase";
import { HostingSection } from "@/components/public/hosting-section";

export default async function HomePage() {
  const portfolio = (await portfolioEntries()).slice(0, 3);
  return (
    <>
      <Hero />
      <AgencyProofStrip />
      <Services />
      <DeliveryJourney />
      <PromotionBanner/>
      {portfolio.length > 0 && <LivePortfolio entries={portfolio} embedded/>}
      <CompanySection />
      <HostingSection />
      <StaggerShowcase />
      <HomeFaq />
      <CallToAction />
    </>
  );
}
