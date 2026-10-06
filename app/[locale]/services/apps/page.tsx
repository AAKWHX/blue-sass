import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { SolutionPage } from "@/components/public/solution-page";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <SolutionPage locale={locale} solution="apps"/>; }
