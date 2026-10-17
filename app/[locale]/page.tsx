import { publicPageMetadata } from "@/lib/i18n/seo";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return publicPageMetadata((await params).locale, "home", ""); }
import { CinematicHome } from "@/components/public/cinematic-home";
import { HomeFaq } from "@/components/public/home-extras";
import { portfolioEntries } from "@/lib/db/portfolio";
import { AuditPromo } from "@/components/public/audit-promo";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { publicMetrics } from "@/lib/db/site-content";
import { serviceCatalog } from "@/lib/service-catalog";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const [entries, metrics] = await Promise.all([portfolioEntries(), publicMetrics()]);
  const portfolio=entries.slice(0,3);
  return (
    <CinematicHome locale={locale} services={serviceCatalog(locale)} entries={portfolio}>
      {metrics.length>0&&<section className="section-y"><div className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map((row,index)=><div key={index} className="rounded-2xl border border-white/15 p-6"><p className="text-3xl font-semibold text-white">{new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(row.value)}{row.suffix}</p><p className="mt-3 text-sm text-white/70">{row.label}</p></div>)}</div></section>}
      <AuditPromo locale={locale}/>
      <HomeFaq />
    </CinematicHome>
  );
}
