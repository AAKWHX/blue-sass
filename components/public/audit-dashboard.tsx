"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileSearch, FolderOpen, Link2, LoaderCircle } from "lucide-react";
import { useI18n } from "@/components/providers";
import { platformCopy } from "@/lib/i18n/platform-tools";
import { allowedSourcePath, auditUploadLimits } from "@/lib/audits/analyze";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
type ReportItem = { id: string; source: string; target: string; status: string; createdAt: string };
type Access = { plan: string; reports: number; sites: number; startsAt: string; endsAt: string };
export function AuditDashboard({ signedIn, reports, entitlement, initialSource = "url" }: { signedIn: boolean; reports: ReportItem[]; entitlement: Access; initialSource?: "url" | "files" }) {
  const { locale, t } = useI18n(); const c = platformCopy(locale); const router = useRouter();
  const [source, setSource] = useState(initialSource); const [selected, setSelected] = useState<File[]>([]); const [skipped, setSkipped] = useState(0);
  const [error, setError] = useState(""); const [pending, setPending] = useState(false); const [progress, setProgress] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null); const folderInput = useRef<HTMLInputElement>(null); const request = useRef<XMLHttpRequest | null>(null);
  useEffect(() => () => { const active = request.current; request.current = null; active?.abort(); }, []);
  const bytes = selected.reduce((sum, file) => sum + file.size, 0);
  const used = reports.filter(row => row.status !== "failed" && row.createdAt >= entitlement.startsAt).length;
  function selectFiles(files: FileList | null) {
    const incoming = Array.from(files ?? []); const unique = new Map<string, File>(); let excluded = 0;
    for (const file of incoming) {
      const path = file.webkitRelativePath || file.name;
      if (!allowedSourcePath(path) || file.size > auditUploadLimits.fileBytes || unique.has(path)) { excluded += 1; continue; }
      unique.set(path, file);
    }
    setSelected([...unique.values()]); setSkipped(excluded); setError("");
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!signedIn || pending) return;
    if (source === "files" && (!selected.length || selected.length > auditUploadLimits.files || bytes > auditUploadLimits.bytes)) { setError("UPLOAD_LIMIT"); return; }
    const form = new FormData(event.currentTarget); form.set("source", source);
    if (source === "files") { selected.forEach(file => form.append("files", file)); form.set("paths", JSON.stringify(selected.map(file => file.webkitRelativePath || file.name))); form.set("skipped", String(skipped)); }
    const xhr = new XMLHttpRequest(); request.current = xhr; setPending(true); setProgress(0); setError("");
    xhr.open("POST", "/api/audits"); xhr.timeout = 65_000;
    xhr.upload.onprogress = value => { if (value.lengthComputable) setProgress(Math.round(value.loaded / value.total * 100)); };
    xhr.onload = () => {
      if (request.current !== xhr) return;
      request.current = null; setPending(false);
      try { const result = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300 && typeof result.id === "string" && /^[a-f0-9-]{36}$/.test(result.id)) { router.push(`/${locale}/audit/${result.id}`); router.refresh(); } else setError(typeof result.error === "string" ? result.error : "UNAVAILABLE"); } catch { setError(xhr.status === 413 ? "UPLOAD_LIMIT" : "UNAVAILABLE"); }
    };
    const fail = () => { if (request.current === xhr) { request.current = null; setPending(false); setError("UNAVAILABLE"); } };
    xhr.onerror = fail; xhr.ontimeout = fail; xhr.send(form);
  }
  return <div className="space-y-7">
    <div className="grid gap-4 sm:grid-cols-3">{[{ label: c.currentPlan, value: entitlement.plan === "owner" ? c.owner : entitlement.plan }, { label: c.available, value: `${used} / ${entitlement.reports}` }, { label: c.maxSites, value: String(entitlement.sites) }].map(item => <Card key={item.label} className="tool-card"><CardContent className="pt-6"><p className="text-xs text-white/60">{item.label}</p><p className="mt-3 text-2xl font-semibold">{item.value}</p></CardContent></Card>)}</div>
    <Card className="tool-card"><CardHeader><CardTitle className="text-white">{c.audit}</CardTitle><p className="mt-3 text-sm leading-8 text-white/65">{c.free}</p></CardHeader><CardContent>
      <div role="group" aria-label={c.audit} className="mb-6 grid gap-3 sm:grid-cols-2"><Button type="button" variant={source === "url" ? "neon" : "outline"} onClick={() => setSource("url")} disabled={pending}><Link2 className="size-4"/>{c.sourceUrl}</Button><Button type="button" variant={source === "files" ? "neon" : "outline"} onClick={() => setSource("files")} disabled={pending}><FolderOpen className="size-4"/>{c.sourceFiles}</Button></div>
      <form onSubmit={submit} className="space-y-5"><Input type="hidden" name="source" value={source}/>{source === "url" ? <div><Label htmlFor="audit-url">{c.url}</Label><Input id="audit-url" name="url" type="url" maxLength={500} required placeholder="https://example.com" dir="ltr" className="mt-2" disabled={pending}/></div> : <>
        <div><Label htmlFor="audit-name">{c.name}</Label><Input id="audit-name" name="name" minLength={2} maxLength={80} required className="mt-2" disabled={pending}/></div>
        <Input ref={fileInput} type="file" multiple className="sr-only" aria-label={c.files} onChange={event => selectFiles(event.target.files)}/><Input ref={folderInput} type="file" multiple className="sr-only" aria-label={c.folder} {...{ webkitdirectory: "" }} onChange={event => selectFiles(event.target.files)}/>
        <div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={pending}>{c.files}</Button><Button type="button" variant="outline" onClick={() => folderInput.current?.click()} disabled={pending}>{c.folder}</Button></div><p className="text-sm leading-7 text-white/65">{c.uploadLimits}</p><p className="text-sm">{c.selected}: {selected.length} · {(bytes / 1_000_000).toFixed(2)} MB · {c.ignored}: {skipped}</p>
      </>}
      <Label htmlFor="audit-consent" className="flex cursor-pointer items-start gap-3 text-sm leading-7"><Checkbox id="audit-consent" name="consent" value="yes" required className="mt-1" disabled={pending}/>{c.consent}</Label>
      <p className="text-xs leading-7 text-white/55">{c.privacy}</p>
      {signedIn ? <Button type="submit" variant="neon" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin"/> : <FileSearch className="size-4"/>}{c.run}</Button> : <Button asChild variant="neon"><Link href={`/${locale}/login?next=${encodeURIComponent(`/${locale}/audit`)}`}>{t.auth.signIn}</Link></Button>}
      {pending && <div role="status" className="space-y-3"><p className="text-sm leading-7">{c.pending}</p><p className="text-xs text-white/60">{t.common.upload}: {progress}%</p><div role="progressbar" aria-label={t.common.upload} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-white" style={{ width: `${progress}%` }}/></div></div>}
      {error && <p role="alert" className="rounded-xl border border-white/25 p-4 text-sm leading-7">{c.errors[error as keyof typeof c.errors] ?? c.errors.UNAVAILABLE}</p>}
      {!signedIn && <p className="text-sm text-white/65">{c.unavailable}</p>}
      </form>
    </CardContent></Card>
    <Card className="tool-card"><CardHeader><CardTitle className="text-white">{c.history}</CardTitle></CardHeader><CardContent>{reports.length ? <ul className="space-y-3">{reports.map(row => <li key={row.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 p-4"><div className="min-w-0"><p className="break-all text-sm font-semibold" dir="auto">{row.target}</p><p className="mt-2 text-xs text-white/55">{row.createdAt.slice(0, 10)} · {row.source === "url" ? c.sourceUrl : c.sourceFiles} · {row.status === "completed" ? c.passed : row.status === "pending" ? c.pending : c.warning}</p></div>{row.status === "completed" && <Button asChild variant="outline" size="sm"><Link href={`/${locale}/audit/${row.id}`}>{c.report}</Link></Button>}</li>)}</ul> : <p className="text-sm text-white/60">{c.empty}</p>}<Button asChild variant="outline" className="mt-6"><Link href={`/${locale}/subscriptions`}>{c.plansTitle}</Link></Button></CardContent></Card>
    <p className="max-w-5xl text-xs leading-8 text-white/55">{c.limits}</p>
  </div>;
}
