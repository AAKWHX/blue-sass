"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Check, LayoutGrid, Search, Sparkles } from "lucide-react";
import { useI18n } from "@/components/providers";
import { TemplateLivePreview } from "@/components/public/template-live-preview";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { serviceCatalog, type ServiceSlug } from "@/lib/service-catalog";
import { serviceTemplates } from "@/lib/service-templates";
import type { Locale } from "@/lib/i18n";

const galleryCopy: Record<Locale, { search: string; catalog: string; live: string; results: string; empty: string; hint: string }> = {
  ar: { search: "ابحث عن قالب أو خدمة", catalog: "فهرس القوالب", live: "معاينة حية", results: "قالب متاح", empty: "لا توجد قوالب مطابقة. جرّب تصنيفًا آخر.", hint: "مرّر فوق المعاينة، ثم افتحها بالحجم الكامل قبل اختيارها." },
  en: { search: "Search templates or services", catalog: "Template catalog", live: "Live preview", results: "templates available", empty: "No matching templates. Try another category.", hint: "Hover the preview, then open it full-size before choosing." },
  nl: { search: "Zoek sjablonen of diensten", catalog: "Sjablooncatalogus", live: "Live voorbeeld", results: "sjablonen beschikbaar", empty: "Geen passende sjablonen. Kies een andere categorie.", hint: "Beweeg over het voorbeeld en open het groot voordat u kiest." },
  de: { search: "Vorlagen oder Leistungen suchen", catalog: "Vorlagenkatalog", live: "Live-Vorschau", results: "Vorlagen verfügbar", empty: "Keine passenden Vorlagen. Andere Kategorie wählen.", hint: "Vorschau ansehen und vor der Auswahl groß öffnen." },
  tr: { search: "Şablon veya hizmet ara", catalog: "Şablon kataloğu", live: "Canlı önizleme", results: "şablon mevcut", empty: "Eşleşen şablon yok. Başka kategori deneyin.", hint: "Seçmeden önce önizlemeyi tam boyutta açın." },
  fr: { search: "Rechercher un modèle ou service", catalog: "Catalogue de modèles", live: "Aperçu interactif", results: "modèles disponibles", empty: "Aucun modèle correspondant. Essayez une autre catégorie.", hint: "Survolez puis ouvrez l’aperçu en grand avant de choisir." },
  es: { search: "Buscar plantillas o servicios", catalog: "Catálogo de plantillas", live: "Vista interactiva", results: "plantillas disponibles", empty: "No hay plantillas coincidentes. Pruebe otra categoría.", hint: "Explore y abra la vista completa antes de elegir." },
};

