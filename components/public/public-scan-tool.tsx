"use client";
import {useState} from "react";
import Link from "next/link";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {AuditReportView} from "./audit-report";
import {platformCopy} from "@/lib/i18n/platform-tools";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {toolObservations} from "@/lib/i18n/tool-observations";
import type {AuditReport} from "@/lib/audits/types";
import type {Locale} from "@/lib/i18n/config";
import type {ToolId} from "@/lib/tools/catalog";
type ScanResult={report:AuditReport;speed:{score:number|null;metrics:{id:string;value:number;unit:string}[];source:string}|null};
export function PublicScanTool({locale,tool}:{locale:Locale;tool:ToolId}){
 const c=platformCopy(locale);const t=toolsUi(locale);const [busy,setBusy]=useState(false);const [result,setResult]=useState<ScanResult|null>(null);const [error,setError]=useState(false);
 const filter=tool==="seo-checker"?"seo":tool==="security-checker"?"security":tool==="speed-test"?"performance":null;
 const checks=result?.report.checks.filter(row=>!filter||row.category===filter)??[];const graded=checks.filter(row=>row.status!=="not_tested"&&!['html_fetch_ms','html_bytes','http_status'].includes(row.code));
 const score=graded.length?Math.round(graded.filter(row=>row.status==="pass").length/graded.length*100):null;
 return <div className="space-y-7"><p className="text-sm leading-7 text-white/75">{c.limits}</p><form className="grid gap-4 rounded-2xl border border-white/15 p-5" onSubmit={async event=>{event.preventDefault();if(busy)return;const url=new FormData(event.currentTarget).get("url");setBusy(true);setError(false);setResult(null);try{const response=await fetch("/api/tools/scan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,tool})});if(!response.ok)throw Error();setResult(await response.json());}catch{setError(true);}finally{setBusy(false);}}}><Label htmlFor="public-scan-url">{c.url}</Label><Input id="public-scan-url" name="url" type="url" required maxLength={500} placeholder="https://example.com" disabled={busy} dir="ltr"/><Button type="submit" variant="neon" disabled={busy}>{busy?t.processing:c.run}</Button>{busy&&<p role="status">{c.waitingAnalysis}</p>}{error&&<p role="alert">{t.error}</p>}</form>
 {result&&<><div className="grid gap-4 sm:grid-cols-3"><div className="tool-card rounded-xl border p-5"><p>{t.report}</p><p className="mt-3 text-3xl font-semibold">{score===null?"—":`${score}/100`}</p><p className="mt-2 text-xs">{c.auditDetails.conclusion}</p></div><div className="tool-card rounded-xl border p-5"><p>{c.categories.performance}</p><p className="mt-3 text-2xl">{result.report.checks.find(row=>row.code==="html_fetch_ms")?.metric} ms</p><p className="mt-2 text-xs">{c.auditDetails.methods.html_fetch_ms}</p></div><div className="tool-card rounded-xl border p-5"><p>HTML</p><p className="mt-3 text-2xl">{(result.report.bytes/1000).toFixed(1)} KB</p></div></div>
 {tool==="speed-test"&&<div className="tool-card rounded-xl border p-5"><h2 className="text-xl">Google Lighthouse</h2>{result.speed?<><p className="my-4 text-3xl">{result.speed.score??"—"}/100</p><ul className="space-y-2">{result.speed.metrics.map(metric=><li key={metric.id} className="flex flex-wrap justify-between gap-3 border-b border-white/10 py-2"><span>{metric.id}</span><span dir="ltr">{metric.value.toFixed(2)} {metric.unit}</span></li>)}</ul></>:<p className="mt-4">{t.unavailable}</p>}</div>}
 {["privacy-scanner","seo-checker"].includes(tool)&&result.report.observations&&<dl className="grid gap-3 sm:grid-cols-2">{Object.entries(result.report.observations).filter(([key])=>(tool==="privacy-scanner"?["analyticsScripts","marketingScripts","responseCookies","consentMarkup"]:["robots","openGraph","structuredData"]).includes(key)).map(([key,value])=><div className="tool-card rounded-xl border p-4" key={key}><dt>{toolObservations(locale).labels[key as keyof ReturnType<typeof toolObservations>["labels"]]}</dt><dd className="mt-2 text-xl">{typeof value==="boolean"?value?"✓":"—":value}</dd></div>)}</dl>}
 {tool==="privacy-scanner"&&<p className="rounded-xl border border-white/15 p-5 text-sm leading-7">{toolObservations(locale).privacyNote}</p>}<AuditReportView id="public-preview" report={{...result.report,checks:filter?checks:result.report.checks}} canExport={false} previous={null} compareLinks={[]} shared/>
 <div className="grid gap-3 sm:grid-cols-2"><Button asChild variant="neon"><Link href={`/${locale}/audit`}>{t.saved}</Link></Button><Button asChild variant="outline"><Link href={`/${locale}/quote`}>{c.requestImprovement}</Link></Button></div></>}
 </div>;
}
