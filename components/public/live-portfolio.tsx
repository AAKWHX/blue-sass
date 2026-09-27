"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { PortfolioEntry } from "@/lib/db/portfolio";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
function WorkImage({ src, name }: { src: string | null; name: string }) {
 const [failed, setFailed] = useState(false);
 return <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">{src?.startsWith("https://") && !failed ? <Image src={src} alt={name} fill unoptimized className="object-cover" onError={() => setFailed(true)}/> : <div className="grid h-full place-items-center bg-gradient-to-br from-black to-blue-950 p-6 text-center text-xl font-bold text-white">{name}</div>}</div>;
}
export function LivePortfolio({ entries, embedded = false }: { entries: PortfolioEntry[]; embedded?: boolean }) {
 const { locale, t } = useI18n(); const c = t.experience;
 const [active, setActive] = useState<PortfolioEntry | null>(null);
 const Heading = embedded ? "h2" : "h1";
 return <section className="container-x py-16"><Heading className="text-4xl font-bold">{c.portfolio}</Heading><div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{entries.map(entry => <article key={entry.id} className="rounded-3xl border border-black/15 bg-white p-4"><Button variant="unstyled" size="auto" className="block w-full text-start" onClick={() => setActive(entry)}><WorkImage src={entry.cover} name={entry.name}/><h2 className="mt-5 px-2 text-xl font-bold">{entry.name}</h2><p className="mt-3 line-clamp-2 px-2 text-sm leading-7 text-ink-low">{entry.summary}</p><span className="m-2 mt-5 inline-flex items-center gap-2 rounded-xl bg-neon-cyan px-4 py-3 text-sm font-bold">{c.details}<ArrowUpRight className="size-4"/></span></Button></article>)}</div>
 {!entries.length && <div className="mt-7 rounded-2xl border border-dashed border-black/20 p-8"><p>{c.noWork}</p><Button asChild variant="neon" className="mt-5"><Link href={`/${locale}/templates`}>{c.templates}</Link></Button></div>}
 <Dialog open={!!active} onOpenChange={open => !open && setActive(null)}><DialogContent className="sm:max-w-3xl">{active && <><WorkImage src={active.cover} name={active.name}/><DialogHeader><DialogTitle>{active.name}</DialogTitle><DialogDescription className="whitespace-pre-line leading-7">{active.summary}</DialogDescription></DialogHeader><div className="flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-neon-cyan/30 px-3 py-2">{t.status[active.stage]}</span><span className="rounded-full bg-black/5 px-3 py-2">{active.progress}%</span><span className="rounded-full bg-black/5 px-3 py-2">{c.public}</span></div><ul className="grid gap-3 sm:grid-cols-2">{active.features.map((feature, index) => <li key={index} className="flex gap-2 text-sm"><Check className="size-4 shrink-0"/>{feature}</li>)}</ul>{active.images.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{active.images.map((src, index) => <WorkImage key={src + index} src={src} name={`${active.name} · ${index + 1}`}/>)}</div>}{active.url.startsWith("https://") && <Button asChild variant="neon"><a href={active.url} target="_blank" rel="noopener noreferrer">{c.visit}<ArrowUpRight className="size-4"/></a></Button>}</>}</DialogContent></Dialog></section>;
}
