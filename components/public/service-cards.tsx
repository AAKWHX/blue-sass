"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Reveal } from "@/components/ui/motion";
import { serviceCatalog } from "@/lib/service-catalog";
import { ServiceArt } from "./service-art";

export function Services() {
  const { locale, t } = useI18n();
  return <section id="services" className="section-y relative overflow-hidden border-b border-line/70"><div className="container-x">
    <Reveal><span className="mono-label">Blue Sass / 01</span><div className="mt-5 grid gap-5 lg:grid-cols-[.75fr_1fr] lg:items-end"><h2 className="text-3xl font-semibold sm:text-5xl">{t.nav.services}</h2><p className="max-w-2xl leading-8 text-ink-low lg:justify-self-end">{t.services.subtitle}</p></div></Reveal>
    <div className="services-bento mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{serviceCatalog(locale).map((item,index)=><Reveal key={item.slug} as="article" delay={(index%3)*.06} className={index === 0 || index === 4 ? "lg:col-span-2" : ""}>
      <Link href={`/${locale}/services/${item.slug}`} className="service-card group">
        <div className="service-art"><ServiceArt kind={item.slug} label={item.title}/></div>
        <div className="relative z-10 mt-auto pt-6"><div className="flex items-start justify-between gap-4"><h3 className="text-xl font-semibold sm:text-2xl">{item.title}</h3><span className="service-arrow"><ArrowUpRight aria-hidden className="size-4"/></span></div>
        <p className="mt-3 max-w-xl text-sm leading-7 text-ink-low sm:text-base">{item.description}</p><ul className="mt-5 flex flex-wrap gap-2">{item.features.map(f=><li key={f} className="chip">{f}</li>)}</ul></div>
      </Link>
    </Reveal>)}</div>
  </div></section>;
}
