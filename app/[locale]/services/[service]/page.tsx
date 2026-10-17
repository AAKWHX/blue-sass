import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { serviceCatalog, serviceSlugs } from "@/lib/service-catalog";
import { pageMetadata } from "@/lib/page-metadata";
import { CreationDetail } from "@/components/public/creation-detail";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; service: string }> }) {
 const { locale, service } = await params;
 if (!isLocale(locale)) return {};
 const item = serviceCatalog(locale).find(item => item.slug === service);
 return item ? pageMetadata(locale, `/services/${service}`, `${item.title} | ${locale === "ar" ? "بلو ساس" : "Blue Sass"}`, item.description) : {};
}


export function generateStaticParams() { return serviceSlugs.map(service => ({service})); }
export default async function ServicePage({ params }: { params: Promise<{ locale: string; service: string }> }) {
  const {locale,service} = await params;
  if (!isLocale(locale)) notFound();
  const aliases: Record<string,string> = {mobile:"android",cloud:"erp",security:"web"};
  if (aliases[service]) permanentRedirect(`/${locale}/services/${aliases[service]}`);
  if (!(serviceSlugs as readonly string[]).includes(service)) notFound();
  return <CreationDetail locale={locale} service={service as typeof serviceSlugs[number]}/>;
}
