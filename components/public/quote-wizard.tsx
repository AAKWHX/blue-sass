"use client";

import { useActionState, useMemo, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Clock, Loader2, Wallet } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";
import { estimate, formatEUR, type FeatureKey, type ProjectType, type Speed } from "@/lib/pricing";
import { submitLeadAction, type LeadState } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const projectTypes: ProjectType[] = ["web", "mobile", "ai", "ecommerce", "erp", "brand"];
const featureKeys: FeatureKey[] = ["auth", "payments", "dashboard", "i18n", "cms", "api", "ai", "realtime"];
const speeds: Speed[] = ["relaxed", "standard", "rush"];

export function QuoteWizard() {
  const { locale, t } = useI18n();
  const [type, setType] = useState<ProjectType>("web");
  const [features, setFeatures] = useState<FeatureKey[]>(["auth", "i18n"]);
  const [speed, setSpeed] = useState<Speed>("standard");
  const [form, setForm] = useState({ name: "", email: "", company: "", notes: "" });
  const [state, formAction, pending] = useActionState<LeadState, FormData>(submitLeadAction, {
    ok: false,
    message: "",
  });

  const result = useMemo(() => estimate(type, features, speed), [type, features, speed]);

  function toggleFeature(key: FeatureKey) {
    setFeatures((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
  }

  return (
    <section className="relative overflow-hidden section-y">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-backdrop h-80 cyber-grid opacity-40 [mask-image:linear-gradient(black,transparent)]" />
      <div className="container-x relative z-content">
        <SectionHeading eyebrow={t.nav.quote} title={t.quote.title} subtitle={t.quote.subtitle} />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.quote.fields.type}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {projectTypes.map((key) => (
                  <Button variant="unstyled" size="auto"
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
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

            <div className="glass-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.quote.fields.features}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {featureKeys.map((key) => {
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

            <div className="glass-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.quote.fields.timeline}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {speeds.map((key) => (
                  <Button variant="unstyled" size="auto"
                    key={key}
                    type="button"
                    onClick={() => setSpeed(key)}
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
            <form action={formAction} className="glass-card space-y-4 p-6">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="projectType" value={type} />
              <input type="hidden" name="services" value={features.join(",")} />
              <input type="hidden" name="budgetEstimate" value={result.low} />
              <input type="hidden" name="timelineWeeks" value={result.weeks} />
              <input type="hidden" name="currency" value="EUR" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="block">
                  <Label className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.name}</Label>
                  <Input
                    required
                    name="name"
                    dir="auto"
                    className="field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="block">
                  <Label className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.email}</Label>
                  <Input
                    required
                    type="email"
                    name="email"
                    dir="ltr"
                    className="field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="block">
                <Label className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.company}</Label>
                <Input
                  name="company"
                  dir="auto"
                  className="field"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div className="block">
                <Label className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.notes}</Label>
                <Textarea
                  rows={4}
                  name="message"
                  dir="auto"
                  className="field resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button type="submit" variant="neon" disabled={pending} className="w-full gap-2">
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {pending ? t.auth.submitting : t.quote.submit}
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
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
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
              </dl>

              <div className="mt-6 space-y-2">
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
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
