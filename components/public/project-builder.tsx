"use client";
import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { Globe, Smartphone, BrainCircuit, ShoppingBag, Building2, PenTool, LayoutTemplate, Newspaper, CalendarDays, BookOpen, Users, Monitor, Search, Database, Workflow, Palette, Check, ChevronRight, ChevronLeft, LockKeyhole, Languages, Settings2, Gauge, Save, CreditCard, Loader2, Tablet, AppWindow, Package, BadgeCheck, ChartNoAxesCombined, Contact, PanelsTopLeft, FileImage, type LucideIcon } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveConfiguredProject, type ConfigurationState } from "@/app/actions/configured-projects";
import { builderCopy } from "@/lib/i18n/project-builder";
import { localeMeta } from "@/lib/i18n/config";
import { configuredEstimate, extraOptions, featureOptions, moduleOptions, performanceOptions, providerOptions, projectOptions, initialConfiguration, languageNames, projectLanguages, type ProjectConfiguration, type PricedOption } from "@/lib/project-options";
import { featureCost, formatEUR, type ProjectType } from "@/lib/pricing";
import { ProjectRequestSummary } from "./project-request-summary";

const groups: ProjectType[] = ["web", "mobile", "ai", "ecommerce", "erp", "brand"];
const groupIcons: Record<ProjectType, LucideIcon> = { web: Globe, mobile: Smartphone, ai: BrainCircuit, ecommerce: ShoppingBag, erp: Building2, brand: PenTool };
const kindIcons: LucideIcon[] = [LayoutTemplate, Contact, Building2, ShoppingBag, BookOpen, Newspaper, FileImage, CalendarDays, ShoppingBag, Package, Users, LockKeyhole, BookOpen, Search, Globe, Users, Gauge, Workflow, BadgeCheck, Smartphone, Tablet, AppWindow, PanelsTopLeft, Monitor, AppWindow, Contact, Database, ChartNoAxesCombined, BrainCircuit, Search, Workflow, Palette, PenTool, FileImage];
const featureIcons: Record<string, LucideIcon> = { auth: LockKeyhole, dashboard: Gauge, cms: PenTool, payments: CreditCard, api: Workflow, ai: BrainCircuit, realtime: Workflow, catalog: ShoppingBag, automation: Workflow, identity: Palette, prototype: LayoutTemplate, appstore: Smartphone, offline: Database };

function SelectionCard({ title, description, icon: Icon, selected, disabled, onClick }: { title: string; description?: string; icon: LucideIcon; selected: boolean; disabled?: boolean; onClick: () => void }) {
  return <Button type="button" variant="unstyled" size="auto" onClick={onClick} disabled={disabled} aria-pressed={selected} className={`request-choice ${selected ? "request-choice-selected" : ""}`}>
    <span className="flex w-full items-start justify-between gap-3"><span className="request-choice-icon"><Icon className="size-6"/></span><span className={`flex size-5 items-center justify-center rounded-full border ${selected ? "border-white bg-white text-black" : "border-white/25"}`}>{selected ? <Check className="size-3"/> : null}</span></span>
    <span className="mt-4 block text-base font-semibold leading-7">{title}</span>{description ? <span className="mt-2 block text-sm font-normal leading-6 text-white/65">{description}</span> : null}
  </Button>;
}

