"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMotionActive } from "@/hooks/use-motion-active";

export interface AnimatedShaderHeroProps {
  locale: string;
  headline: { line1: string; line2: string };
  subtitle: string;
  primary: string;
  secondary: string;
  trustLine: string;
}

/**
 * Local, responsive artwork with compositor-only motion. No WebGL or remote
 * scene dependency; the background stays visible when motion is disabled.
 */
export function AnimatedShaderHero({ locale, headline, subtitle, primary, secondary, trustLine }: AnimatedShaderHeroProps) {
  const base = `/${locale}`;
  const sectionRef = useRef<HTMLElement>(null);
  const motionActive = useMotionActive(sectionRef);
  return <section ref={sectionRef} data-motion-active={motionActive} className="shader-hero noise relative isolate flex min-h-svh overflow-hidden bg-black text-white">
    <div aria-hidden="true" className="absolute inset-0 z-backdrop overflow-hidden pointer-events-none">
      <div className="hero-artwork absolute inset-0"><Image src="/media/hero-chrome-ribbon-v1.webp" alt="" fill sizes="100vw" quality={92} preload className="hero-artwork-image"/></div>
      <div className="hero-artwork-shade absolute inset-0"/>
    </div>
    <div className="container-x relative z-content flex w-full flex-1 items-end px-6 pb-10 pt-32 md:px-10 md:pb-12">
      <div className="w-full max-w-4xl text-start">
        <div className="space-y-0.5">
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .2 }} className="max-w-5xl text-[clamp(3.25rem,8vw,7.2rem)] font-bold uppercase leading-[1.02] tracking-[-.055em] text-white">{headline.line1}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .34 }} className="max-w-5xl text-[clamp(2.5rem,6vw,5.6rem)] font-semibold leading-[1.05] tracking-[-.045em] text-white/85">{headline.line2}</motion.p>
        </div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .5 }} className="mt-4 max-w-2xl text-[clamp(1rem,1.5vw,1.35rem)] font-light leading-8 text-white/75 sm:mt-5 sm:leading-9">{subtitle}</motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .66 }} className="mt-6 flex flex-wrap gap-3 sm:mt-8">
          <Button asChild variant="neon" size="lg"><Link href={`${base}/create-project`}>{primary}<ArrowUpLeft className="size-4 flip-x"/></Link></Button>
          <Button asChild variant="outline" size="lg" className="border-white/40 bg-black/30 text-white hover:bg-white/15 hover:text-white"><Link href={`${base}/projects`}>{secondary}<ArrowUpLeft className="size-4 flip-x"/></Link></Button>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .55, delay: .86 }} className="mt-5 text-xs font-light tracking-wide text-white/50 sm:mt-6">{trustLine}</motion.p>
      </div>
    </div>
  </section>;
}
