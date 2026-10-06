import Link from "next/link";
import { serviceCatalog } from "@/lib/service-catalog";
import { solutionGroups, type SolutionKey } from "@/lib/solutions";
import { solutionCopy } from "@/lib/i18n/solution-copy";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { TemplateGallery } from "@/components/public/template-gallery";
import { Button } from "@/components/ui/button";
export function SolutionPage({ locale, solution }: { locale: Locale; solution: SolutionKey }) {
  const c = solutionCopy(locale); const t = getDictionary(locale); const group = solutionGroups[solution];
  const services = serviceCatalog(locale).filter(item => (group.services as readonly string[]).includes(item.slug));
  return <div className="public-flow service-page-flow"><section className="container-x pt-12"><Button asChild variant="outline" className="border-white/25 text-white"><Link href={`/${locale}/services`}>{t.nav.services}</Link></Button><h1 className="mt-7 text-4xl font-bold text-white sm:text-6xl">{c[solution]}</h1><p className="mt-5 max-w-3xl text-sm leading-8 text-white/65">{c.intro}</p><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map(item => <article key={item.slug} className="rounded-2xl border border-white/15 bg-[#101216] p-6"><h2 className="text-xl font-semibold text-white">{item.title}</h2><p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p><Button asChild variant="outline" className="mt-5 border-white/25 text-white"><Link href={`/${locale}/services/${item.slug}`}>{t.common.learnMore}</Link></Button></article>)}</div></section><TemplateGallery embedded allowedServices={group.services}/></div>;
}
