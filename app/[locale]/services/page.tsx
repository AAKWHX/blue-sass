import { publicPageMetadata } from "@/lib/i18n/seo";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return publicPageMetadata((await params).locale, "services", "/services"); }
import { notFound } from "next/navigation";
import { CreationGrid } from "@/components/public/creation-grid";
import { CallToAction } from "@/components/public/process";
import { isLocale } from "@/lib/i18n";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <div className="public-flow service-page-flow">
    <CreationGrid locale={locale} all />
    <CallToAction />
  </div>;
}
