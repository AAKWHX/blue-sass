import { notFound } from "next/navigation";
import { StudioServices } from "@/components/public/studio-sections";
import { CallToAction } from "@/components/public/process";
import { isLocale } from "@/lib/i18n";
import { PromotionBanner } from "@/components/public/website-pricing";
import { WebsitePricing } from "@/components/public/website-pricing";
import { TemplateGallery } from "@/components/public/template-gallery";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <div className="public-flow service-page-flow">
    <StudioServices all />
    <TemplateGallery embedded />
    <PromotionBanner/>
    <WebsitePricing embedded />
    <CallToAction />
  </div>;
}
