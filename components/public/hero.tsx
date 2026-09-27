"use client";

import Link from "next/link";
import { ArrowRight, ArrowDown, CircleCheck, Sparkles } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/public/hero-visual";
import { Reveal } from "@/components/ui/motion";

export function Hero() {
  const { locale, t } = useI18n();
  return (
    <section className="hero-section relative isolate overflow-hidden border-b border-line/70">
      <div aria-hidden className="hero-orbit hero-orbit-a" />
      <div aria-hidden className="hero-orbit hero-orbit-b" />
      <div aria-hidden className="hero-horizon" />

      <div className="container-x relative z-content grid min-h-[calc(100svh-5rem)] items-center gap-12 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.8fr)] lg:py-20">
        <Reveal className="max-w-3xl">
          <span className="hero-badge">
            <Sparkles className="size-3.5" />
            {t.hero.badge}
          </span>
          <h1 className="mt-7 max-w-full text-[2rem] font-bold leading-[1.08] tracking-[-0.04em] sm:text-[clamp(2.7rem,6vw,5.8rem)] sm:leading-[1.04] sm:tracking-[-0.055em]">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-ink-low sm:text-lg sm:leading-9">
            {t.hero.subtitle}
          </p>

          <div className="mt-8 grid w-full grid-cols-2 items-center gap-3 sm:flex sm:flex-wrap">
            <Button asChild variant="neon" size="lg" className="group">
              <Link href={`/${locale}/create-project`}>
                {t.hero.ctaPrimary}
                <ArrowRight className="size-4 flip-x transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="ghostNeon" size="lg">
              <Link href="#services">{t.nav.services}<ArrowDown className="size-4" /></Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-low sm:text-sm">
            {[t.process.steps[0].title, t.process.steps[1].title, t.process.steps[4].title].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CircleCheck className="size-4 text-neon-emerald" />{item}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12} className="relative">
          <HeroVisual />
        </Reveal>

        <div className="hero-stats lg:col-span-2">
          {t.hero.stats.map((stat, index) => (
            <div key={stat.label} className="hero-stat">
              <strong dir="auto">{stat.value}</strong>
              <span>{stat.label}</span>
              <i aria-hidden style={{ animationDelay: `${index * 0.45}s` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
