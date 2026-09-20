"use client";

import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { locale, t } = useI18n();
  return (
    <section className="relative overflow-hidden border-b border-line bg-base">
      <div className="container-x py-20 sm:py-28 lg:py-36">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-6">
          <span className="text-xs font-medium text-ink-low">AAKWHX / AWWA</span>
          <span className="text-xs text-ink-low">{t.footer.offices}</span>
        </div>
        <div className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-end lg:gap-20 lg:pt-20">
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">{t.hero.title}</h1>
          <div className="max-w-lg space-y-8">
            <p className="text-base leading-relaxed text-ink-low sm:text-lg">{t.hero.subtitle}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="neon"><Link href={`/${locale}/quote`}>{t.hero.ctaPrimary}<ArrowRight className="size-4 flip-x" /></Link></Button>
              <Button asChild variant="ghostNeon"><Link href="#portfolio">{t.hero.ctaSecondary}<ArrowDown className="size-4" /></Link></Button>
            </div>
          </div>
        </div>
        <ol className="mt-20 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-5 lg:mt-28">
          {t.process.steps.map((step, index) => (
            <li key={step.title} className="flex items-baseline gap-3 text-sm"><span className="font-mono text-xs text-ink-faint">0{index + 1}</span><span>{step.title}</span></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
