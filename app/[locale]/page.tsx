import { Hero } from "@/components/public/hero";
import { Services } from "@/components/public/service-cards";
import { DeliveryJourney } from "@/components/public/delivery-journey";
import { CompanySection } from "@/components/public/company-section";
import { CallToAction } from "@/components/public/process";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DeliveryJourney />
      <Services />
      <CompanySection />
      <CallToAction />
    </>
  );
}
