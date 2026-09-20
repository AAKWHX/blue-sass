import { Hero } from "@/components/public/hero";
import { Services } from "@/components/public/services";
import { CallToAction, Process } from "@/components/public/process";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
      <CallToAction />
    </>
  );
}
