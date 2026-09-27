import { TemplateGallery } from "@/components/public/template-gallery";
import { pageMetadata } from "@/lib/page-metadata";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return pageMetadata((await params).locale, "/templates", "قوالب المواقع والتطبيقات — بلو ساس", "استعرض قوالب خدمات بلو ساس وأمثلة الواجهات واختر نقطة البداية لمشروعك."); }
export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
 const { group } = await searchParams;
 return <TemplateGallery group={group}/>;
}
