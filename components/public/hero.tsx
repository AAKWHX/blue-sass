"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Compass, Sparkles } from "lucide-react";
import { useRef } from "react";
import { useI18n } from "@/components/providers";
import { useContent } from "@/lib/content-store";
import { AnimatedCounter, Reveal, StaggerGroup, StaggerItem } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import { HeroVisual } from "@/components/public/hero-visual";
import { StageBackdrop } from "@/components/ui/stage-backdrop";
import { LineForms } from "@/components/ui/line-forms";

/**
 * Hero — cinematic, interactive.
 *
 * Layer contract (see AGENTS.md):
 *   z-backdrop (0)  cyber grid + HUD corners, pointer-events-none
 *   z-stage    (20) the interactive 3D core, pointer-events-none
 *   z-copy     (30) headline, badge, CTAs, HUD readouts
 *
 * The 3D rig reacts to the pointer continuously (tilt, parallax) and to
 * press-and-hold (engage state). Scroll drives a parallax exit so the hero
 * dissolves as the user moves into the services section.
 */
export function Hero() {
  const { locale, t } = useI18n();
  const { stats } = useContent();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const coreY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const coreScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const coreOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden noise">
      {/* ---------- LAYER 0 — ambient depth ---------- */}
      {/* ---------- Cinematic stage rig — light shaft, aurora curtains,
              glowing horizon, perspective floor, dust ---------- */}
      <div className="absolute inset-0 z-backdrop">
        <StageBackdrop />
        <LineForms />
      </div>
      {/* Faint tech grid riding over the stage — static mask, no crawl on top. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-backdrop cyber-grid opacity-20 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]"
      />
      {/* HUD frame corners — the targeting-reticle look */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-backdrop hidden md:block">
        <span className="absolute start-8 top-24 h-10 w-10 border-s-2 border-t-2 border-neon-cyan/40" />
        <span className="absolute end-8 top-24 h-10 w-10 border-e-2 border-t-2 border-neon-cyan/40" />
        <span className="absolute bottom-10 start-8 h-10 w-10 border-b-2 border-s-2 border-neon-cyan/40" />
        <span className="absolute bottom-10 end-8 h-10 w-10 border-b-2 border-e-2 border-neon-cyan/40" />
      </div>

      <div className="container-x relative section-y">
        <div className="relative">
          {/* ---------- Light stage — CSS-only, GPU-composited ---------- */}
          <motion.div
            aria-hidden
            style={{ y: coreY, scale: coreScale, opacity: coreOpacity }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-stage flex aspect-square w-[min(120vw,1550px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          >
            <HeroVisual />
          </motion.div>

          {/* ================= COPY — z-copy (30) ================= */}
          <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-copy">
            <div className="flex min-h-[clamp(620px,76vh,880px)] flex-col items-center justify-center px-4 text-center">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="neon-border inline-flex items-center gap-2 rounded-full border border-neon-cyan/35 bg-neon-cyan/[0.08]
                           px-3.5 py-1.5 text-xs font-semibold tracking-tight text-neon-cyan backdrop-blur-md"
              >
                <span className="live-dot bg-neon-cyan shadow-glow-cyan" />
                <Sparkles className="h-3.5 w-3.5 shrink-0 animate-icon-pulse" />
                {t.hero.badge}
              </motion.span>

              {/* Word-level reveal: safe for Arabic letter joining — animates
                  in all 7 locales rather than falling back to static text. */}
              <AnimatedHeading
                key={t.hero.title}
                as="h1"
                text={t.hero.title}
                delay={0.15}
                stagger={0.075}
                className="mt-7 text-4xl font-black leading-[1.12] text-white sm:text-5xl lg:text-6xl xl:text-[4.4rem]"
              />

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 max-w-xl text-base leading-relaxed text-ink-mid sm:text-lg"
              >
                {t.hero.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32 }}
                className="mt-9 flex flex-wrap items-center justify-center gap-3"
              >
                <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }}>
                  <Button asChild variant="neon" className="group">
                    <Link href={`/${locale}/quote`}>
                      <span className="relative z-10">{t.hero.ctaPrimary}</span>
                      <ArrowRight className="relative z-10 h-4 w-4 shrink-0 flip-x transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }}>
                  <Button asChild variant="ghostNeon" className="group">
                    <Link href="#portfolio">
                      <Compass className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-45" />
                      {t.hero.ctaSecondary}
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Live status ticker — sits at the bottom of the stage */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="mono-label pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 !text-ink-faint"
              >
                <span className="live-dot bg-neon-cyan" />
                <span dir="ltr">AAKWHX.SYS — {t.hero.systemOnline}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll cue — animated, functional (anchor to stats) */}
          <motion.a
            href="#metrics"
            aria-label={t.hero.ctaSecondary}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-4 end-6 z-copy hidden text-neon-cyan/70 transition-colors hover:text-neon-cyan lg:block"
          >
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </motion.a>
        </div>

        {/* ---------- Animated counters ---------- */}
        <div id="metrics" className="scroll-mt-24">
        <StaggerGroup className="relative z-copy mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StaggerItem key={stat.id}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-card neon-border h-full p-6 text-center"
              >
                <p className="text-4xl font-extrabold">
                  <AnimatedCounter
                    value={stat.value}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={1700 + i * 110}
                    className="text-gradient"
                  />
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-ink-low">
                  {t.hero.stats[i]?.label ?? stat.label}
                </p>
                {stat.growth !== 0 && (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-neon-emerald/12 px-2 py-0.5 text-[10px] font-bold text-neon-emerald">
                    <span className="live-dot bg-neon-emerald" />
                    {stat.growth > 0 ? "+" : ""}
                    {stat.growth}%
                  </span>
                )}
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGroup>
        </div>

        {/* ---------- Delivery pipeline (terminal strip) ---------- */}
        <Reveal className="relative z-copy mt-16" delay={0.1}>
          <div className="glow-border neon-border bg-surface/70 p-1.5 backdrop-blur-md">
            <div className="rounded-[1.1rem] bg-base/70 p-5">
              <div className="flex items-center gap-1.5 pb-4">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-neon-emerald/80" />
                <span className="ms-3 font-mono text-[11px] text-ink-faint" dir="ltr">
                  awwa://delivery-pipeline — live
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-5">
                {t.process.steps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.07 * i, duration: 0.45 }}
                    className="group rounded-xl border border-line bg-white/[0.03] p-3 text-start transition-colors hover:border-neon-cyan/40"
                  >
                    <span className="font-mono text-[10px] text-neon-cyan">0{i + 1}</span>
                    <p className="mt-1 text-xs font-semibold text-ink-mid">{step.title}</p>
                    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-line">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${100 - i * 18}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 + i * 0.09, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
