"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpLeft, Check } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Reveal, motion } from "@/components/ui/motion";

export function Hero() {
  const { locale, t } = useI18n();
  const ar = locale === "ar";
  const points = ar ? ["اختر الخدمة المناسبة", "راجع التفاصيل والتكلفة", "ابدأ التنفيذ مع فريق واحد"] : [t.process.steps[0].title, t.process.steps[1].title, t.process.steps[2].title];

  return (
    <section className="relative overflow-hidden bg-base">
      <div className="container-x grid min-h-[720px] items-center gap-10 py-14 lg:grid-cols-[.92fr_1.08fr] lg:py-20">
        <Reveal className="relative z-10 lg:order-2">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-neon-blue"><i className="size-2 rounded-full bg-neon-magenta" />Blue Sass · {ar ? "استوديو منتجات رقمية" : "Digital product studio"}</span>
          <h1 className="mt-5 max-w-2xl text-[clamp(2.35rem,6.5vw,6.8rem)] font-bold leading-[1.08] tracking-[-.045em] text-black sm:leading-[.98]">{t.hero.title}</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-ink-low sm:text-lg">{t.hero.subtitle}</p>
          <ul className="mt-6 space-y-2.5">{points.map((point) => <li key={point} className="flex items-center gap-2 text-sm font-semibold text-black"><Check className="size-4 text-neon-blue" />{point}</li>)}</ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="neon" size="lg"><Link href={`/${locale}/create-project`}>{t.hero.ctaPrimary}<ArrowUpLeft className="size-4 flip-x"/></Link></Button>
            <Button asChild variant="ghostNeon" size="lg"><Link href={`/${locale}/about`}>{ar ? "من نحن" : "About us"}</Link></Button>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative min-h-[460px] lg:order-1">
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 mx-auto max-w-[680px]">
            <Image src="/media/blue-sass-hero-3d.webp" alt={ar ? "تصميم ثلاثي الأبعاد لأجهزة ومنتجات رقمية من بلو ساس" : "Blue Sass 3D digital product devices"} width={1400} height={1400} priority className="h-auto w-full drop-shadow-[0_32px_35px_rgba(20,68,130,.2)]" />
          </motion.div>
          <span aria-hidden className="absolute -start-2 top-10 size-52 rounded-full bg-neon-cyan" />
          <span aria-hidden className="absolute -end-3 bottom-6 h-56 w-44 rounded-[4rem] bg-neon-cyan" />
          <span aria-hidden className="absolute end-[12%] top-0 text-7xl font-black text-neon-indigo">✦</span>
          <Link href="#services" className="absolute bottom-0 start-0 z-20 grid size-14 place-items-center rounded-full border border-black bg-white text-black transition hover:bg-black hover:text-white"><ArrowDown className="size-5"/></Link>
        </Reveal>
      </div>

      <div className="container-x grid gap-4 pb-10 sm:grid-cols-2">
        <div className="rounded-xl border border-black bg-neon-cyan px-6 py-4 text-center text-sm font-bold text-black">{ar ? "استشارة أولية مجانية لمشروعك" : "Free initial project consultation"}</div>
        <div className="rounded-xl border border-black bg-neon-cyan px-6 py-4 text-center text-sm font-bold text-black">{ar ? "تصميم وتطوير وتسليم من فريق واحد" : "Design, development and delivery by one team"}</div>
      </div>
    </section>
  );
}
