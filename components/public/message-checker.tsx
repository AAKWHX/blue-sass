"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { analyzeMessageText } from "@/lib/tools/message-analysis";
import { messageToolCopy } from "@/lib/i18n/message-tool";
import type { Locale } from "@/lib/i18n/config";

export function MessageChecker({ locale }: { locale: Locale }) {
  const c = messageToolCopy(locale);
  const [text, setText] = useState("");
  const [report, setReport] = useState<ReturnType<typeof analyzeMessageText> | null>(null);
  const [error, setError] = useState(false);
  function clear() { setText(""); setReport(null); setError(false); }

  return <div className="space-y-6">
    <form className="rounded-2xl border border-white/15 bg-white/[0.03] p-5 sm:p-8" onSubmit={event => {
      event.preventDefault(); setError(false);
      try { setReport(analyzeMessageText(text)); } catch { setReport(null); setError(true); }
    }}>
      <Label htmlFor="message-text" className="mb-3 block text-base text-white">{c.input}</Label>
      <Textarea id="message-text" dir="auto" value={text} maxLength={32000} required autoComplete="off" spellCheck={false}
        onChange={event => { setText(event.target.value); setReport(null); setError(false); }}
        aria-describedby="message-privacy message-limit" className="min-h-56 w-full text-base leading-7 text-white" />
      <p id="message-privacy" className="mt-4 text-sm leading-7 text-white/75">{c.privacy}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button type="submit" variant="neon" disabled={!text.trim() || report !== null}>{c.scan}</Button>
        <Button type="button" variant="ghostNeon" onClick={clear} disabled={!text}>{c.clear}</Button>
      </div>
      {error ? <p role="alert" className="mt-4 font-semibold text-white">{c.error}</p> : null}
    </form>
    {report ? <section aria-live="polite" aria-atomic="true" className="rounded-2xl border border-white/20 p-5 sm:p-8">
      <h2 className="text-xl font-semibold leading-8 text-white">{report.findings.length ? c.found : c.none}</h2>
      <ul className="mt-5 space-y-3">{report.findings.map(finding => <li key={finding.code}
        className={`rounded-xl border p-4 ${finding.severity === "high" ? "border-white/60 bg-white/10" : "border-white/15 bg-white/[0.03]"}`}>
        <span className="mb-1 block text-xs font-semibold text-white/70">{finding.severity === "high" ? c.high : c.warning}</span>
        <p className="break-words text-base leading-7 text-white">{c.findings[finding.code]}</p>
      </li>)}</ul>
      <h3 className="mb-3 mt-7 text-base font-semibold text-white">{c.domains}</h3>
      {report.linkOrigins.length ? <ul className="space-y-2">{report.linkOrigins.map(origin => <li key={origin} dir="ltr" className="break-all rounded-lg bg-white/5 p-3 font-mono text-sm text-white/85">{origin}</li>)}</ul> : <p className="text-white/70">{c.noLinks}</p>}
    </section> : null}
    <p id="message-limit" className="rounded-xl border border-white/15 p-5 text-sm leading-7 text-white/75">{c.limits}</p>
  </div>;
}
