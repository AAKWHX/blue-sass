"use client";
import {useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {businessUi} from "@/lib/i18n/business-ui";
import {toolFormCopy} from "@/lib/i18n/tool-form-copy";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {locales,localeMeta,type Locale} from "@/lib/i18n/config";
export function AiTool({locale,tool,available,signedIn}:{locale:Locale;tool:string;available:boolean;signedIn:boolean}){
 const c=toolsUi(locale);const [busy,setBusy]=useState(false);const [text,setText]=useState("");const [error,setError]=useState(false);const [diagnostic,setDiagnostic]=useState("");const [copied,setCopied]=useState(false);const [language,setLanguage]=useState<Locale>(locale);const [section,setSection]=useState("0");const labels=toolFormCopy(locale);const b=businessUi(locale);
 if(!available)return <p className="rounded-xl border border-white/20 p-6">{c.unavailable}</p>;
 if(!signedIn)return <Button asChild variant="neon"><Link href={`/${locale}/login?next=${encodeURIComponent(`/${locale}/tools/${tool}`)}`}>{c.account}</Link></Button>;
 return <form className="space-y-5" onSubmit={async event=>{event.preventDefault();if(busy)return;const brief=JSON.stringify({...Object.fromEntries(new FormData(event.currentTarget)),contentType:labels.content[Number(section)]});setBusy(true);setError(false);setCopied(false);try{const response=await fetch("/api/tools/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tool,locale:language,brief})});if(!response.ok){const failure=await response.json();setDiagnostic(failure.diagnostic??"");throw Error();}setText((await response.json()).text);}catch{setError(true);}finally{setBusy(false);}}}>
 <div className="grid gap-4 sm:grid-cols-2">{[{name:"business",label:b.company},{name:"industry",label:b.category},{name:"country",label:labels.country},{name:"style",label:labels.style},{name:"keywords",label:labels.keywords},{name:"audience",label:labels.audience}].map(field=><div key={field.name}><Label htmlFor={`ai-${field.name}`}>{field.label}</Label><Input id={`ai-${field.name}`} name={field.name} maxLength={120} required={field.name==="business"||field.name==="industry"}/></div>)}</div><Label htmlFor="ai-language">{c.languages}</Label><Select value={language} onValueChange={value=>setLanguage(value as Locale)}><SelectTrigger id="ai-language"><SelectValue/></SelectTrigger><SelectContent>{locales.map(value=><SelectItem key={value} value={value}>{localeMeta[value].flag} {localeMeta[value].native}</SelectItem>)}</SelectContent></Select>{tool==="ai-content-generator"&&<><Label htmlFor="ai-content-type">{c.categories.website}</Label><Select value={section} onValueChange={setSection}><SelectTrigger id="ai-content-type"><SelectValue/></SelectTrigger><SelectContent>{labels.content.map((value,i)=><SelectItem key={i} value={String(i)}>{value}</SelectItem>)}</SelectContent></Select></>}<Label htmlFor="ai-brief">{c.details}</Label><Textarea id="ai-brief" name="brief" required minLength={10} maxLength={1800} className="min-h-48"/><Button type="submit" variant="neon" disabled={busy}>{busy?c.processing:c.generate}</Button>{error&&<p role="alert">{c.error}{diagnostic?` (${diagnostic})`:""}</p>}{text&&<div className="tool-card rounded-xl border p-6"><p className="whitespace-pre-wrap leading-8">{text}</p><Button type="button" variant="outline" className="mt-5" onClick={async()=>{try{await navigator.clipboard.writeText(text);setCopied(true);}catch{setError(true);}}}>{copied?c.copied:c.copy}</Button></div>}
 </form>;
}
