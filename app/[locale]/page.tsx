import { Hero } from "@/components/public/hero";
import { Services } from "@/components/public/services";
import { Portfolio } from "@/components/public/portfolio";
import { TechMarquee } from "@/components/public/tech-marquee";
import { CallToAction, Process } from "@/components/public/process";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Portfolio />
      <Process />
      <TechMarquee />
      <CallToAction />
    </>
  );
}
