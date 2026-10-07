"use client";
import {useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {projectOptions,featureOptions,projectOption,moduleOptions} from "@/lib/project-options";
import {useI18n} from "@/components/providers";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {toolObservations} from "@/lib/i18n/tool-observations";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
export function CostTool(){const {locale,t}=useI18n();const c=toolsUi(locale);const [kind,setKind]=useState("company");const [features,setFeatures]=useState<string[]>([]);const [modules,setModules]=useState<string[]>([]);const [languageCount,setLanguageCount]=useState(1);const [busy,setBusy]=useState(false);const [result,setResult]=useState<{low:number;high:number;days:number}|null>(null);const [error,setError]=useState(false);const type=projectOption(kind)!.type;
 const money=(value:number)=>new Intl.NumberFormat(locale,{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(value);
 return <form className="space-y-6" onSubmit={async event=>{event.preventDefault();if(busy)return;const form=new FormData(event.currentTarget);setBusy(true);setError(false);try{const response=await fetch("/api/tools/estimate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,features,modules,languages:Number(form.get("languages")),pages:Number(form.get("pages"))})});if(!response.ok)throw Error();setResult(await response.json());}catch{setError(true);}finally{setBusy(false);}}}>
 <Label>{t.quote.fields.type}</Label><Select value={kind} onValueChange={value=>{setKind(value);setFeatures([]);setModules([]);setResult(null);}}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{projectOptions.map(option=><SelectItem key={option.id} value={option.id}>{option.names[locale]}</SelectItem>)}</SelectContent></Select>
 <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="cost-pages">{c.categories.website}</Label><Input id="cost-pages" name="pages" type="number" min={1} max={100} defaultValue={5} required/></div><div><Label htmlFor="cost-languages">{c.languages}</Label><Input id="cost-languages" name="languages" type="number" min={1} max={15} value={languageCount} onChange={event=>setLanguageCount(Number(event.target.value))} required/></div></div>
 <div className="grid gap-3 sm:grid-cols-2">{featureOptions[type].map(feature=><Label key={feature} htmlFor={`cost-${feature}`} className="flex items-center gap-3 rounded-xl border border-white/15 p-4"><Checkbox id={`cost-${feature}`} checked={features.includes(feature)} onCheckedChange={checked=>setFeatures(checked?[...features,feature]:features.filter(value=>value!==feature))}/>{t.quote.features[feature]}</Label>)}</div>
 <div className="grid gap-3 sm:grid-cols-2">{moduleOptions.filter(option=>option.types.includes(type)).map(option=><Label key={option.id} htmlFor={`cost-module-${option.id}`} className="flex items-center gap-3 rounded-xl border border-white/15 p-4"><Checkbox id={`cost-module-${option.id}`} checked={modules.includes(option.id)} onCheckedChange={checked=>setModules(checked?[...modules,option.id]:modules.filter(value=>value!==option.id))}/>{option.names[locale]}</Label>)}</div><Button type="submit" variant="neon" disabled={busy}>{busy?c.processing:c.generate}</Button>{error&&<p role="alert">{c.error}</p>}
 {result&&<div className="tool-card rounded-2xl border p-6"><p className="text-sm">{t.quote.estimate}</p><p className="my-4 text-sm leading-7">{toolObservations(locale).estimateNote}</p><p className="mt-3 text-3xl font-semibold">{money(result.low)} – {money(result.high)}</p><Button asChild variant="outline" className="mt-5"><Link href={`/${locale}/quote?kind=${kind}&type=${type}&features=${features.join(",")}&modules=${modules.join(",")}&languages=${languageCount}`}>{c.open}</Link></Button></div>}
 </form>;
}
