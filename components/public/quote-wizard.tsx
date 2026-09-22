"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Clock, CreditCard, Globe2, Loader2, Save, Wallet } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";
import { estimate, formatEUR, type FeatureKey, type ProjectType, type Speed } from "@/lib/pricing";
import { submitLeadAction, type LeadState } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand-logo";
import { serviceCatalog } from "@/lib/service-catalog";

const projectTypes: ProjectType[] = ["web", "mobile", "ai", "ecommerce", "erp", "brand"];
const featuresByType: Record<ProjectType, FeatureKey[]> = {
  web: ["auth", "dashboard", "i18n", "cms", "api", "realtime"],
  mobile: ["auth", "payments", "i18n", "api", "realtime"],
  ai: ["auth", "dashboard", "api", "ai", "realtime"],
  ecommerce: ["auth", "payments", "dashboard", "i18n", "cms", "api"],
  erp: ["auth", "dashboard", "i18n", "api", "ai", "realtime"],
  brand: ["i18n", "cms", "api"],
};
const speeds: Speed[] = ["relaxed", "standard", "rush"];
const addOns = ["domain", "email", "hosting", "maintenance", "google", "analytics"] as const;
type AddOn = (typeof addOns)[number];

const addOnPrice: Record<AddOn, { amount: number; period: number }> = {
  domain: { amount: 15, period: 0 }, email: { amount: 6, period: 1 }, hosting: { amount: 19, period: 1 },
  maintenance: { amount: 79, period: 1 }, google: { amount: 49, period: 2 }, analytics: { amount: 39, period: 2 },
};
const billingPeriods = { ar: ["سنويًا", "شهريًا", "مرة واحدة"], en: ["yearly", "monthly", "one time"], nl: ["per jaar", "per maand", "eenmalig"], de: ["jährlich", "monatlich", "einmalig"], tr: ["yıllık", "aylık", "tek sefer"], fr: ["par an", "par mois", "une fois"], es: ["anual", "mensual", "pago único"] };
const performanceCopy = {
  ar: ["الأداء وسرعة التحميل", "تحسين الصور", "التخزين المؤقت", "التحميل التدريجي", "تُراجع متطلبات الأداء مع نطاق المشروع؛ لا تمثل وعدًا بزمن تحميل ثابت."],
  en: ["Performance & loading", "Image optimization", "Caching", "Lazy loading", "Performance requirements are reviewed with scope; no fixed load time is guaranteed."],
  nl: ["Prestaties en laden", "Afbeeldingen optimaliseren", "Caching", "Uitgesteld laden", "Prestatie-eisen worden met de scope besproken; er is geen vaste laadtijdgarantie."],
  de: ["Leistung und Ladezeit", "Bildoptimierung", "Caching", "Verzögertes Laden", "Leistungsziele werden mit dem Umfang geprüft; keine feste Ladezeitgarantie."],
  tr: ["Performans ve yükleme", "Görsel optimizasyonu", "Önbellek", "Ertelenmiş yükleme", "Performans gereksinimleri kapsamla değerlendirilir; sabit yükleme süresi garanti edilmez."],
  fr: ["Performance et chargement", "Optimisation des images", "Mise en cache", "Chargement différé", "Les objectifs sont étudiés avec le périmètre ; aucun temps de chargement fixe n'est garanti."],
  es: ["Rendimiento y carga", "Optimización de imágenes", "Caché", "Carga diferida", "Los objetivos se revisan con el alcance; no se garantiza un tiempo de carga fijo."],
};
const performanceKeys = ["images", "cache", "lazy"] as const;

