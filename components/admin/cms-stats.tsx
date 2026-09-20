"use client";

import { Plus, RotateCcw, Trash2, TrendingUp } from "lucide-react";
import { useI18n } from "@/components/providers";
import { useContent } from "@/lib/content-store";
import { AnimatedCounter } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * CMS — Stats manager.
 * Every keystroke writes to the shared content store, so the public hero
 * counters update instantly (same tab via context, other tabs via storage event).
 */
export function CmsStats() {
  const { t } = useI18n();
  const { stats, updateStat, addStat, removeStat, reset } = useContent();

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="mono-label">CMS / METRICS</h3>
            <p className="mt-2 text-lg font-bold">{t.admin.tabs.cmsStats}</p>
            <p className="mt-1 text-xs text-ink-low">{t.admin.cms.statsHint}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={reset} variant="ghostNeon" className="!py-2 text-xs">
              <RotateCcw className="h-4 w-4" />
              {t.admin.cms.reset}
            </Button>
            <Button type="button" onClick={addStat} variant="neon" className="!py-2 text-xs">
              <Plus className="h-4 w-4" />
              {t.admin.cms.addStat}
            </Button>
          </div>
        </div>
      </div>

      {/* Live preview strip — identical rendering to the public hero */}
      <div className="glass-card p-6">
        <h4 className="mono-label">{t.admin.cms.livePreview}</h4>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="rounded-2xl border border-line bg-white/[0.03] p-5 text-center">
              <p className="text-3xl font-black">
                <AnimatedCounter
                  value={stat.value}
                  decimals={stat.decimals}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  duration={900}
                  className="text-gradient"
                />
              </p>
              <p className="mono-label mt-2 !text-ink-low">{stat.label}</p>
              {stat.growth !== 0 && (
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-neon-emerald">
                  <TrendingUp className="h-3 w-3" />
                  {stat.growth > 0 ? "+" : ""}
                  {stat.growth}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.id} className="glass-card p-5">
            <div className="grid gap-4 lg:grid-cols-[2fr_repeat(5,1fr)_auto] lg:items-end">
              <Field label={t.admin.cms.label}>
                <Input
                  className="field !py-2 text-sm"
                  value={stat.label}
                  onChange={(e) => updateStat(stat.id, { label: e.target.value })}
                />
              </Field>
              <Field label={t.admin.cms.value}>
                <Input
                  type="number"
                  step="any"
                  className="field tabular !py-2 text-sm"
                  value={stat.value}
                  onChange={(e) => updateStat(stat.id, { value: Number(e.target.value) })}
                />
              </Field>
              <Field label={t.admin.cms.prefix}>
                <Input
                  className="field !py-2 text-sm"
                  value={stat.prefix}
                  onChange={(e) => updateStat(stat.id, { prefix: e.target.value })}
                />
              </Field>
              <Field label={t.admin.cms.suffix}>
                <Input
                  className="field !py-2 text-sm"
                  value={stat.suffix}
                  onChange={(e) => updateStat(stat.id, { suffix: e.target.value })}
                />
              </Field>
              <Field label={t.admin.cms.decimals}>
                <Input
                  type="number"
                  min={0}
                  max={3}
                  className="field tabular !py-2 text-sm"
                  value={stat.decimals}
                  onChange={(e) => updateStat(stat.id, { decimals: Number(e.target.value) })}
                />
              </Field>
              <Field label={t.admin.cms.growth}>
                <Input
                  type="number"
                  step="any"
                  className="field tabular !py-2 text-sm"
                  value={stat.growth}
                  onChange={(e) => updateStat(stat.id, { growth: Number(e.target.value) })}
                />
              </Field>
              <Button variant="unstyled" size="auto"
                type="button"
                onClick={() => removeStat(stat.id)}
                aria-label={t.admin.cms.delete}
                className="grid h-10 w-10 place-items-center rounded-xl border border-rose-500/30 text-rose-300 transition hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <Label className="mono-label mb-1.5 block !text-ink-low">{label}</Label>
      {children}
    </div>
  );
}
