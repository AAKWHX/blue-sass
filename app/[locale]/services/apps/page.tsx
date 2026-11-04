import { publicPageMetadata } from "@/lib/i18n/seo";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return publicPageMetadata((await params).locale, "apps", "/services/apps"); }
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { SolutionPage } from "@/components/public/solution-page";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <SolutionPage locale={locale} solution="apps"/>; }
