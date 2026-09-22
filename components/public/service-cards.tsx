"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Reveal } from "@/components/ui/motion";
import { serviceCatalog } from "@/lib/service-catalog";
import { ServiceArt } from "./service-art";

export function Services() {
  const { locale, t } = useI18n();
  return <section id="services" className="section-y border-b border-line"><div className="container-x">
    <Reveal><h2 className="text-3xl font-semibold sm:text-5xl">{t.nav.services}</h2><p className="mt-5 max-w-2xl text-lg text-ink-low">{t.hero.subtitle}</p></Reveal>
    <div className="mt-10 grid gap-5 md:grid-cols-2">{serviceCatalog(locale).map((item,index)=><Reveal key={item.slug} as="article" delay={index%2*.08}>
      <Link href={`/${locale}/services/${item.slug}`} className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-line p-5 outline-offset-4 focus-visible:outline-2 focus-visible:outline-white sm:p-7 ${index%3===0?'bg-white/[0.055]':'bg-surface'}`}>
        <div className={index%2?'px-3 sm:px-8':'px-0'}><ServiceArt kind={item.slug} label={item.title}/></div>
        <div className="mt-6 flex items-start justify-between gap-4"><h3 className="text-2xl font-semibold">{item.title}</h3><ArrowUpRight aria-hidden className="size-6 shrink-0 motion-safe:transition-transform motion-safe:group-hover:-translate-y-1"/></div>
        <p className="mt-3 leading-7 text-ink-low">{item.description}</p><ul className="mt-5 flex flex-wrap gap-2">{item.features.map(f=><li key={f} className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-mid">{f}</li>)}</ul>
      </Link>
    </Reveal>)}</div>
  </div></section>;
}
