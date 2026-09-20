"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal, StaggerGroup, StaggerItem, TiltCard } from "@/components/ui/motion";
import { ParticleField } from "@/components/ui/backgrounds";
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
                  <div className="glass-card glow-hover neon-border group relative h-full p-6 pt-9">
                    <span className="absolute -top-3 start-6 rounded-full bg-gradient-to-r from-neon-cyan to-neon-indigo px-3 py-1 font-mono text-[11px] font-black text-white shadow-glow-cyan">
                      0{i + 1}
                    </span>
                    <h3 className="text-base font-bold tracking-tight">{step.title}</h3>
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

  return (
    <section className="pb-28">
      <div className="container-x">
        <Reveal>
          <div className="glow-border neon-border noise relative overflow-hidden bg-gradient-to-br from-neon-cyan/[0.12] via-neon-indigo/[0.08] to-neon-magenta/[0.12] p-12 text-center sm:p-20">
            <ParticleField density={45} className="opacity-70" />
            <div className="absolute inset-0 cyber-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            {/* pulse-glow animates transform, so centring uses inset/margin —
                a -translate-x-1/2 here would be clobbered by the animation. */}
            <div className="aurora aurora-cyan animate-pulse-glow absolute inset-x-0 -bottom-24 mx-auto h-72 w-[600px] blur-[120px]" />

            <h2 className="relative text-3xl sm:text-5xl">
              <span className="text-gradient-hero">{t.quote.title}</span>
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl leading-relaxed text-ink-low">
              {t.quote.subtitle}
            </p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild variant="neon" className="group !px-7 !py-3.5 !text-base">
                <Link href={`/${locale}/quote`}>
                  <span className="relative z-10">{t.hero.ctaPrimary}</span>
                  <ArrowRight className="relative z-10 h-4 w-4 shrink-0 flip-x transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="ghostNeon" className="!px-7 !py-3.5 !text-base">
                <Link href={`/${locale}/portal`}>{t.nav.portal}</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