type QuoteLocale = "ar" | "en" | "nl" | "de" | "tr" | "fr" | "es";
const addOnLabel: Record<AddOn, Record<QuoteLocale, string>> = {
  domain: { ar: "حجز وربط النطاق", en: "Domain registration & setup", nl: "Domeinregistratie en koppeling", de: "Domainregistrierung und Einrichtung", tr: "Alan adı kaydı ve bağlantısı", fr: "Enregistrement et connexion du domaine", es: "Registro y conexión del dominio" },
  email: { ar: "بريد مهني", en: "Professional email", nl: "Professionele e-mail", de: "Professionelle E-Mail", tr: "Profesyonel e-posta", fr: "E-mail professionnel", es: "Correo profesional" },
  hosting: { ar: "استضافة مُدارة", en: "Managed hosting", nl: "Beheerde hosting", de: "Managed Hosting", tr: "Yönetilen hosting", fr: "Hébergement géré", es: "Alojamiento administrado" },
  maintenance: { ar: "صيانة ودعم", en: "Maintenance & support", nl: "Onderhoud en support", de: "Wartung und Support", tr: "Bakım ve destek", fr: "Maintenance et assistance", es: "Mantenimiento y soporte" },
  google: { ar: "تسجيل الدخول بواسطة Google", en: "Google sign-in", nl: "Inloggen met Google", de: "Google-Anmeldung", tr: "Google ile giriş", fr: "Connexion avec Google", es: "Inicio de sesión con Google" },
  analytics: { ar: "التحليلات وقياس الأداء", en: "Analytics & performance", nl: "Analyse en prestaties", de: "Analyse und Leistung", tr: "Analiz ve performans", fr: "Analytique et performance", es: "Analítica y rendimiento" },
};

const uiCopy: Record<QuoteLocale, { extras: string; extrasHint: string; project: string; projectExample: string; domain: string; save: string; deposit: string; estimate: string; paymentOff: string }> = {
  ar: { extras: "الخدمات الإضافية والاشتراكات", extrasHint: "يمكن اختيار أكثر من خدمة، والأسعار واضحة قبل إرسال الطلب.", project: "اسم المشروع", projectExample: "مثال: متجر نور", domain: "النطاق المطلوب", save: "حفظ الطلب ومراجعته", deposit: "عربون الحجز", estimate: "التقدير", paymentOff: "الدفع سيُفعّل بعد إضافة مفاتيح المزود. يمكنك حفظ طلبك الآن دون دفع." },
  en: { extras: "Add-ons & subscriptions", extrasHint: "Choose any combination. Pricing is shown before you submit.", project: "Project name", projectExample: "e.g. North Store", domain: "Preferred domain", save: "Save order for review", deposit: "Reservation deposit", estimate: "Estimate", paymentOff: "Payment activates when provider keys are added. You can save your order now without paying." },
  nl: { extras: "Extra's en abonnementen", extrasHint: "Kies elke gewenste combinatie. Prijzen staan vooraf vermeld.", project: "Projectnaam", projectExample: "bijv. North Store", domain: "Gewenst domein", save: "Aanvraag opslaan", deposit: "Reserveringsbedrag", estimate: "Schatting", paymentOff: "Betalen wordt actief zodra de providersleutels zijn toegevoegd. U kunt nu zonder betaling opslaan." },
  de: { extras: "Extras und Abonnements", extrasHint: "Wählen Sie mehrere Leistungen. Die Preise sind vorab sichtbar.", project: "Projektname", projectExample: "z. B. North Store", domain: "Gewünschte Domain", save: "Anfrage speichern", deposit: "Reservierungsanzahlung", estimate: "Schätzung", paymentOff: "Die Zahlung wird nach Hinterlegung der Anbieterschlüssel aktiviert. Sie können jetzt ohne Zahlung speichern." },
  tr: { extras: "Ek hizmetler ve abonelikler", extrasHint: "Birden fazla hizmet seçebilirsiniz. Fiyatlar gönderimden önce görünür.", project: "Proje adı", projectExample: "örn. North Store", domain: "İstenen alan adı", save: "Talebi kaydet", deposit: "Rezervasyon ön ödemesi", estimate: "Tahmin", paymentOff: "Sağlayıcı anahtarları eklendiğinde ödeme etkinleşir. Talebinizi şimdi ödeme yapmadan kaydedebilirsiniz." },
  fr: { extras: "Options et abonnements", extrasHint: "Choisissez plusieurs services. Les prix sont affichés avant l'envoi.", project: "Nom du projet", projectExample: "ex. North Store", domain: "Domaine souhaité", save: "Enregistrer la demande", deposit: "Acompte de réservation", estimate: "Estimation", paymentOff: "Le paiement sera activé après l'ajout des clés des prestataires. Vous pouvez enregistrer sans payer." },
  es: { extras: "Extras y suscripciones", extrasHint: "Elija varios servicios. Los precios se muestran antes de enviar.", project: "Nombre del proyecto", projectExample: "p. ej., North Store", domain: "Dominio deseado", save: "Guardar solicitud", deposit: "Depósito de reserva", estimate: "Estimación", paymentOff: "El pago se activará al añadir las claves de los proveedores. Puede guardar ahora sin pagar." },
};

