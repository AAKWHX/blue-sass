"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/components/providers";
import { studioCopy } from "@/lib/i18n/studio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select,SelectTrigger,SelectValue,SelectContent,SelectItem } from "@/components/ui/select";
import { StudioAtmosphere } from "@/components/ui/studio-atmosphere";
export function StudioInquiry() {
 const {locale,t}=useI18n();const c=studioCopy(locale);
 const [type,setType]=useState("web");const [budget,setBudget]=useState("unspecified");
 const [busy,setBusy]=useState(false);const [status,setStatus]=useState<"idle"|"success"|"error">("idle");const [fields,setFields]=useState<string[]>([]);
 return <section id="inquiry" className="studio-section"><StudioAtmosphere variant="contact"/><div className="container-x grid items-start gap-10 lg:grid-cols-[.9fr_1.1fr]">
  <div><h2 className="studio-heading">{c.inquiry}</h2><p className="studio-deck mt-6">{t.quote.disclaimer}</p><a href="mailto:help@bluesass.nl" className="mt-8 inline-block text-lg text-white underline underline-offset-8" dir="ltr">help@bluesass.nl</a><p className="mt-5"><a href="tel:+31634543374" dir="ltr" className="text-white/75">+31 6 3454 3374</a></p></div>
  <form className="studio-contact-form studio-card space-y-5" aria-busy={busy} onSubmit={async event=>{event.preventDefault();if(busy)return;const form=event.currentTarget;const values=Object.fromEntries(new FormData(form));setBusy(true);setStatus("idle");setFields([]);try{const response=await fetch("/api/inquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...values,locale,projectType:type,budget})});const result=await response.json();if(!response.ok){setFields(result.fields??[]);setStatus("error");}else{setStatus("success");form.reset();setType("web");setBudget("unspecified");}}catch{setStatus("error");}finally{setBusy(false);}}}>
   <div className="grid gap-5 sm:grid-cols-2">{[{name:"name",type:"text",label:t.quote.fields.name,max:120},{name:"email",type:"email",label:t.quote.fields.email,max:254}].map(field=><div key={field.name}><Label htmlFor={`inquiry-${field.name}`}>{field.label}</Label><Input id={`inquiry-${field.name}`} name={field.name} type={field.type} required minLength={field.name==="name"?2:undefined} maxLength={field.max} autoComplete={field.name==="name"?"name":"email"} className="mt-2" aria-invalid={fields.includes(field.name)} disabled={busy}/></div>)}</div>
   <div><Label htmlFor="inquiry-company">{t.quote.fields.company} ({c.optional})</Label><Input id="inquiry-company" name="company" maxLength={160} autoComplete="organization" className="mt-2" disabled={busy}/></div>
   <div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="inquiry-type">{t.quote.fields.type}</Label><Select value={type} onValueChange={setType} disabled={busy} dir={locale==="ar"?"rtl":"ltr"}><SelectTrigger id="inquiry-type" className="mt-2"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(t.quote.types).map(([key,label])=><SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="inquiry-budget">{t.quote.fields.budget} ({c.optional})</Label><Select value={budget} onValueChange={setBudget} disabled={busy} dir={locale==="ar"?"rtl":"ltr"}><SelectTrigger id="inquiry-budget" className="mt-2"><SelectValue/></SelectTrigger><SelectContent>{[["unspecified",c.optional],["under1000","< €1,000"],["1000to5000","€1,000–€5,000"],["5000to15000","€5,000–€15,000"],["over15000","> €15,000"]].map(([key,label])=><SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div></div>
   <div><Label htmlFor="inquiry-message">{t.quote.fields.notes}</Label><Textarea id="inquiry-message" name="message" required minLength={20} maxLength={3000} className="mt-2 min-h-36" aria-invalid={fields.includes("message")} disabled={busy}/></div>
   <div hidden aria-hidden="true"><Label htmlFor="inquiry-website">Website</Label><Input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off"/></div>
   <p className="text-xs leading-6 text-white/70"><Link href={`/${locale}/privacy`}>{c.privacy}</Link></p>
   <Button type="submit" variant="neon" disabled={busy} className="w-full">{busy?t.common.loading:t.common.send}<ArrowUpRight className="size-4 flip-x"/></Button>
   {status==="success"&&<p role="status">{c.success}</p>}{status==="error"&&<p role="alert">{c.error}</p>}
  </form>
 </div></section>;
}
