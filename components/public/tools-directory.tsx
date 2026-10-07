"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toolsUi } from "@/lib/i18n/tools-ui";
import { toolCatalog, toolCategories } from "@/lib/tools/catalog";
import type { Locale } from "@/lib/i18n/config";
export function ToolsDirectory({locale}:{locale:Locale}) {
 const c=toolsUi(locale);const [query,setQuery]=useState("");const [category,setCategory]=useState("all");
 const items=toolCatalog(locale).filter(item=>(category==="all"||item.category===category)&&item.title.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)));
 return <><Input aria-label={c.search} placeholder={c.search} value={query} onChange={event=>setQuery(event.target.value)} className="mt-8 max-w-xl"/>
 <div className="my-6 flex flex-wrap gap-2">{["all",...toolCategories].map(value=><Button key={value} type="button" variant={category===value?"neon":"outline"} size="sm" aria-pressed={category===value} onClick={()=>setCategory(value)}>{value==="all"?c.all:c.categories[value as keyof typeof c.categories]}</Button>)}</div>
 <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map(item=><Link key={item.id} href={`/${locale}/tools/${item.id}`} className="tool-card rounded-2xl border p-6 transition-colors hover:border-white/60 focus-visible:outline-2 focus-visible:outline-white">
 <span className="text-xs text-white/60">{c.categories[item.category]}</span><h2 className="my-4 text-xl font-semibold leading-8">{item.title}</h2><span className="text-sm text-white/80">{item.ai?c.categories.ai:c.free} · {c.open}</span></Link>)}</div>{!items.length&&<p className="py-10">{c.empty}</p>}</>;
}
