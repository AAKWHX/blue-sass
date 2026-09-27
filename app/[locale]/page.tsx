import { Hero } from "@/components/public/hero";
import { Services } from "@/components/public/service-cards";
import { DeliveryJourney } from "@/components/public/delivery-journey";
import { CompanySection } from "@/components/public/company-section";
import { CallToAction } from "@/components/public/process";
import { TestimonialsAndFaq } from "@/components/public/home-extras";
import { LivePortfolio } from "@/components/public/live-portfolio";
import { portfolioEntries } from "@/lib/db/portfolio";
import { PromotionBanner } from "@/components/public/website-pricing";

export default async function HomePage() {
  const portfolio = (await portfolioEntries()).slice(0, 3);
  return (
    <>
      <Hero />
      <PromotionBanner/>
      <DeliveryJourney />
      <Services />
      {portfolio.length > 0 && <LivePortfolio entries={portfolio} embedded/>}
      <CompanySection />
      <TestimonialsAndFaq />
      <CallToAction />
    </>
  );
}