export function QuoteWizard({ initialType, initialService, initialEmail = "" }: { initialType?: string; initialService?: string; initialEmail?: string; payments: { stripe: boolean; mollie: boolean } }) {
  const { locale, t } = useI18n();
  const [type, setType] = useState<ProjectType>(projectTypes.includes(initialType as ProjectType) ? initialType as ProjectType : "web");
  const [features, setFeatures] = useState<FeatureKey[]>(() => (["auth", "i18n"] as FeatureKey[]).filter(key => featuresByType[type].includes(key)));
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [speed, setSpeed] = useState<Speed>("standard");
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [domain, setDomain] = useState("");
  const [performance, setPerformance] = useState<string[]>([]);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const detailsForm = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({ name: "", email: initialEmail, company: "", notes: serviceCatalog(locale).find(item => item.slug === initialService)?.title ?? "" });
  const [state, formAction, pending] = useActionState<LeadState, FormData>(submitLeadAction, {
    ok: false,
    message: "",
  });

  const result = useMemo(() => estimate(type, features, speed), [type, features, speed]);
  const availableFeatures = featuresByType[type];

  function toggleFeature(key: FeatureKey) {
    setFeatures((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
  }
  function chooseType(next: ProjectType) {
    setType(next);
    setFeatures((previous) => previous.filter((feature) => featuresByType[next].includes(feature)));
  }
  function toggleAddOn(key: AddOn) {
    setSelectedAddOns((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]);
  }

  const copy = uiCopy[locale as QuoteLocale] ?? uiCopy.en;
  const controls = {
    ar: ["التالي", "فحص المشروع", "تعديل", "الدفع غير متاح حاليًا؛ يمكنك حفظ المشروع دون دفع."],
    en: ["Next", "Review project", "Edit", "Payment is currently unavailable. You can save without paying."],
    nl: ["Volgende", "Project controleren", "Bewerken", "Betalen is momenteel niet beschikbaar. Opslaan kan zonder betaling."],
    de: ["Weiter", "Projekt prüfen", "Bearbeiten", "Zahlungen sind derzeit nicht verfügbar. Speichern ist ohne Zahlung möglich."],
    tr: ["İleri", "Projeyi incele", "Düzenle", "Ödeme şu anda kullanılamıyor. Ödeme yapmadan kaydedebilirsiniz."],
    fr: ["Suivant", "Vérifier le projet", "Modifier", "Le paiement est indisponible. Vous pouvez enregistrer sans payer."],
    es: ["Siguiente", "Revisar proyecto", "Editar", "El pago no está disponible. Puede guardar sin pagar."],
  }[locale];
  const steps = [t.quote.fields.type, copy.extras, t.quote.fields.features, performanceCopy[locale][0], copy.project, controls[1]];
  const priceLabel = (key: AddOn) => `${formatEUR(addOnPrice[key].amount, locale)} · ${billingPeriods[locale][addOnPrice[key].period]}`;
  function goTo(next: number) {
    if (next === 5 && !detailsForm.current?.reportValidity()) return;
    setStep(next);
    stepHeading.current?.focus({ preventScroll: true });
    stepHeading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }

  return (
    <section className="relative overflow-hidden section-y">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-backdrop h-80 cyber-grid opacity-40 [mask-image:linear-gradient(black,transparent)]" />
      <div className="container-x relative z-content">
        <SectionHeading eyebrow={t.nav.quote} title={t.quote.title} subtitle={t.quote.subtitle} />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><BrandLogo /><p className="text-sm text-ink-low" aria-live="polite">{step + 1} / {steps.length}</p></div>
        <div role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label={steps[step]} className="mt-4 flex gap-1">{steps.map((label, i) => <span key={label} className={clsx("h-1.5 flex-1 rounded-full", i <= step ? "bg-white" : "bg-white/15")} />)}</div>
        <h2 ref={stepHeading} tabIndex={-1} className="mt-6 scroll-mt-24 text-2xl font-bold outline-none">{steps[step]}</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div hidden={step !== 0} className="glass-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.quote.fields.type}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {projectTypes.map((key) => (
                  <Button variant="unstyled" size="auto"
                    key={key}
                    type="button"
                    onClick={() => chooseType(key)}
                    aria-pressed={type === key}
                    className={clsx(
                      "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                      type === key
                        ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-glow-cyan"
                        : "border-line-strong text-ink-low hover:border-neon-cyan/50",
                    )}
                  >
                    {t.quote.types[key]}
                  </Button>
                ))}
              </div>
            </div>

            <div hidden={step !== 1} className="glass-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{copy.extras}</h3>
              <p className="mt-2 text-sm text-ink-low">{copy.extrasHint}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {addOns.map((key) => {
                  const on = selectedAddOns.includes(key);
                  return <Button key={key} type="button" variant="unstyled" size="auto" onClick={() => toggleAddOn(key)} aria-pressed={on}
                    className={clsx("flex items-start justify-between gap-3 rounded-xl border p-4 text-start transition", on ? "border-neon-cyan/50 bg-neon-cyan/10" : "border-line-strong hover:border-neon-cyan/50")}>
                    <span><span className="block text-sm font-semibold">{addOnLabel[key][locale as QuoteLocale] ?? addOnLabel[key].en}</span><span className="mt-1 block text-xs text-ink-low">{priceLabel(key)}</span></span>
                    <CheckCircle2 className={clsx("mt-0.5 size-4 shrink-0", on ? "text-neon-cyan" : "text-ink-mid")} />
                  </Button>;
                })}
              </div>
            </div>

            <div hidden={step !== 2} className="glass-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.quote.fields.features}</h3>
              <p className="mt-2 text-sm text-ink-low">{locale === "ar" ? "اختر الآن الميزات المناسبة لهذا النوع من المشاريع." : "Now choose the features that fit this project type."}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {availableFeatures.map((key) => {
                  const on = features.includes(key);
                  return (
                    <Button variant="unstyled" size="auto"
                      key={key}
                      type="button"
                      onClick={() => toggleFeature(key)}
                      aria-pressed={on}
                      className={clsx(
                        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start text-sm transition",
                        on
                          ? "border-neon-cyan/50 bg-neon-cyan/10"
                          : "border-line-strong hover:border-neon-cyan/50",
                      )}
                    >
                      <span className="font-medium">{t.quote.features[key]}</span>
                      <CheckCircle2
                        className={clsx("h-4 w-4 shrink-0", on ? "text-neon-cyan" : "text-ink-mid")}
                      />
                    </Button>
                  );
                })}
              </div>
            </div>

            <div hidden={step !== 3} className="glass-card p-6">
              <h3 className="font-semibold">{performanceCopy[locale][0]}</h3>
              <div className="my-5 grid gap-3 sm:grid-cols-3">{performanceKeys.map((key, i) => <Button key={key} type="button" variant="outline" aria-pressed={performance.includes(key)} className={clsx("h-auto min-h-12 whitespace-normal", performance.includes(key) && "border-white bg-white/10")} onClick={() => setPerformance(previous => previous.includes(key) ? previous.filter(item => item !== key) : [...previous, key])}>{performanceCopy[locale][i+1]}</Button>)}</div>
              <p className="mb-8 text-sm leading-relaxed text-ink-low">{performanceCopy[locale][4]}</p>
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.quote.fields.timeline}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {speeds.map((key) => (
                  <Button variant="unstyled" size="auto"
                    key={key}
                    type="button"
                    onClick={() => setSpeed(key)}
                    aria-pressed={speed === key}
                    className={clsx(
                      "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                      speed === key
                        ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-glow-cyan"
                        : "border-line-strong text-ink-low hover:border-neon-cyan/50",
                    )}
                  >
                    {t.quote.speeds[key]}
                  </Button>
                ))}
              </div>
            </div>

            {/* The calculator's output travels with the contact details so the
                sales team sees the exact scope the visitor configured. */}
            <form ref={detailsForm} action={formAction} hidden={step < 4} onSubmit={(event) => { if (step !== 5) { event.preventDefault(); goTo(5); } }} className="glass-card space-y-4 p-6">
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="projectType" value={type} />
              <input type="hidden" name="services" value={features.join(",")} />
              <input type="hidden" name="budgetEstimate" value={result.low} />
              <input type="hidden" name="timelineWeeks" value={result.weeks} />
              <input type="hidden" name="currency" value="EUR" />
              <input type="hidden" name="speed" value={speed} />
              <input type="hidden" name="performance" value={performance.join(",")} />
              <input type="hidden" name="addOns" value={selectedAddOns.join(",")} />
              <div hidden={step !== 4} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="project-name" className="mb-1.5 block text-xs font-semibold text-ink-low">{copy.project}</Label><Input id="project-name" required value={projectName} onChange={(e) => setProjectName(e.target.value)} name="projectName" dir="auto" className="field" placeholder={copy.projectExample} /></div>
                <div><Label htmlFor="project-domain" className="mb-1.5 block text-xs font-semibold text-ink-low">{copy.domain}</Label><Input id="project-domain" value={domain} onChange={(e) => setDomain(e.target.value)} name="domain" dir="ltr" className="field" placeholder="example.com" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="block">
                  <Label htmlFor="quote-name" className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.name}</Label>
                  <Input
                    id="quote-name"
                    minLength={2}
                    autoComplete="name"
                    required
                    name="name"
                    dir="auto"
                    className="field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="block">
                  <Label htmlFor="quote-email" className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.email}</Label>
                  <Input
                    id="quote-email"
                    required
                    type="email"
                    readOnly
                    name="email"
                    dir="ltr"
                    className="field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="block">
                <Label htmlFor="quote-company" className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.company}</Label>
                <Input
                  id="quote-company"
                  autoComplete="organization"
                  name="company"
                  dir="auto"
                  className="field"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div className="block">
                <Label htmlFor="quote-notes" className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.notes}</Label>
                <Textarea
                  id="quote-notes"
                  maxLength={4000}
                  rows={4}
                  name="message"
                  dir="auto"
                  className="field resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              </div>
              {step === 5 && <div className="space-y-4 break-words"><h3 className="text-xl font-bold">{projectName}</h3><dl className="grid gap-4 sm:grid-cols-2">{[[t.quote.fields.type, t.quote.types[type]], [copy.extras, selectedAddOns.map(key => addOnLabel[key][locale]).join(" · ") || "—"], [t.quote.fields.features, features.map(key => t.quote.features[key]).join(" · ") || "—"], [t.quote.fields.timeline, `${t.quote.speeds[speed]} · ${result.weeks} ${t.quote.weeks}`], [copy.domain, domain || "—"], [t.quote.fields.name, form.name], [t.quote.fields.email, form.email], [t.quote.fields.company, form.company || "—"], [t.quote.fields.notes, form.notes || "—"]].map(([label, value]) => <div key={label}><dt className="text-sm text-ink-low">{label}</dt><dd className="mt-1 whitespace-pre-wrap font-medium" dir="auto">{value}</dd></div>)}</dl><div className="flex flex-wrap gap-2">{steps.slice(0, 5).map((label, i) => <Button key={label} type="button" variant="outline" onClick={() => goTo(i)} disabled={pending}>{controls[2]}: {label}</Button>)}</div></div>}
              <Button type="submit" variant="neon" hidden={step !== 5} disabled={pending || state.ok} className="w-full gap-2">
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {!pending ? <Save className="size-4" /> : null}
                {pending ? t.auth.submitting : copy.save}
              </Button>
              {state.message ? (
                state.ok ? (
                  <Alert variant="success" role="alert">
                    <AlertDescription>{t.quote.success}</AlertDescription>
                  </Alert>
                ) : (
                  <Alert role="alert" className="border-rose-500/40 bg-rose-500/10">
                    <AlertDescription className="text-rose-200">{state.message}</AlertDescription>
                  </Alert>
                )
              ) : null}
            </form>
            <div className="flex items-center justify-between gap-3"><Button type="button" variant="outline" disabled={step === 0 || pending} onClick={() => goTo(step - 1)}>{t.common.back}</Button>{step < 5 && <Button type="button" variant="neon" onClick={() => goTo(step + 1)}>{step === 4 ? controls[1] : controls[0]}</Button>}</div>
          </div>

          <aside className={clsx("lg:sticky lg:top-24 lg:block lg:self-start", step !== 5 && "hidden")}>
            <div className="glow-border neon-border bg-gradient-to-br from-neon-cyan/[0.10] via-transparent to-neon-magenta/[0.10] p-7">
              <span className="mono-label rounded-full border border-neon-cyan/30 bg-neon-cyan/[0.06] px-3 py-1.5">{t.quote.estimate}</span>
              <p className="tabular mt-5 text-4xl font-black text-gradient">
                {formatEUR(result.low, locale)}
              </p>
              <p className="text-sm font-semibold text-ink-low">— {formatEUR(result.high, locale)}</p>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-ink-low">
                    <Clock className="h-4 w-4" /> {t.quote.fields.timeline}
                  </dt>
                  <dd className="tabular font-bold">
                    ~{result.weeks} {t.quote.weeks}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-ink-low">
                    <Wallet className="h-4 w-4" /> {t.quote.fields.features}
                  </dt>
                  <dd className="tabular font-bold">{features.length}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <dt className="flex items-center gap-2 text-ink-low"><CreditCard className="h-4 w-4" />{copy.deposit}</dt>
                  <dd className="tabular text-lg font-black text-neon-cyan">{formatEUR(result.deposit, locale)}</dd>
                </div>
              </dl>

              <div className="mt-6 space-y-2">
                {selectedAddOns.map(key => <div key={key} className="flex flex-wrap justify-between gap-2 text-sm"><span>{addOnLabel[key][locale]}</span><span>{priceLabel(key)}</span></div>)}
                {performance.map(key => <p key={key} className="text-sm text-ink-low">{performanceCopy[locale][performanceKeys.indexOf(key as typeof performanceKeys[number])+1]}</p>)}
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-ink-low">
                    <CheckCircle2 className="h-3.5 w-3.5 text-neon-cyan" />
                    {t.quote.features[f]}
                  </div>
                ))}
              </div>

              <p className="mt-6 border-t border-line pt-4 text-[11px] leading-relaxed text-ink-low">
                {t.quote.disclaimer}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" disabled className="gap-2"><CreditCard className="size-4" />Stripe</Button>
                <Button type="button" variant="outline" disabled className="gap-2"><Globe2 className="size-4" />Mollie</Button>
              </div>
              <p className="mt-3 text-center text-xs text-ink-low">{controls[3]}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
