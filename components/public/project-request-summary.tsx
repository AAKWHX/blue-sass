"use client";
import { Pencil, Check, FileText, Globe, Layers, CalendarClock, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { builderCopy } from "@/lib/i18n/project-builder";
import { extraOptions, providerOptions, moduleOptions, performanceOptions, projectOption, languageNames, type ProjectConfiguration, type PricedOption, configuredEstimate } from "@/lib/project-options";
import { featureCost, formatEUR } from "@/lib/pricing";

export function ProjectRequestSummary({ configuration: c, quote, onEdit, email, editHref }: { configuration: ProjectConfiguration; quote: ReturnType<typeof configuredEstimate>; onEdit?: (step: number) => void; email?: string; editHref?: string }) {
  const { t, locale } = useI18n();
  const b = (key: keyof typeof builderCopy) => builderCopy[key][locale];
  const price = (p: PricedOption) => `${p.price ? formatEUR(p.price, locale) : b("free")}${p.price ? ` · ${b(p.period === "month" ? "month" : p.period === "year" ? "year" : "oneTime")}` : ""}`;
  const choices = (ids: string[], options: PricedOption[]) => options.filter(p => ids.includes(p.id)).map(p => `${p.names[locale]}: ${price(p)}`);
  const sections = [
    { step: 0, icon: FileText, title: b("kind"), rows: [projectOption(c.kind)?.names[locale] ?? c.kind] },
    { step: 1, icon: Globe, title: b("extras"), rows: [...choices(c.extras, extraOptions), ...(c.providers.length ? [b("providers"), ...choices(c.providers, providerOptions)] : [])] },
    { step: 2, icon: Layers, title: b("modules"), rows: [...c.features.filter(f => f !== "i18n").map(f => `${t.quote.features[f]}: ${projectOption(c.kind)?.features.includes(f) ? b("free") : `${formatEUR(featureCost[f].price, locale)} · ${b("oneTime")}`}`), ...choices(c.modules, moduleOptions), `${b("languages")}:`, ...c.languages.map((l, i) => `${languageNames[l] ?? l}: ${i === 0 ? b("free") : `${formatEUR(featureCost.i18n.price, locale)} · ${b("oneTime")}`}`)] },
    { step: 3, icon: CalendarClock, title: b("delivery"), rows: [...choices(c.performance, performanceOptions), `${b("days")}: ${c.deliveryDays}`, t.quote.speeds[c.speed], b("timing")] },
    { step: 4, icon: FileText, title: b("contact"), rows: [`${t.experience.name}: ${c.projectName}`, ...(c.domain ? [`${b("domain")}: ${c.domain}`] : []), `${t.quote.fields.name}: ${c.name}`, ...(email ? [`${t.quote.fields.email}: ${email}`] : []), ...(c.company ? [`${t.quote.fields.company}: ${c.company}`] : []), ...(c.notes ? [`${t.quote.fields.notes}: ${c.notes}`] : [])] },
  ];
  return <div className="space-y-5">
    <div className="grid items-start gap-4 md:grid-cols-2">{sections.map(({ step, icon: Icon, title, rows }) => <section key={step} className={`request-panel ${step === 4 ? "md:col-span-2" : ""}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4"><h3 className="flex items-center gap-3 text-lg font-semibold"><Icon className="size-5 shrink-0"/>{title}</h3>{onEdit ? <Button variant="ghostNeon" size="icon" type="button" aria-label={`${t.experience.edit}: ${title}`} onClick={() => onEdit(step)}><Pencil className="size-4"/></Button> : editHref ? <Button asChild variant="ghostNeon" size="icon"><Link href={`${editHref}?step=${step}`} aria-label={`${t.experience.edit}: ${title}`}><Pencil className="size-4"/></Link></Button> : null}</div>
      <ul className="mt-4 space-y-3">{(rows.length ? rows : [b("none")]).map((row, i) => <li key={`${i}-${row}`} className="flex min-w-0 items-start gap-2 text-sm leading-7"><Check className="mt-1.5 size-3.5 shrink-0 text-white/50"/><span className="min-w-0 whitespace-pre-wrap break-words" dir="auto">{row}</span></li>)}</ul>
    </section>)}</div>
    <section className="request-panel"><h3 className="flex items-center gap-3 text-lg font-semibold"><ReceiptText className="size-5"/>{t.experience.payment}</h3><dl className="mt-5 grid gap-4 sm:grid-cols-2">
      {[[t.pricing.base, formatEUR(quote.baseLow, locale)], [t.pricing.discount, `−${formatEUR(quote.discount, locale)}`], [b("oneTime"), formatEUR(quote.setup, locale)], [t.quote.estimate, `${formatEUR(quote.totalLow, locale)} – ${formatEUR(quote.totalHigh, locale)}`], [b("month"), formatEUR(quote.monthly, locale)], [b("year"), formatEUR(quote.yearly, locale)]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 p-4"><dt className="text-sm text-white/60">{label}</dt><dd className="mt-2 text-lg font-semibold tabular-nums">{value}</dd></div>)}
      <div className="rounded-xl border border-white/20 p-4 sm:col-span-2"><dt className="text-sm text-white/60">{b("deposit")} · PayPal</dt><dd className="mt-2 text-lg font-semibold">{formatEUR(quote.deposit, locale)}</dd><p className="mt-2 text-sm leading-7 text-white/70">{t.experience.paymentNote}</p></div>
    </dl><p className="mt-5 text-sm leading-7 text-white/60">{b("terms")}</p></section>
  </div>;
}
