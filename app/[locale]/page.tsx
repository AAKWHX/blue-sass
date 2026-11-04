import { publicPageMetadata } from "@/lib/i18n/seo";
import { CompanyHome } from "@/components/public/company-home";
import { HomeFaq } from "@/components/public/home-extras";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return publicPageMetadata((await params).locale, "home", ""); }
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params;
 if (!isLocale(locale)) notFound();
 return <CompanyHome locale={locale}><HomeFaq/></CompanyHome>;
}
