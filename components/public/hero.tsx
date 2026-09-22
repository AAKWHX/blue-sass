"use client";

import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { locale, t } = useI18n();
  return (
    <section className="relative overflow-hidden border-b border-line bg-base">
      <div className="container-x py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">{t.hero.title}</h1>
            <p className="text-base leading-relaxed text-ink-low sm:text-lg">{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild variant="neon"><Link href={`/${locale}/quote`}>{t.hero.ctaPrimary}<ArrowRight className="size-4 flip-x" /></Link></Button>
              <Button asChild variant="ghostNeon"><Link href="#services">{t.nav.services}<ArrowDown className="size-4" /></Link></Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
