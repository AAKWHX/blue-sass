import { Hero } from "@/components/public/hero";
import { Services } from "@/components/public/services";
import { CompanySection } from "@/components/public/company-section";
import { CallToAction } from "@/components/public/process";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <CompanySection />
      <CallToAction />
    </>
  );
}
