"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal, StaggerGroup, StaggerItem, TiltCard } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

/**
 * Scroll-driven process path.
 *
 * An SVG connector draws itself as the user scrolls through the section
 * (scaleX bound to scrollYProgress), so the pipeline feels alive rather than
 * being a static strip. On mobile the connector runs vertically.
 */
export function Process() {
  const { t } = useI18n();
  const pathRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: pathRef,
    offset: ["start 0.85", "end 0.45"],
  });
  const drawX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scaleX = useTransform(drawX, (v) => v);
  const pulseLeft = useTransform(drawX, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="relative overflow-hidden section-y">
      {/* Slow scan beam over the methodology path — mirrors the hero sweep. */}
      <div aria-hidden className="beam-sweep absolute inset-0" />
      <div className="container-x relative z-content">
        <Reveal>
          <SectionHeading title={t.process.title} subtitle={t.process.subtitle} />
        </Reveal>

        <div ref={pathRef} className="relative mt-16">
          {/* Connecting beam — draws itself with scroll */}
          <motion.div
            aria-hidden
            style={{ scaleX }}
            className="absolute inset-x-0 top-8 hidden h-px origin-inline-start bg-gradient-to-r from-neon-cyan/60 via-neon-indigo/60 to-neon-purple/60 lg:block"
          />
          {/* Travelling pulse riding the beam */}
          <motion.div
            aria-hidden
            style={{ left: pulseLeft }}
            className="absolute top-8 hidden lg:block"
          >
            <span className="block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan shadow-glow-cyan" />
          </motion.div>

          <StaggerGroup className="grid gap-4 lg:grid-cols-5">
            {t.process.steps.map((step, i) => (
              <StaggerItem key={step.title}>
                <TiltCard intensity={6} className="h-full">
                  <div className="glass-card glow-hover group relative h-full border border-line-strong p-6 pt-10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                    <span className="absolute -top-3 start-6 grid h-8 min-w-8 place-items-center rounded-full border border-white/35 bg-[#1b2028] px-2 font-mono text-[11px] font-black tracking-wider text-white shadow-[0_0_18px_rgba(255,255,255,0.22)]">
                      0{i + 1}
                    </span>
                    <h3 className="text-base font-bold tracking-tight text-ink-hi">{step.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-low">{step.desc}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>

      </div>
    </section>
  );
}

export function CallToAction() {
  const { locale, t } = useI18n();
  const ar = locale === "ar";

  return (
    <section className="section-y bg-base">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-black bg-neon-cyan p-8 sm:p-12 lg:p-16">
            <span aria-hidden className="absolute -end-12 -top-14 text-[13rem] font-black leading-none text-white/45">B</span>
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div><span className="text-sm font-bold text-black/60">BLUE SASS / NEXT</span><h2 className="mt-5 max-w-3xl text-3xl font-bold text-black sm:text-6xl">{ar ? "جاهز نحول فكرتك إلى منتج حقيقي؟" : t.quote.title}</h2>
            <p className="mt-5 max-w-2xl leading-8 text-black/65">
              {t.quote.subtitle}
            </p></div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild variant="unstyled" size="auto" className="group rounded-xl bg-black px-7 py-4 font-bold text-white transition hover:bg-neon-blue">
                <Link href={`/${locale}/create-project`}>
                  <span className="relative z-10">{t.hero.ctaPrimary}</span>
                  <ArrowRight className="relative z-10 h-4 w-4 shrink-0 flip-x transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
