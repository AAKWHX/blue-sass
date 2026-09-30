import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/page-metadata";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return pageMetadata((await params).locale, "/templates", "قوالب المواقع والتطبيقات — بلو ساس", "استعرض قوالب خدمات بلو ساس وأمثلة الواجهات واختر نقطة البداية لمشروعك."); }
export default async function TemplatesPage({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params;
 redirect(`/${locale}/services#templates`);
}
