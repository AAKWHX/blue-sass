import { notFound } from "next/navigation";
import { Services } from "@/components/public/service-cards";
import { CallToAction } from "@/components/public/process";
import { getDictionary, isLocale } from "@/lib/i18n";
import { PromotionBanner } from "@/components/public/website-pricing";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return <>
    <section className="border-b border-black bg-neon-cyan"><div className="container-x py-16 text-center sm:py-24"><span className="text-sm font-bold text-black/60">BLUE SASS / SERVICES</span><h1 className="mx-auto mt-4 max-w-4xl text-5xl font-bold text-black sm:text-8xl">{t.services.title}</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-9 text-black/65">{t.services.subtitle}</p></div></section>
    <Services />
    <PromotionBanner/>
    <CallToAction />
  </>;
}
