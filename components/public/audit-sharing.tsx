"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Share2, Link2, Download, FileText, LoaderCircle, X } from "lucide-react";
import { useI18n } from "@/components/providers";
import { platformCopy } from "@/lib/i18n/platform-tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function AuditSharing({id,initialExpires}:{id:string;initialExpires:string|null}){
  const {locale}=useI18n();const all=platformCopy(locale);const c=all.sharing;const router=useRouter();
  const [consent,setConsent]=useState(false);const [url,setUrl]=useState("");const [expires,setExpires]=useState(initialExpires);
  const [busy,setBusy]=useState(false);const [pdfBusy,setPdfBusy]=useState(false);const [file,setFile]=useState<File|null>(null);const [message,setMessage]=useState("");
  const pdfUrl=`/api/audits/${id}/pdf?locale=${locale}`;
  const active=Boolean(expires && new Date(expires)>new Date());
  async function mutate(method:"POST"|"DELETE"){
    if(busy)return;setBusy(true);setMessage("");
    try{const response=await fetch(`/api/audits/${id}/share`,{method,headers:{"Content-Type":"application/json"},...(method==="POST"?{body:JSON.stringify({locale,consent})}:{})});const result=await response.json();if(!response.ok)throw new Error();
      if(method==="POST"){setUrl(new URL(result.path,location.origin).href);setExpires(result.expiresAt);}else{setUrl("");setExpires(null);setMessage(c.revoked);}router.refresh();
    }catch{setMessage(all.errors.UNAVAILABLE);}finally{setBusy(false);}
  }
  async function copy(){try{await navigator.clipboard.writeText(url);setMessage(c.copied);}catch{setMessage(url);}}
  async function share(){try{if(navigator.share)await navigator.share({title:`Blue Sass - ${all.report}`,url});else await copy();}catch(error){setMessage(error instanceof DOMException&&error.name==="AbortError"?c.cancelled:all.errors.UNAVAILABLE);}}
  async function preparePdf(download=false){if(pdfBusy)return;setPdfBusy(true);setMessage("");try{let ready=file;if(!ready){const response=await fetch(pdfUrl);if(!response.ok || !response.headers.get("content-type")?.includes("application/pdf"))throw new Error();ready=new File([await response.blob()],`Blue-Sass-report-${id.slice(0,8)}.pdf`,{type:"application/pdf"});setFile(ready);}setMessage(c.pdfReady);if(download){const href=URL.createObjectURL(ready);const link=document.createElement("a");link.href=href;link.download=ready.name;link.click();setTimeout(()=>URL.revokeObjectURL(href),1000);}}catch{setMessage(all.errors.UNAVAILABLE);}finally{setPdfBusy(false);}}
  async function sendPdf(){if(!file)return;try{if(navigator.canShare?.({files:[file]})&&navigator.share)await navigator.share({title:`Blue Sass - ${all.report}`,files:[file]});else setMessage(c.pdfFallback);}catch(error){setMessage(error instanceof DOMException&&error.name==="AbortError"?c.cancelled:all.errors.UNAVAILABLE);}}
  return <section className="tool-card rounded-2xl border p-5 sm:p-6" data-no-print><h2 className="text-xl font-semibold">{c.title}</h2><p className="mt-3 text-sm leading-7 text-white/75">{c.private}</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><Button type="button" variant="outline" disabled={pdfBusy} onClick={()=>preparePdf(true)}>{pdfBusy?<LoaderCircle className="size-4 animate-spin"/>:<Download className="size-4"/>}{pdfBusy?c.preparingPdf:c.downloadPdf}</Button><Button type="button" variant="outline" onClick={file?sendPdf:()=>preparePdf()} disabled={pdfBusy}>{pdfBusy?<LoaderCircle className="size-4 animate-spin"/>:<FileText className="size-4"/>}{pdfBusy?c.preparingPdf:file?c.sendReady:c.sendPdf}</Button></div>
    <div className="mt-6 border-t border-white/15 pt-5"><Label htmlFor={`share-consent-${id}`} className="items-start leading-7"><Checkbox id={`share-consent-${id}`} checked={consent} onCheckedChange={v=>setConsent(v===true)} disabled={busy} className="mt-1"/>{c.consent}</Label>
      {active && <p className="mt-4 text-sm leading-7">{c.active}<br/>{c.expires}: {new Date(expires!).toLocaleString(locale)}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><Button type="button" variant="neon" disabled={!consent||busy} onClick={()=>mutate("POST")}><Link2 className="size-4"/>{c.create}</Button>{active&&<Button type="button" variant="outline" disabled={busy} onClick={()=>mutate("DELETE")}><X className="size-4"/>{c.revoke}</Button>}</div>
      {url && <div className="mt-5 space-y-3"><Input aria-label={c.copy} value={url} readOnly dir="ltr" onFocus={event=>event.currentTarget.select()}/><div className="grid gap-3 sm:grid-cols-2"><Button type="button" variant="outline" onClick={copy}><Copy className="size-4"/>{c.copy}</Button><Button type="button" variant="outline" onClick={share}><Share2 className="size-4"/>{c.share}</Button></div></div>}
    </div>{message&&<p role="status" className="mt-5 break-all text-sm leading-7">{message}</p>}
  </section>;
}
