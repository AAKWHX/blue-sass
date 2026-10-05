import { notFound } from "next/navigation";
import { Services } from "@/components/public/service-cards";
import { CallToAction } from "@/components/public/process";
import { isLocale } from "@/lib/i18n";
import { PromotionBanner } from "@/components/public/website-pricing";
import { WebsitePricing } from "@/components/public/website-pricing";
import { TemplateGallery } from "@/components/public/template-gallery";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <div className="public-flow service-page-flow">
    <Services />
    <TemplateGallery embedded />
    <PromotionBanner/>
    <WebsitePricing embedded />
    <CallToAction />
  </div>;
}