export function ProjectBuilder({ initial, email, projectId, paypal = false, initialStep = 0 }: { initial?: ProjectConfiguration; email: string; projectId?: string; paypal?: boolean; initialStep?: number }) {
  const { locale, t } = useI18n();
  const [config, setConfig] = useState<ProjectConfiguration>(() => initial ?? initialConfiguration());
  const [step, setStep] = useState(initialStep >= 0 && initialStep <= 4 ? initialStep : 0);
  const [openProviders, setOpenProviders] = useState(Boolean(initial?.providers.length));
  const [openLanguages, setOpenLanguages] = useState(Boolean(initial && initial.languages.length > 1));
  const [paymentChoice, setPaymentChoice] = useState<"later" | "now">("later");
  const [state, action, pending] = useActionState<ConfigurationState, FormData>(saveConfiguredProject, { ok: false, message: "" });
  const formRef = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const b = (key: keyof typeof builderCopy) => builderCopy[key][locale];
  const quote = configuredEstimate(config);
  const effective = { ...config, deliveryDays: Math.max(config.deliveryDays, quote.minimumDays) };
  const selected = projectOptions.find(p => p.id === config.kind)!;
  const steps = [b("kind"), b("extras"), b("modules"), b("delivery"), b("contact"), b("review")];
  const fieldLabels: Record<string, string> = { projectName: t.experience.name, name: t.quote.fields.name, domain: b("domain"), company: t.quote.fields.company, notes: t.quote.fields.notes, kind: b("kind"), type: b("kind"), extras: b("extras"), providers: b("providers"), languages: b("languages"), features: b("modules"), modules: b("modules"), performance: b("delivery"), deliveryDays: b("days"), speed: b("delivery") };
  const priceFactor = config.priceVersion === 1 ? 2.5 : 1;
  const price = (p: PricedOption) => `${p.price ? formatEUR(p.price * (p.period === "once" ? priceFactor : 1), locale) : b("free")}${p.price ? ` · ${b(p.period === "month" ? "month" : p.period === "year" ? "year" : "oneTime")}` : ""}`;
  function update(patch: Partial<ProjectConfiguration>) { setConfig(previous => ({ ...previous, ...patch })); }
  function chooseKind(id: string) {
    const next = projectOptions.find(p => p.id === id)!;
    const changed = next.type !== config.type;
    update({ type: next.type, kind: id, features: [...new Set([...next.features, ...(!changed ? config.features.filter(f => featureOptions[next.type].includes(f)) : [])])], ...(changed ? { extras: [], providers: [], modules: [], performance: [], languages: [config.languages[0] ?? locale] } : {}), templateId: "", deliveryDays: next.weeks * 7 });
  }
  function toggle(key: "extras" | "modules" | "performance" | "providers", id: string) {
    setConfig(prev => {
      let ids = prev[key].includes(id) ? prev[key].filter(k => k !== id) : [...prev[key], id];
      if (key === "extras") for (const pair of [["hosting", "hosting-business"], ["maintenance", "support-plus"]]) if (pair.includes(id) && ids.includes(id)) ids = ids.filter(k => k === id || !pair.includes(k));
      return { ...prev, [key]: ids, ...(key === "providers" && ids.length ? { features: [...new Set([...prev.features, "auth" as const])] } : {}) };
    });
  }
  function toggleLanguage(code: string) {
    setConfig(prev => {
      const languages = prev.languages.includes(code) ? prev.languages.length > 1 ? prev.languages.filter(l => l !== code) : prev.languages : [...prev.languages, code];
      return { ...prev, languages, features: languages.length > 1 ? [...new Set([...prev.features, "i18n" as const])] : prev.features.filter(f => f !== "i18n" || selected.features.includes(f)) };
    });
  }
  function goTo(next: number) {
    if (step === 4 && next > step && !formRef.current?.reportValidity()) return;
    setStep(next);
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  const optionsGrid = (options: PricedOption[], key: "extras" | "modules" | "performance" | "providers", icon: LucideIcon) => <div className="grid gap-3 sm:grid-cols-2">{options.filter(p => p.types.includes(config.type)).map((p, i) => <SelectionCard key={p.id} title={p.names[locale]} description={price(p)} icon={key === "providers" ? LockKeyhole : [icon, Database, Settings2, Workflow][i % 4]} selected={config[key].includes(p.id)} onClick={() => toggle(key, p.id)}/>)}</div>;
  return <section className="container-x request-builder py-12 sm:py-16">
    <div className="max-w-3xl"><h1 className="text-3xl font-bold leading-tight sm:text-5xl">{projectId ? b("saveEdit") : b("title")}</h1><p className="mt-5 text-base leading-8 text-white/65">{b("intro")}</p></div>
    <div className="mt-9 flex items-center gap-4"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={steps[step]} aria-valuemin={1} aria-valuemax={6} aria-valuenow={step + 1}><div className="h-full rounded-full bg-white" style={{ width: `${(step + 1) / 6 * 100}%` }}/></div><span className="shrink-0 text-sm tabular-nums text-white/65">{step + 1} / 6</span></div>
    <div className={`mt-7 grid items-start gap-7 ${step === 5 ? "" : "lg:grid-cols-[minmax(0,1fr)_300px]"}`}>
      <form ref={formRef} action={action} onSubmit={e => { if (step !== 5) { e.preventDefault(); goTo(step + 1); } }} className="min-w-0">
        <Input type="hidden" name="locale" value={locale}/><Input type="hidden" name="configuration" value={JSON.stringify(effective)}/><Input type="hidden" name="projectId" value={projectId ?? ""}/><Input type="hidden" name="paymentChoice" value={paymentChoice}/>
        <h2 ref={heading} tabIndex={-1} className="mb-6 scroll-mt-28 text-2xl font-bold outline-none">{steps[step]}</h2>
        <fieldset disabled={pending || state.ok} className="min-w-0 space-y-6">
          {step === 0 ? <>
            <div className="flex flex-wrap gap-2">{groups.map(group => { const Icon = groupIcons[group]; return <Button key={group} variant={config.type === group ? "neon" : "outline"} type="button" size="sm" onClick={() => chooseKind(projectOptions.find(p => p.type === group)!.id)}><Icon className="size-4"/>{t.quote.types[group]}</Button>; })}</div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{projectOptions.filter(p => p.type === config.type).map(p => <SelectionCard key={p.id} title={p.names[locale]} description={`${formatEUR(p.price * priceFactor, locale)} · ${t.quote.estimate}`} icon={kindIcons[projectOptions.indexOf(p)] ?? groupIcons[p.type]} selected={config.kind === p.id} onClick={() => chooseKind(p.id)}/>)}</div>
          </> : null}
          {step === 1 ? <>{optionsGrid(extraOptions, "extras", Globe)}{config.type !== "brand" ? <div className="request-panel"><Button type="button" variant="outline" className="w-full justify-between" aria-expanded={openProviders} onClick={() => setOpenProviders(!openProviders)}><span className="flex items-center gap-3"><LockKeyhole className="size-5"/>{b("providers")}</span><span>{config.providers.length}</span></Button><p className="my-4 text-sm leading-7 text-white/65">{b("providerHint")}</p>{openProviders ? optionsGrid(providerOptions, "providers", LockKeyhole) : null}</div> : null}<p className="text-sm leading-7 text-white/60">{b("terms")}</p></> : null}
          {step === 2 ? <>
            <div className="grid gap-3 sm:grid-cols-2">{[...new Set([...featureOptions[config.type], ...selected.features])].filter(f => f !== "i18n").map(f => <SelectionCard key={f} title={t.quote.features[f]} description={selected.features.includes(f) ? b("free") : `${formatEUR(featureCost[f].price * priceFactor, locale)} · ${b("oneTime")}`} icon={featureIcons[f] ?? Settings2} selected={config.features.includes(f)} disabled={selected.features.includes(f) || (f === "auth" && config.providers.length > 0)} onClick={() => update({ features: config.features.includes(f) ? config.features.filter(k => k !== f) : [...config.features, f] })}/>)}</div>
            <div className="request-panel"><Button type="button" variant="outline" className="w-full justify-between" aria-expanded={openLanguages} onClick={() => setOpenLanguages(!openLanguages)}><span className="flex items-center gap-3"><Languages className="size-5"/>{b("languages")}</span><span>{config.languages.length}</span></Button><p className="my-4 text-sm leading-7 text-white/65">{b("languageHint")} {formatEUR(featureCost.i18n.price * priceFactor, locale)}</p>{openLanguages ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{projectLanguages.map(code => <Button type="button" variant={config.languages.includes(code) ? "neon" : "outline"} key={code} aria-pressed={config.languages.includes(code)} onClick={() => toggleLanguage(code)}>{languageNames[code]}</Button>)}</div> : <p>{config.languages.map(l => languageNames[l]).join(" / ")}</p>}</div>
            {optionsGrid(moduleOptions, "modules", Settings2)}
          </> : null}
          {step === 3 ? <>{optionsGrid(performanceOptions, "performance", Gauge)}<div className="request-panel"><div className="grid gap-3 sm:grid-cols-3">{(["relaxed", "standard", "rush"] as const).map(speed => <SelectionCard key={speed} title={t.quote.speeds[speed]} description={speed === "rush" ? "+40%" : b("free")} icon={CalendarDays} selected={config.speed === speed} onClick={() => update({ speed })}/>)}</div><div className="mt-6"><Label htmlFor="delivery-days">{b("days")}</Label><Input id="delivery-days" type="number" min={quote.minimumDays} max={730} value={effective.deliveryDays} onChange={e => update({ deliveryDays: Math.min(730, Math.max(quote.minimumDays, Number(e.target.value))) })} className="mt-3"/><p className="mt-3 text-sm text-white/65">{b("minimum")}: {quote.minimumDays}</p><p className="mt-3 text-sm leading-7 text-white/65">{b("timing")}</p></div></div></> : null}
          {step === 4 ? <div className="request-panel grid gap-5 sm:grid-cols-2">
            <div><Label htmlFor="request-name">{t.experience.name}</Label><Input id="request-name" required minLength={2} maxLength={120} value={config.projectName} onChange={e => update({ projectName: e.target.value })} className="mt-2" dir="auto"/></div>
            <div><Label htmlFor="request-domain">{b("domain")}</Label><Input id="request-domain" value={config.domain} onChange={e => update({ domain: e.target.value })} maxLength={160} pattern={"(?:[a-zA-Z0-9](?:[a-zA-Z0-9\\x2d]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,63}"} placeholder="example.nl" dir="ltr" className="mt-2"/></div>
            <div><Label htmlFor="request-contact">{t.quote.fields.name}</Label><Input id="request-contact" required minLength={2} maxLength={120} value={config.name} onChange={e => update({ name: e.target.value })} autoComplete="name" className="mt-2" dir="auto"/></div>
            <div><Label htmlFor="request-email">{t.quote.fields.email}</Label><Input id="request-email" type="email" readOnly value={email} className="mt-2" dir="ltr"/></div>
            <div className="sm:col-span-2"><Label htmlFor="request-company">{t.quote.fields.company}</Label><Input id="request-company" value={config.company} onChange={e => update({ company: e.target.value })} maxLength={160} autoComplete="organization" className="mt-2" dir="auto"/></div>
            <div className="sm:col-span-2"><Label htmlFor="request-notes">{t.quote.fields.notes}</Label><Textarea id="request-notes" value={config.notes} onChange={e => update({ notes: e.target.value })} maxLength={4000} rows={5} className="mt-2" dir="auto"/></div>
          </div> : null}
          {step === 5 ? <><ProjectRequestSummary configuration={effective} quote={quote} onEdit={goTo} email={email}/>{!projectId ? <section className="request-panel"><h3 className="text-xl font-semibold">{t.experience.payment}</h3><p className="mt-3 text-sm leading-7 text-white/65">{b("paymentNote")}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><SelectionCard title={b("saveLater")} icon={Save} selected={paymentChoice === "later"} onClick={() => setPaymentChoice("later")}/><SelectionCard title="PayPal · Visa · Mastercard" description={b("payNow")} icon={CreditCard} selected={paymentChoice === "now"} disabled={!paypal} onClick={() => setPaymentChoice("now")}/></div></section> : null}<Button type="submit" variant="neon" size="lg" className="w-full" disabled={pending || state.ok}>{pending ? <Loader2 className="size-4 animate-spin"/> : <Save className="size-4"/>}{projectId ? b("saveEdit") : paymentChoice === "now" ? b("payNow") : b("saveLater")}</Button></> : null}
        </fieldset>
        {state.message ? <div role="status" className="request-panel mt-5"><p>{state.message}</p>{state.fields?.length ? <p className="mt-2 text-sm">{state.fields.map(key => fieldLabels[key] ?? b("contact")).join(" / ")}</p> : null}{state.ok && state.projectId ? <div className="mt-4"><Button asChild variant="neon"><Link href={`/${locale}/portal/projects/${state.projectId}${paymentChoice === "now" && !projectId ? "/payment" : ""}`}>{paymentChoice === "now" && !projectId ? b("payNow") : t.experience.details}</Link></Button></div> : null}</div> : null}
        <div className="mt-7 flex justify-between gap-3"><Button type="button" variant="outline" disabled={step === 0 || pending || state.ok} onClick={() => goTo(step - 1)}><ChevronRight className={`size-4 ${localeMeta[locale].dir === "ltr" ? "rotate-180" : ""}`}/>{t.common.back}</Button>{step < 5 ? <Button type="button" variant="neon" disabled={pending || state.ok} onClick={() => goTo(step + 1)}>{step === 4 ? b("review") : b("next")}<ChevronLeft className={`size-4 ${localeMeta[locale].dir === "ltr" ? "rotate-180" : ""}`}/></Button> : null}</div>
      </form>
      {step !== 5 ? <aside className="request-panel lg:sticky lg:top-28"><p className="text-sm text-white/60">{t.quote.estimate}</p><p className="mt-3 text-3xl font-bold tabular-nums">{formatEUR(quote.totalLow, locale)}</p><p className="mt-1 text-sm text-white/65">{formatEUR(quote.totalHigh, locale)}</p><dl className="mt-6 space-y-4 border-t border-white/10 pt-5">{[[b("month"), formatEUR(quote.monthly, locale)], [b("year"), formatEUR(quote.yearly, locale)], [b("days"), `${effective.deliveryDays}`]].map(([label, value]) => <div key={label}><dt className="text-xs text-white/60">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl><p className="mt-5 text-xs leading-6 text-white/60">{b("terms")}</p></aside> : null}
    </div>
  </section>;
}