export function TemplateGallery({ service, group, embedded = false }: { service?: ServiceSlug; group?: string; embedded?: boolean }) {
  const { locale, t } = useI18n();
  const c = t.experience;
  const labels = galleryCopy[locale];
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>(service ?? "all");
  const catalog = serviceCatalog(locale);
  const source = serviceTemplates(locale, service).filter((item) => group === "web" ? ["web", "store", "design"].includes(item.service) : group === "apps" ? ["android", "ios", "windows", "erp", "ai"].includes(item.service) : true);
  const items = useMemo(() => source.filter((item) => {
    if (filter !== "all" && item.service !== filter) return false;
    const serviceName = catalog.find((entry) => entry.slug === item.service)?.title ?? "";
    return `${item.name} ${serviceName}`.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale));
  }), [source, filter, query, catalog, locale]);
  const active = source.find((item) => item.id === selected);
  const featureLabel = (key: string) => t.quote.features[key as keyof typeof t.quote.features];
  const start = (item: typeof source[number]) => `/${locale}/quote?service=${item.service}&template=${item.id}`;

  return <section id="templates" className={`${embedded ? "" : "min-h-screen"} bg-[#050608] py-16 text-white`}><div className="container-x"><div className="grid gap-8 xl:grid-cols-[15rem_minmax(0,1fr)]">
    <aside className="xl:sticky xl:top-28 xl:self-start"><div className="mb-6 flex items-center gap-2 text-sm font-bold"><LayoutGrid className="size-4"/>{labels.catalog}</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-1">
      {!service && <Button variant="unstyled" size="auto" className={`justify-start rounded-xl border px-3 py-2.5 text-xs ${filter === "all" ? "border-white bg-white text-black" : "border-white/10 bg-white/[.03] text-white/65 hover:border-white/25 hover:text-white"}`} onClick={() => setFilter("all")}>{c.allServices}<span className="ms-auto opacity-50">{source.length}</span></Button>}
      {catalog.filter((entry) => source.some((item) => item.service === entry.slug)).map((entry) => <Button key={entry.slug} variant="unstyled" size="auto" className={`justify-start rounded-xl border px-3 py-2.5 text-start text-xs ${filter === entry.slug ? "border-white bg-white text-black" : "border-white/10 bg-white/[.03] text-white/65 hover:border-white/25 hover:text-white"}`} onClick={() => setFilter(entry.slug)}>{entry.title}<span className="ms-auto opacity-50">{source.filter((item) => item.service === entry.slug).length}</span></Button>)}
    </div></aside>
    <div className="min-w-0"><span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.04] px-3 py-1.5 text-xs text-white/70"><Sparkles className="size-3"/>{labels.live}</span>{embedded ? <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-6xl">{c.templates}</h2> : <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-6xl">{c.templates}</h1>}<p className="mt-5 max-w-3xl text-sm leading-7 text-white/70">{c.templateNote} {labels.hint}</p>
      <label className="relative mt-8 block max-w-2xl"><Search className="pointer-events-none absolute start-4 top-1/2 z-content size-4 -translate-y-1/2 text-white/45"/><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} className="h-13 rounded-2xl border-white/12 bg-white/[.045] ps-11 text-white placeholder:text-white/35 focus:border-white/35"/></label><p className="mt-4 text-xs text-white/45">{items.length} {labels.results}</p>
      {items.length ? <div className="mt-7 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{items.map((item, index) => { const serviceInfo = catalog.find((entry) => entry.slug === item.service); return <article key={item.id} className="group/card flex min-w-0 flex-col rounded-[1.4rem] border border-white/10 bg-white/[.035] p-2.5 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[.055]">
        <Button variant="unstyled" size="auto" className="block w-full rounded-2xl text-start focus-visible:ring-offset-[#050608]" onClick={() => setSelected(item.id)} aria-label={`${c.preview}: ${item.name}`}><TemplateLivePreview item={item}/></Button>
        <div className="flex flex-1 flex-col px-2 pb-2 pt-4"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/55">{serviceInfo?.title}</p><span className="font-mono text-[10px] text-white/35">{String(index + 1).padStart(2, "0")}</span></div><h2 className="mt-2 text-lg font-bold leading-snug text-white">{item.name}</h2><ul className="mt-4 space-y-2">{item.features.map((key) => <li key={key} className="flex gap-2 text-xs leading-5 text-white/75"><Check className="mt-0.5 size-3.5 shrink-0 text-white/80"/>{featureLabel(key)}</li>)}</ul><div className="mt-auto flex items-center gap-2 pt-5"><Button variant="outline" className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/8" onClick={() => setSelected(item.id)}>{c.preview}</Button><Button asChild variant="neon" className="flex-1"><Link href={start(item)}>{c.startTemplate}<ArrowUpRight className="size-3.5"/></Link></Button></div></div>
      </article>; })}</div> : <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-12 text-center text-sm text-white/50">{labels.empty}</div>}
    </div>
  </div></div>
  <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="border-white/12 bg-[#090b0f]/98 text-white sm:max-w-6xl"><DialogHeader><DialogTitle className="pe-10 text-white">{active?.name}</DialogTitle><DialogDescription className="text-white/55">{c.templateNote}</DialogDescription></DialogHeader>{active && <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(15rem,.7fr)]"><TemplateLivePreview item={active} expanded/><div className="flex flex-col"><p className="text-xs font-semibold uppercase tracking-[.18em] text-white/40">{catalog.find((entry) => entry.slug === active.service)?.title}</p><h3 className="mt-3 text-2xl font-bold">{c.options}</h3><ul className="mt-5 space-y-3">{active.features.map((key) => <li key={key} className="flex gap-3 rounded-xl border border-white/8 bg-white/[.035] p-3 text-sm text-white/70"><Check className="size-4 shrink-0 text-white"/>{featureLabel(key)}</li>)}</ul><Button asChild variant="neon" size="lg" className="mt-auto w-full"><Link href={start(active)}>{c.startTemplate}<ArrowUpRight className="size-4"/></Link></Button></div></div>}</DialogContent></Dialog>
  </section>;
}
