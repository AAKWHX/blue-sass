"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AnimatedShaderHeroProps {
  locale: string;
  badge: string;
  headline: { line1: string; line2: string };
  subtitle: string;
  primary: string;
  secondary: string;
  trustLine: string;
}

/**
 * A compositor-only interpretation of the supplied shader hero. The visual
 * field is rasterised CSS and only transform/opacity animate, keeping phones
 * smooth and honouring reduced-motion preferences.
 */
export function AnimatedShaderHero({ locale, badge, headline, subtitle, primary, secondary, trustLine }: AnimatedShaderHeroProps) {
  const base = `/${locale}`;
  return <section className="shader-hero noise relative isolate flex min-h-svh overflow-hidden bg-black text-white">
    <div aria-hidden="true" className="absolute inset-0 z-backdrop overflow-hidden pointer-events-none">
      <div className="shader-cloud shader-cloud-a"/><div className="shader-cloud shader-cloud-b"/><div className="shader-cloud shader-cloud-c"/>
      <div className="shader-wave shader-wave-a"/><div className="shader-wave shader-wave-b"/>
      <div className="shader-grid absolute inset-0"/>
      <div className="shader-horizon absolute inset-x-0 bottom-[14%] h-px"/>
      <div className="shader-scene-mark absolute"/>
    </div>
    <div className="container-x relative z-content flex w-full flex-1 items-end px-6 pb-10 pt-32 md:px-10 md:pb-12">
      <div className="w-full max-w-4xl text-start">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .05 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-md sm:text-sm"><Sparkles className="size-4 text-[#02e807]"/>{badge}</motion.div>
        <div className="mt-6 space-y-0.5 sm:mt-8">
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .2 }} className="max-w-5xl text-[clamp(3.25rem,8vw,7.2rem)] font-bold uppercase leading-[1.02] tracking-[-.055em] text-white">{headline.line1}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .34 }} className="max-w-5xl text-[clamp(2.5rem,6vw,5.6rem)] font-semibold leading-[1.05] tracking-[-.045em] text-[#02e807]">{headline.line2}</motion.p>
        </div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .5 }} className="mt-4 max-w-2xl text-[clamp(1rem,1.5vw,1.35rem)] font-light leading-8 text-white/75 sm:mt-5 sm:leading-9">{subtitle}</motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .66 }} className="mt-6 flex flex-wrap gap-3 sm:mt-8">
          <Button asChild variant="unstyled" size="auto" className="hero-primary-cta min-h-12 rounded-md px-6 py-3 text-sm font-bold md:min-h-14 md:px-8 md:py-4"><Link href={`${base}/create-project`}>{primary}<motion.span className="inline-flex" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}><ArrowUpLeft className="size-4 flip-x"/></motion.span></Link></Button>
          <Button asChild variant="unstyled" size="auto" className="hero-secondary-cta min-h-12 rounded-md px-6 py-3 text-sm font-bold md:min-h-14 md:px-8 md:py-4"><Link href={`${base}/projects`}>{secondary}<motion.span className="inline-flex" whileHover={{ x: 4 }}><ArrowUpLeft className="size-4 flip-x"/></motion.span></Link></Button>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .55, delay: .86 }} className="mt-5 text-xs font-light tracking-wide text-white/50 sm:mt-6">{trustLine}</motion.p>
      </div>
    </div>
  </section>;
}
