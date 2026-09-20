"use client";

import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/public/hero-visual";

export function Hero() {
  const { locale, t } = useI18n();
  return (
    <section className="relative overflow-hidden border-b border-line bg-base">
      <div className="container-x py-16 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:gap-16">
          <div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">{t.hero.title}</h1>
            <p className="text-base leading-relaxed text-ink-low sm:text-lg">{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild variant="neon"><Link href={`/${locale}/quote`}>{t.hero.ctaPrimary}<ArrowRight className="size-4 flip-x" /></Link></Button>
              <Button asChild variant="ghostNeon"><Link href="#portfolio">{t.hero.ctaSecondary}<ArrowDown className="size-4" /></Link></Button>
            </div>
          </div>
          <div className="relative rounded-[2rem] border border-line bg-elevated/55 p-4 shadow-2xl backdrop-blur">
            <HeroVisual />
          </div>
        </div>
        <ol className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-5 lg:mt-20">
          {t.process.steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line bg-white/[0.025] p-4 text-sm"><span className="me-2 text-neon-cyan">{index + 1}</span><span>{step.title}</span></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
