import Link from "next/link";
import { serviceCatalog } from "@/lib/service-catalog";
import { solutionGroups, type SolutionKey } from "@/lib/solutions";
import { solutionCopy } from "@/lib/i18n/solution-copy";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { serviceDetails } from "@/lib/service-details";
import { baseCost, formatEUR, type ProjectType } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
export function SolutionPage({ locale, solution }: { locale: Locale; solution: SolutionKey }) {
  const c = solutionCopy(locale); const t = getDictionary(locale); const group = solutionGroups[solution];
  const services = serviceCatalog(locale).filter(item => (group.services as readonly string[]).includes(item.slug)); const details = serviceDetails(locale === "ar" || locale === "nl" ? locale : "en");
  return <div className="public-flow service-page-flow"><section className="container-x pt-12"><Button asChild variant="outline" className="border-white/25 text-white"><Link href={`/${locale}/services`}>{t.nav.services}</Link></Button><h1 className="mt-7 text-4xl font-bold text-white sm:text-6xl">{c[solution]}</h1><p className="mt-5 max-w-3xl text-sm leading-8 text-white/65">{c.intro}</p><p className="mt-3 max-w-3xl text-sm leading-8 text-white/75">{c.audience}</p><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map(item => { const scope = details[item.slug]; const price = formatEUR(baseCost[item.quoteType as ProjectType].price, locale); return <article key={item.slug} className="rounded-2xl border border-white/15 bg-[#101216] p-6"><h2 className="text-xl font-semibold text-white">{item.title}</h2><p className="mt-2 text-xs font-medium text-white/55">{scope.timeline} · {price}</p><p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p><ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs leading-6 text-white/70">{item.features.map((d: string) => <li key={d}>• {d}</li>)}</ul><div className="mt-5 flex flex-wrap gap-3"><Button asChild variant="outline" className="border-white/25 text-white"><Link href={`/${locale}/services/${item.slug}`}>{t.common.learnMore}</Link></Button><Button asChild variant="neon"><Link href={`/${locale}/contact#inquiry`}>{t.hero.ctaPrimary}</Link></Button></div></article>; })}</div></section></div>;
}
