"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, LayoutTemplate } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { serviceTemplates } from "@/lib/service-templates";
import { serviceCatalog, type ServiceSlug } from "@/lib/service-catalog";

export function TemplateGallery({ service, group }: { service?: ServiceSlug; group?: string }) {
 const { locale, t } = useI18n();
 const c = t.experience;
 const [selected, setSelected] = useState<string | null>(null);
 const [screen, setScreen] = useState(0);
 const [filter, setFilter] = useState<string>(service ?? "all");
 const catalog = serviceCatalog(locale);
 const items = serviceTemplates(locale, service).filter(item => group === "web" ? ["web", "store", "design"].includes(item.service) : group === "apps" ? ["android", "ios", "windows", "erp", "ai"].includes(item.service) : true);
 const active = items.find(item => item.id === selected);
 const featureLabel = (key: string) => t.quote.features[key as keyof typeof t.quote.features];
 const preview = (item: typeof items[number], detail = false) => <div className={`overflow-hidden rounded-2xl border border-black/15 p-5 ${item.variant ? "bg-black text-white" : "bg-[#e8f3ff] text-black"}`}>
   <div className="mb-5 flex items-center justify-between border-b border-current/15 pb-3"><span className="text-xs font-bold">{item.name}</span><span aria-hidden className="flex gap-1">● ● ●</span></div>
   <div className={['android','ios'].includes(item.service) ? "mx-auto max-w-48 rounded-3xl border-4 border-current/20 p-3" : "grid grid-cols-[1fr_1.3fr] gap-4"}>
    <div><LayoutTemplate className="mb-3 size-8"/><p className="text-lg font-bold leading-relaxed">{detail ? c.options : item.name}</p><div aria-hidden className="mt-4 h-2 w-4/5 rounded bg-current/20"/><div aria-hidden className="mt-2 h-2 w-3/5 rounded bg-current/10"/></div>
    <div className="mt-3 grid gap-2">{item.features.map((key, i) => <div key={key} className="rounded-lg border border-current/15 bg-white/10 p-3 text-xs leading-5"><span className="me-2 opacity-50">0{i + 1}</span>{featureLabel(key)}{detail && <div aria-hidden className="mt-2 h-2 rounded bg-current/10"/>}</div>)}</div>
   </div>
 </div>;
 const start = (item: typeof items[number]) => `/${locale}/quote?service=${item.service}&template=${item.id}`;
 return <section id="templates" className="container-x py-16">
  <h2 className="text-3xl font-bold sm:text-4xl">{c.templates}</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-ink-low">{c.templateNote}</p>
  {!service && <div className="my-7 flex flex-wrap gap-2"><Button variant={filter === "all" ? "neon" : "outline"} onClick={() => setFilter("all")}>{c.allServices}</Button>{catalog.filter(s => items.some(i => i.service === s.slug)).map(s => <Button key={s.slug} variant={filter === s.slug ? "neon" : "outline"} onClick={() => setFilter(s.slug)}>{s.title}</Button>)}</div>}
  <div className="mt-8 grid gap-6 md:grid-cols-2">{items.filter(item => filter === "all" || item.service === filter).map(item => <article key={item.id} className="rounded-3xl border border-black/15 bg-white p-4 sm:p-6">{preview(item)}<p className="mt-5 text-xs font-semibold text-neon-blue">{catalog.find(s => s.slug === item.service)?.title}</p><h3 className="mt-2 text-xl font-bold">{item.name}</h3><ul className="my-5 space-y-2">{item.features.map(key => <li key={key} className="flex gap-2 text-sm"><Check className="size-4 shrink-0"/>{featureLabel(key)}</li>)}</ul><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { setSelected(item.id); setScreen(0); }}>{c.preview}</Button><Button asChild variant="neon"><Link href={start(item)}>{c.startTemplate}<ArrowUpRight className="size-4"/></Link></Button></div></article>)}</div>
  <Dialog open={Boolean(active)} onOpenChange={open => !open && setSelected(null)}><DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>{active?.name}</DialogTitle><DialogDescription>{c.templateNote}</DialogDescription></DialogHeader>{active && <><div className="flex flex-wrap gap-2">{[c.overview,c.options].map((label, i) => <Button key={label} variant={screen === i ? "neon" : "outline"} aria-pressed={screen === i} onClick={() => setScreen(i)}>{label}</Button>)}</div>{preview(active, screen === 1)}<Button asChild variant="neon"><Link href={start(active)}>{c.startTemplate}</Link></Button></>}</DialogContent></Dialog>
 </section>;
}
