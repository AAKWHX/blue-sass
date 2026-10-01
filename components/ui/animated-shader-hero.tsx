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
}

/**
 * A compositor-only interpretation of the supplied shader hero. The visual
 * field is rasterised CSS and only transform/opacity animate, keeping phones
 * smooth and honouring reduced-motion preferences.
 */
export function AnimatedShaderHero({ locale, badge, headline, subtitle, primary, secondary }: AnimatedShaderHeroProps) {
  const base = `/${locale}`;
  return <section className="shader-hero noise relative isolate flex min-h-[calc(100svh-82px)] overflow-hidden bg-black text-white">
    <div aria-hidden="true" className="absolute inset-0 z-backdrop overflow-hidden pointer-events-none">
      <div className="shader-cloud shader-cloud-a"/><div className="shader-cloud shader-cloud-b"/><div className="shader-cloud shader-cloud-c"/>
      <div className="shader-wave shader-wave-a"/><div className="shader-wave shader-wave-b"/>
      <div className="shader-grid absolute inset-0"/>
      <div className="absolute inset-x-0 bottom-[17%] h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"/>
    </div>
    <div className="container-x relative z-content flex flex-1 items-center justify-center py-20 text-center sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.06] px-4 py-2 text-xs font-semibold text-white/75 backdrop-blur-md sm:text-sm"><Sparkles className="size-4 text-white"/>{badge}</motion.div>
        <div className="mt-8 space-y-1 sm:mt-10">
          <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .12 }} className="text-[clamp(3rem,9vw,8.4rem)] font-black leading-[.96] tracking-[-.055em] text-white">{headline.line1}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .24 }} className="text-gradient-hero text-[clamp(3rem,9vw,8.4rem)] font-black leading-[.96] tracking-[-.055em]">{headline.line2}</motion.p>
        </div>
        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .38 }} className="mx-auto mt-8 max-w-3xl text-base leading-8 text-white/65 sm:text-xl sm:leading-9">{subtitle}</motion.p>
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .5 }} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="neon" size="lg" className="min-h-14 rounded-full px-8 text-base"><Link href={`${base}/create-project`}>{primary}<ArrowUpLeft className="size-4 flip-x"/></Link></Button>
          <Button asChild variant="unstyled" size="auto" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 bg-white/[.06] px-8 text-base font-bold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/[.11]"><Link href={`${base}/services`}>{secondary}</Link></Button>
        </motion.div>
      </div>
    </div>
  </section>;
}
