"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileSearch, CircleCheck, CircleAlert, CircleHelp, Printer, Download } from "lucide-react";
import { useI18n } from "@/components/providers";
import { platformCopy } from "@/lib/i18n/platform-tools";
import type { AuditReport, AuditCategory, AuditCheck } from "@/lib/audits/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuditSharing } from "./audit-sharing";
const categories: AuditCategory[] = ["security", "seo", "accessibility", "performance", "links", "source"];
const urgentCodes = new Set(["secret_indicators", "tls_disabled", "dynamic_execution", "html_injection_review"]);
const metricCodes = new Set(["html_fetch_ms", "html_bytes", "files_read"]);
export function AuditReportView({ id, report, canExport, previous, compareLinks, shared=false, shareExpires=null }: { id: string; report: AuditReport; canExport: boolean; previous: AuditReport | null; compareLinks: { id: string; createdAt: string }[]; shared?:boolean;shareExpires?:string|null }) {
  const { locale, t } = useI18n(); const c = platformCopy(locale); const d = c.auditDetails;
  const [visible, setVisible] = useState(40);
  const totals = { pass: report.checks.filter(r=>r.status==="pass").length, warning: report.checks.filter(r=>r.status==="warning").length, not_tested: report.checks.filter(r=>r.status==="not_tested").length };
  const untested = report.checks.filter(r=>r.status==="not_tested");
  function print() { setVisible(report.checks.length); requestAnimationFrame(()=>requestAnimationFrame(()=>window.print())); }
  function finding(row: AuditCheck, index: number) {
    const urgent = row.status==="warning" && urgentCodes.has(row.code);
    const tone = row.status==="not_tested" ? "excluded" : urgent ? "urgent" : row.status==="warning" ? "warning" : "passed";
    const Icon = row.status==="not_tested" ? CircleHelp : row.status==="warning" ? CircleAlert : CircleCheck;
    const label = row.status==="not_tested" ? d.untested : urgent ? d.high : row.status==="warning" ? row.category==="security" || row.category==="links" ? d.medium : d.low : metricCodes.has(row.code) ? d.metric : d.passed;
    const method = d.methods[row.code as keyof typeof d.methods] ?? c.limits;
    const next = c.recommendations[row.code as keyof typeof c.recommendations];
    return <li key={`${row.code}-${row.file??""}-${index}`} className={`audit-finding audit-${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="flex min-w-0 items-start gap-2 text-base font-semibold leading-7"><Icon className="mt-1 size-5 shrink-0"/>{c.rules[row.code as keyof typeof c.rules]??row.code}</h3><span className="audit-result">{label}</span></div>
      {row.file && <p className="mt-3 break-all font-mono text-xs" dir="ltr">{row.file}</p>}
      <div className="mt-4"><h4 className="text-xs font-semibold">{d.methodology}</h4><p className="mt-2 text-sm leading-7">{method}</p></div>
      {(row.count!==undefined || row.metric!==undefined) && <dl className="audit-evidence mt-4 flex flex-wrap gap-4 rounded-lg p-3 text-sm">
        {row.count!==undefined && <div><dt>{row.code==="files_read"?d.sourceCount:d.count}</dt><dd className="mt-1 text-lg font-bold tabular-nums">{row.count}</dd></div>}
        {row.metric!==undefined && <div><dt>{d.evidence}</dt><dd className="mt-1 text-lg font-bold tabular-nums">{row.metric.toLocaleString(locale)} {row.code==="html_fetch_ms"?d.milliseconds:row.code==="html_bytes"?d.bytes:row.code==="http_status"?"HTTP":""}</dd></div>}
      </dl>}
      {row.status==="warning" && next && <div className="mt-4 border-t border-current/20 pt-3"><h4 className="text-xs font-semibold">{d.next}</h4><p className="mt-2 text-sm leading-7">{next}</p></div>}
    </li>;
  }
  return <div className="audit-document space-y-7">
    {!shared&&<AuditSharing key={`${id}-${locale}`} id={id} initialExpires={shareExpires}/>}
    <div className="grid gap-3 sm:flex sm:flex-wrap" data-no-print><Button type="button" variant="neon" onClick={print}><Printer className="size-4"/>{c.print}</Button>{canExport && !shared && <Button asChild variant="outline"><Link href={`/api/audits/${id}/export`}><Download className="size-4"/>{c.exportJson}</Link></Button>}{!shared&&<Button asChild variant="outline"><Link href={`/${locale}/audit`}>{c.history}</Link></Button>}</div>
    <table className="audit-print-layout w-full"><thead><tr><td><div className="audit-letterhead flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-5"><div className="flex items-center gap-3"><Image src="/icon.svg" alt="Blue Sass" width={44} height={44} unoptimized/><div><strong className="text-xl">Blue Sass</strong><p className="mt-1 text-xs">{d.publisher}</p></div></div><div className="text-xs leading-6" dir="ltr">www.bluesass.nl<br/>help@bluesass.nl</div></div></td></tr></thead><tbody><tr><td className="pt-6">
      <div className="mb-7"><h1 className="text-3xl font-bold sm:text-5xl">{c.report}</h1><p className="mt-4 break-all text-lg" dir="auto">{report.pageUrl??report.target}</p><dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2"><div><dt>{d.generated}</dt><dd className="mt-1" dir="ltr">{report.generatedAt.slice(0,19).replace("T"," ")} UTC</dd></div><div><dt>{d.reportId}</dt><dd className="mt-1 break-all" dir="ltr">{id}</dd></div></dl></div>
      <div className="audit-overview mb-7 grid gap-4 sm:grid-cols-3">{[{label:d.passed,value:totals.pass,tone:"passed"},{label:c.warning,value:totals.warning,tone:"warning"},{label:d.untested,value:totals.not_tested,tone:"excluded"}].map(item=><div key={item.tone} className={`audit-finding audit-${item.tone}`}><p className="text-sm leading-6">{item.label}</p><p className="mt-3 text-3xl font-bold">{item.value}</p></div>)}</div>
      <Card className="tool-card mb-7"><CardHeader><CardTitle>{d.scope}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7">{d.conclusion}</p><dl className="mt-5 grid gap-4 sm:grid-cols-3">{[{label:d.pageCount,value:report.fetchedPages},{label:d.sourceCount,value:report.scannedFiles},{label:c.ignored,value:report.skippedFiles}].map(row=><div key={row.label}><dt className="text-xs">{row.label}</dt><dd className="mt-2 text-xl font-bold">{row.value}</dd></div>)}</dl><p className="mt-4 text-sm">{d.metric}: {(report.bytes/1_000_000).toFixed(2)} MB</p></CardContent></Card>
      {report.source==="url" && <Card className="tool-card mb-7"><CardHeader><CardTitle>{d.pages}</CardTitle></CardHeader><CardContent>{report.pages?.length ? <ul className="space-y-3">{report.pages.map((page,index)=><li key={index} className={`audit-finding ${page.status===null||page.status>=400?"audit-warning":"audit-passed"}`}><p dir="ltr" className="break-all text-sm">{page.url}</p><p className="mt-2 text-sm">{page.method} · {page.status===null?d.unavailable:`HTTP ${page.status}`}</p></li>)}</ul>:<p className="text-sm leading-7">{d.historical}</p>}</CardContent></Card>}
      {compareLinks.length>0 && <Card className="tool-card mb-7" data-no-print><CardHeader><CardTitle>{c.compare}</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{compareLinks.map(row=><Button asChild key={row.id} variant="outline"><Link href={`/${locale}/audit/${id}?compare=${row.id}`}>{row.createdAt.slice(0,10)} · {row.id.slice(0,6)}</Link></Button>)}</CardContent></Card>}
      {previous && <p className="mb-7 text-sm">{c.previous}: {previous.checks.filter(r=>r.status==="warning").length} · {c.warning}: {totals.warning}</p>}
      {totals.warning===0 && <p className="audit-finding audit-passed mb-7 text-sm leading-7">{d.noWarnings}</p>}
      <div className="audit-sections space-y-7">{categories.map(category=>{const checks=report.checks.filter(r=>r.category===category&&r.status!=="not_tested").sort((a,b)=>Number(b.status==="warning")-Number(a.status==="warning"));if(!checks.length)return null;return <section key={category} className="audit-section"><h2 className="mb-4 flex items-center gap-3 text-xl font-bold"><FileSearch className="size-5"/>{c.categories[category]}</h2><ul className="space-y-4">{checks.slice(0,visible).map(finding)}</ul>{checks.length>visible && <Button type="button" variant="outline" className="mt-4" onClick={()=>setVisible(v=>v+40)} data-no-print>{c.more}</Button>}</section>;})}</div>
      {untested.length>0 && <section className="audit-section mt-8"><h2 className="mb-4 text-xl font-bold">{d.excluded}</h2><ul className="space-y-4">{untested.map(finding)}</ul></section>}
      <p className="mt-8 border-t border-white/20 pt-5 text-xs leading-7">{c.privacy}</p>
    </td></tr></tbody><tfoot><tr><td><p className="audit-print-footer pt-5 text-xs">{d.contact}</p></td></tr></tfoot></table>
    <div className="grid gap-3 sm:flex sm:flex-wrap" data-no-print><Button asChild variant="neon"><Link href={`/${locale}/quote`}>{c.requestImprovement}</Link></Button><Button asChild variant="outline"><Link href={`/${locale}/audit`}>{t.common.back}</Link></Button></div>
  </div>;
}
