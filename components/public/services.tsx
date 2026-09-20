"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Blocks,
  BrainCircuit,
  Cloud,
  Palette,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const icons = [Blocks, Smartphone, BrainCircuit, Cloud, Palette, ShieldCheck];

const accents = [
  { glow: "bg-neon-cyan/25", text: "text-neon-cyan", line: "via-neon-cyan" },
  { glow: "bg-neon-indigo/25", text: "text-neon-indigo", line: "via-neon-indigo" },
  { glow: "bg-neon-emerald/25", text: "text-neon-emerald", line: "via-neon-emerald" },
  { glow: "bg-neon-blue/25", text: "text-neon-blue", line: "via-neon-blue" },
  { glow: "bg-neon-purple/25", text: "text-neon-purple", line: "via-neon-purple" },
  { glow: "bg-amber-400/25", text: "text-amber-300", line: "via-amber-400" },
];

/**
 * Interactive service selector — an icon dock with a live preview stage.
 *
 * Selecting a capability morphs the stage: the wireframe visual, status
 * readout and stack chips all animate between states, so exploring services
 * feels like operating a console rather than reading six static cards.
 */
export function Services() {
  const { locale, t } = useI18n();
  const [active, setActive] = useState(0);

  const service = t.services.items[active];
  const accent = accents[active % accents.length];
  const Icon = icons[active % icons.length];

  return (
    <section id="services" className="relative overflow-hidden section-y">
      {/* Ambient light sweep across the whole section — the beam layer was
          built for this and is pure CSS, so it costs nothing. */}
      <div aria-hidden className="beam-sweep z-backdrop absolute inset-0" />
      <div
        aria-hidden
        className="aurora aurora-emerald animate-drift-b z-backdrop absolute -start-40 top-1/3 h-[26rem] w-[26rem] blur-[130px]"
      />

      <div className="container-x relative z-content">
        <Reveal>
          <SectionHeading eyebrow="01 / CAPABILITIES" title={t.services.title} subtitle={t.services.subtitle} />
        </Reveal>

        <Reveal delay={0.08} className="mt-14">
          <div className="glass-card neon-border relative grid overflow-hidden lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            {/* ---------------- Icon dock ---------------- */}
            <div
              role="tablist"
              aria-label={t.services.title}
              className="relative flex gap-2 overflow-x-auto border-b border-line p-4 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-e lg:p-5"
            >
              {t.services.items.map((item, i) => {
                const ItemIcon = icons[i % icons.length];
                const itemAccent = accents[i % accents.length];
                const selected = i === active;
                return (
                  <button
                    key={item.title}
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActive(i)}
                    className={cn(
                      "group relative flex min-w-[132px] shrink-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-start transition-all duration-300",
                      selected
                        ? "border-neon-cyan/45 bg-white/[0.05] shadow-glow-cyan"
                        : "border-transparent hover:border-line hover:bg-white/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-105",
                        itemAccent.glow,
                        itemAccent.text,
                        selected && "scale-110",
                      )}
                    >
                      <ItemIcon className={cn("h-5 w-5", selected && "animate-icon-pulse")} />
                    </span>
                    <span
                      className={cn(
                        "min-w-0 text-sm font-semibold leading-snug tracking-tight transition-colors",
                        selected ? "text-ink-hi" : "text-ink-low group-hover:text-ink-mid",
                      )}
                    >
                      {item.title}
                    </span>
                    {selected && (
                      <motion.span
                        layoutId="service-dock-active"
                        className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-gradient-to-b from-neon-cyan to-neon-magenta"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ---------------- Live preview stage ---------------- */}
            <div className="relative min-h-[380px] overflow-hidden p-6 sm:p-10">
              {/* Ambient glow that morphs with the selection */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`glow-${active}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.7 }}
                  className={cn(
                    "pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full blur-[110px]",
                    accent.glow,
                  )}
                />
              </AnimatePresence>

              {/* Wireframe visual — pure CSS/SVG, morphs per service */}
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.16]">
                <div className="absolute inset-0 cyber-grid [mask-image:radial-gradient(ellipse_60%_60%_at_70%_40%,black,transparent)]" />
                <ServiceWireframe index={active} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  /* Transform + opacity only: blur crossfades repaint the whole
                     stage every frame on phones. */
                  initial={{ opacity: 0, y: 22, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.985 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex h-full min-h-[320px] flex-col"
                >
                  {/* Status line */}
                  <div className="flex items-center gap-2">
                    <span className="live-dot bg-neon-cyan" />
                    <span className="mono-label">
                      {t.services.stageLabel} 0{active + 1} / 0{t.services.items.length}
                    </span>
                  </div>

                  {/* Big icon + title */}
                  <div className="mt-8 flex items-start gap-5">
                    <span
                      className={cn(
                        "grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/10 animate-float-y",
                        accent.glow,
                        accent.text,
                      )}
                    >
                      <Icon className="h-7 w-7" />
                    </span>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-ink-hi">{service.title}</h3>
                      <p dir="auto" className="mt-3 max-w-xl leading-relaxed text-ink-low">
                        {service.desc}
                      </p>
                    </div>
                  </div>

                  {/* Stack chips */}
                  <div className="mt-8 flex flex-wrap gap-2">
                    {service.tags.map((tag, i) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.07 }}
                        className="chip font-mono"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-10">
                    <Button asChild variant="neon" className="group">
                      <a href={`/${locale}/quote#services`}>
                        <span className="relative z-10">{t.services.requestCta}</span>
                        <ArrowRight className="relative z-10 h-4 w-4 shrink-0 flip-x transition-transform group-hover:translate-x-0.5" />
                      </a>
                    </Button>
                    <span className="mono-label hidden opacity-50 sm:block">
                      {String(active + 1).padStart(2, "0")} — {String(t.services.items.length).padStart(2, "0")}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Decorative per-service wireframe drawn with CSS/SVG only — zero JS cost.
 * Each index renders a different structural motif so switching services
 * visibly changes the stage.
 */
function ServiceWireframe({ index }: { index: number }) {
  if (index === 0) {
    // Product engineering — isometric module stack
    return (
      <svg className="absolute end-6 top-1/2 h-64 w-64 -translate-y-1/2 animate-float-y" viewBox="0 0 200 200" fill="none">
        <motion.rect x="40" y="20" width="120" height="34" rx="6" stroke="currentColor" strokeWidth="1.2" className="text-neon-cyan" />
        <motion.rect x="52" y="66" width="96" height="34" rx="6" stroke="currentColor" strokeWidth="1.2" className="text-neon-indigo" />
        <motion.rect x="64" y="112" width="72" height="34" rx="6" stroke="currentColor" strokeWidth="1.2" className="text-neon-magenta" />
        <motion.path d="M100 54v12M100 100v12" stroke="currentColor" strokeWidth="1.2" className="text-neon-cyan" />
      </svg>
    );
  }
  if (index === 1) {
    // Mobile — device outline with signal arcs
    return (
      <svg className="absolute end-6 top-1/2 h-64 w-64 -translate-y-1/2 animate-float-y" viewBox="0 0 200 200" fill="none">
        <motion.rect x="70" y="20" width="60" height="120" rx="12" stroke="currentColor" strokeWidth="1.2" className="text-neon-cyan" />
        <motion.path d="M85 140h30" stroke="currentColor" strokeWidth="1.2" className="text-neon-cyan" />
        <motion.path d="M150 60a40 40 0 0 1 0 56M160 45a60 60 0 0 1 0 86" stroke="currentColor" strokeWidth="1.2" className="text-neon-indigo" />
      </svg>
    );
  }
  if (index === 2) {
    // AI — neural nodes
    return (
      <svg className="absolute end-6 top-1/2 h-64 w-64 -translate-y-1/2 animate-float-y" viewBox="0 0 200 200" fill="none">
        {[
          [40, 40], [40, 100], [40, 160], [100, 70], [100, 130], [160, 100],
        ].map(([cx, cy], i) => (
          <motion.circle key={i} cx={cx} cy={cy} r="8" stroke="currentColor" strokeWidth="1.2" className="text-neon-cyan" />
        ))}
        {[[40, 40, 100, 70], [40, 100, 100, 70], [40, 100, 100, 130], [40, 160, 100, 130], [100, 70, 160, 100], [100, 130, 160, 100]].map(([x1, y1, x2, y2], i) => (
          <motion.line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.8" className="text-neon-indigo" />
        ))}
      </svg>
    );
  }
  if (index === 3) {
    // Cloud — orbital rings
    return (
      <svg className="absolute end-6 top-1/2 h-64 w-64 -translate-y-1/2 animate-float-y" viewBox="0 0 200 200" fill="none">
        <motion.ellipse cx="100" cy="100" rx="80" ry="30" stroke="currentColor" strokeWidth="1" className="text-neon-cyan" />
        <motion.ellipse cx="100" cy="100" rx="80" ry="30" stroke="currentColor" strokeWidth="1" transform="rotate(60 100 100)" className="text-neon-indigo" />
        <motion.ellipse cx="100" cy="100" rx="80" ry="30" stroke="currentColor" strokeWidth="1" transform="rotate(120 100 100)" className="text-neon-magenta" />
        <motion.circle cx="100" cy="100" r="12" stroke="currentColor" strokeWidth="1.2" className="text-neon-cyan" />
      </svg>
    );
  }
  if (index === 4) {
    // Brand — grid of frames
    return (
      <svg className="absolute end-6 top-1/2 h-64 w-64 -translate-y-1/2 animate-float-y" viewBox="0 0 200 200" fill="none">
        <motion.rect x="30" y="30" width="60" height="60" rx="8" stroke="currentColor" strokeWidth="1.2" className="text-neon-cyan" />
        <motion.rect x="110" y="30" width="60" height="60" rx="8" stroke="currentColor" strokeWidth="1.2" className="text-neon-indigo" />
        <motion.rect x="30" y="110" width="60" height="60" rx="8" stroke="currentColor" strokeWidth="1.2" className="text-neon-magenta" />
        <motion.circle cx="140" cy="140" r="30" stroke="currentColor" strokeWidth="1.2" className="text-neon-cyan" />
      </svg>
    );
  }
  // Security — shield grid
  return (
    <svg className="absolute end-6 top-1/2 h-64 w-64 -translate-y-1/2 animate-float-y" viewBox="0 0 200 200" fill="none">
      <motion.path d="M100 20l60 24v42c0 40-26 68-60 84-34-16-60-44-60-84V44l60-24z" stroke="currentColor" strokeWidth="1.2" className="text-neon-cyan" />
      <motion.path d="M78 100l16 16 30-34" stroke="currentColor" strokeWidth="1.2" className="text-neon-emerald" />
    </svg>
  );
}
