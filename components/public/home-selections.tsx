import Link from "next/link";
import { ArrowUpRight, Building2, Globe, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateLivePreview } from "@/components/public/template-live-preview";
import { getDictionary, type Locale } from "@/lib/i18n";
import { websiteNames, websitePackages } from "@/lib/website-packages";
import { websiteWorkflows } from "@/lib/i18n/website-workflows";
import { applyImplementationDiscount, formatEUR } from "@/lib/pricing";
import { serviceTemplates } from "@/lib/service-templates";

const featuredTypes = [
  { id: "landing", icon: Globe },
  { id: "personal", icon: UserRound },
  { id: "company", icon: Building2 },
  { id: "store", icon: ShoppingBag },
] as const;
const featuredTemplateIds = ["web-1", "store-1", "design-1"];
const browseLabels: Record<Locale, [string, string]> = {
  ar: ["عرض جميع الأنواع والأسعار", "عرض جميع القوالب"],
  en: ["View all types and prices", "View all templates"],
  nl: ["Alle typen en prijzen bekijken", "Alle sjablonen bekijken"],
  de: ["Alle Typen und Preise ansehen", "Alle Vorlagen ansehen"],
  tr: ["Tüm türleri ve fiyatları gör", "Tüm şablonları gör"],
  fr: ["Voir tous les types et tarifs", "Voir tous les modèles"],
  es: ["Ver todos los tipos y precios", "Ver todas las plantillas"],
  it: ["Vedi tutti i tipi e prezzi", "Vedi tutti i modelli"],
  pt: ["Ver todos os tipos e preços", "Ver todos os modelos"],
  pl: ["Zobacz wszystkie typy i ceny", "Zobacz wszystkie szablony"],
  uk: ["Усі типи та ціни", "Усі шаблони"],
  ru: ["Все типы и цены", "Все шаблоны"],
  zh: ["查看所有类型和价格", "查看所有模板"],
  ja: ["すべての種類と料金を見る", "すべてのテンプレートを見る"],
  ko: ["모든 유형 및 가격 보기", "모든 템플릿 보기"],
};

export function HomeSelections({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const c = t.pricing;
  const templates = serviceTemplates(locale).filter((item) => featuredTemplateIds.includes(item.id));

  return <>
    <section id="home-pricing" className="section-y" aria-labelledby="home-pricing-title">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <h2 id="home-pricing-title" className="text-3xl font-bold text-white sm:text-4xl">{c.nav}</h2>
          <Button asChild variant="ghostNeon" className="border-white/25 text-white hover:text-white">
            <Link href={`/${locale}/services#pricing`}>{browseLabels[locale][0]}<ArrowUpRight className="size-4 shrink-0 flip-x" /></Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featuredTypes.map(({ id, icon: Icon }) => {
            const index = websitePackages.findIndex((pack) => pack.id === id);
            const pack = websitePackages[index];
            return <article key={id} data-package={id} className="flex min-w-0 flex-col rounded-3xl border border-white/15 bg-[#101216] p-6 text-white">
              <Icon className="size-7 text-neon-cyan" aria-hidden />
              <h3 className="mt-5 text-xl font-semibold text-white">{websiteNames[locale][index]}</h3>
              <p className="mt-3 text-sm leading-7 text-white/70">{websiteWorkflows[locale][index]}</p>
              <div className="mt-auto pt-6">
                <p className="text-xs text-white/60">{c.from}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-white">{formatEUR(applyImplementationDiscount(pack.low), locale)}</p>
                <p className="mt-3 text-xs leading-6 text-white/60">{c.range}<br />{formatEUR(applyImplementationDiscount(pack.low), locale)} – {formatEUR(applyImplementationDiscount(pack.high), locale)}</p>
                <Button asChild variant="neon" className="mt-5 w-full whitespace-normal text-center">
                  <Link href={`/${locale}/quote?kind=${pack.id}&type=${pack.type}`}>{c.choose}<ArrowUpRight className="size-4 shrink-0 flip-x" /></Link>
                </Button>
              </div>
            </article>;
          })}
        </div>
        <p className="mt-6 max-w-4xl text-xs leading-6 text-white/60">{c.tax}</p>
      </div>
    </section>
    <section id="home-templates" className="section-y" aria-labelledby="home-templates-title">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <h2 id="home-templates-title" className="text-3xl font-bold text-white sm:text-4xl">{t.experience.templates}</h2>
          <Button asChild variant="ghostNeon" className="border-white/25 text-white hover:text-white">
            <Link href={`/${locale}/services#templates`}>{browseLabels[locale][1]}<ArrowUpRight className="size-4 shrink-0 flip-x" /></Link>
          </Button>
        </div>
        <p className="mb-6 max-w-3xl text-sm leading-7 text-white/70">{t.experience.templateNote}</p>
        <div className="grid gap-5 md:grid-cols-3">
          {templates.map((item) => <article key={item.id} className="flex min-w-0 flex-col rounded-3xl border border-white/15 bg-[#101216] p-3 text-white">
            <Link href={`/${locale}/previews/${item.id}`} className="block rounded-2xl" aria-label={`${t.experience.preview}: ${item.name}`}>
              <TemplateLivePreview item={item} showLabels={false} />
            </Link>
            <div className="flex flex-1 flex-col p-3">
              <h3 className="mt-2 text-xl font-semibold text-white">{item.name}</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/70">{item.features.map((key) => <li key={key}>{t.quote.features[key]}</li>)}</ul>
              <div className="mt-auto grid gap-2 pt-6">
                <Button asChild variant="outline" className="w-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Link href={`/${locale}/previews/${item.id}`}>{t.experience.preview}</Link>
                </Button>
                <Button asChild variant="neon" className="w-full whitespace-normal text-center">
                  <Link href={`/${locale}/quote?service=${item.service}&template=${item.id}`}>{t.experience.startTemplate}<ArrowUpRight className="size-4 shrink-0 flip-x" /></Link>
                </Button>
              </div>
            </div>
          </article>)}
        </div>
      </div>
    </section>
  </>;
}
