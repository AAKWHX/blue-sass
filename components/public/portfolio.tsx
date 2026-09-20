"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Calendar, ExternalLink, Layers, Lock, Search, Unlock, X } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading, ProgressBar, StatusBadge } from "@/components/ui/primitives";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { useContent, type ShowcaseProject } from "@/lib/content-store";
import type { Visibility } from "@/lib/demo-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/**
 * Interactive portfolio gallery.
 *
 * Search + category chips + visibility filter, live count, and 3D tilt
 * cards. Selecting a project opens a rich case-study dialog with progress,
 * stage, stack and a live preview CTA.
 */
export function Portfolio() {
  const { t } = useI18n();
  const { showcase } = useContent();
  const [industry, setIndustry] = useState<string>("all");
  const [visibility, setVisibility] = useState<Visibility | "all">("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<ShowcaseProject | null>(null);

  const industries = useMemo(() => Array.from(new Set(showcase.map((p) => p.industry))), [showcase]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return showcase.filter((p) => {
      if (industry !== "all" && p.industry !== industry) return false;
      if (visibility !== "all" && p.visibility !== visibility) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tech.some((tech) => tech.toLowerCase().includes(q)) ||
        p.industry.toLowerCase().includes(q)
      );
    });
  }, [showcase, industry, visibility, query]);

  return (
    <section id="portfolio" className="relative overflow-hidden section-y">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-backdrop h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
      {/* Drifting ambient light — keeps the section alive between reveals. */}
      <div
        aria-hidden
        className="aurora aurora-magenta animate-drift-a pointer-events-none absolute -end-48 top-24 z-backdrop h-[30rem] w-[30rem] blur-[140px]"
      />
      <div
        aria-hidden
        className="aurora aurora-cyan animate-drift-b pointer-events-none absolute -start-40 bottom-10 z-backdrop h-[24rem] w-[24rem] blur-[120px]"
      />

      <div className="container-x relative z-content">
        <Reveal>
          <SectionHeading eyebrow="02 / SELECTED WORK" title={t.portfolio.title} subtitle={t.portfolio.subtitle} />
        </Reveal>
        <p className="mt-4 text-center text-xs text-ink-faint">Concept portfolio examples — client names and figures are anonymised illustrative content.</p>

        {/* ---------------- Control bar: search + filters ---------------- */}
        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.portfolio.searchPlaceholder}
                aria-label={t.common.search}
                className="!ps-10"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <FilterPill active={industry === "all"} onClick={() => setIndustry("all")}>
                {t.common.all}
              </FilterPill>
              {industries.map((ind) => (
                <FilterPill key={ind} active={industry === ind} onClick={() => setIndustry(ind)}>
                  {ind}
                </FilterPill>
              ))}
              <span className="mx-2 hidden h-5 w-px bg-line sm:block" />
              <FilterPill
                active={visibility === "public"}
                onClick={() => setVisibility(visibility === "public" ? "all" : "public")}
              >
                <Unlock className="h-3 w-3" /> {t.common.public}
              </FilterPill>
              <FilterPill
                active={visibility === "private"}
                onClick={() => setVisibility(visibility === "private" ? "all" : "private")}
              >
                <Lock className="h-3 w-3" /> {t.common.private}
              </FilterPill>
            </div>

            <p className="mono-label !text-ink-faint">
              {filtered.length} / {showcase.length} {t.portfolio.projectsLabel}
            </p>
          </div>
        </Reveal>

        {/* ---------------- Gallery ---------------- */}
        <motion.div layout className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <TiltCard intensity={8} className="h-full">
                  <Button
                    variant="unstyled"
                    size="auto"
                    type="button"
                    onClick={() => setActive(project)}
                    className="glass-card glow-hover neon-border group h-full w-full overflow-hidden text-start"
                  >
                    <div className={clsx("relative h-44 overflow-hidden bg-gradient-to-br", project.cover)}>
                      <div className="absolute inset-0 cyber-grid opacity-40" />
                      <div className="absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-transparent" />
                      <span className="absolute inset-0 grid place-items-center text-6xl text-white/30 animate-float-y transition-transform duration-700 group-hover:scale-125 group-hover:text-white/50">
                        {project.icon}
                      </span>

                      <span className="absolute top-3 end-3">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                            project.visibility === "private"
                              ? "border-rose-400/40 bg-rose-500/20 text-rose-200"
                              : "border-emerald-400/40 bg-emerald-500/20 text-emerald-100",
                          )}
                        >
                          {project.visibility === "private" ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          {project.visibility === "private" ? t.common.private : t.common.public}
                        </span>
                      </span>

                      <span className="mono-label absolute bottom-3 start-4 !text-white/70">{project.industry}</span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold leading-snug tracking-tight text-ink-hi">{project.name}</h3>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-low transition-all duration-300 group-hover:-translate-y-1 group-hover:text-neon-cyan" />
                      </div>
                      <p dir="auto" className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-low">
                        {project.summary}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.tech.slice(0, 3).map((tech) => (
                          <span key={tech} className="chip font-mono !px-2 !py-0.5 !text-[10px]">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <ProgressBar value={project.progress} className="!h-1" />
                        <span className="tabular text-xs font-bold text-neon-cyan">{project.progress}%</span>
                      </div>
                    </div>
                  </Button>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-sm text-ink-low">{t.common.empty}</p>
        )}

        <AnimatePresence>
          {active && <CaseModal project={active} onClose={() => setActive(null)} />}
        </AnimatePresence>
      </div>
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="unstyled"
      size="auto"
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold tracking-tight transition-all duration-300",
        active
          ? "border-neon-cyan/50 bg-gradient-to-r from-neon-cyan/20 to-neon-indigo/20 text-neon-cyan shadow-glow-cyan"
          : "border-line-strong text-ink-low hover:border-neon-cyan/50 hover:text-neon-cyan",
      )}
    >
      {children}
    </Button>
  );
}

function CaseModal({ project, onClose }: { project: ShowcaseProject; onClose: () => void }) {
  const { t } = useI18n();
  const isPrivate = project.visibility === "private";

  return (
    // Radix Dialog supplies the focus trap, Escape handling and aria wiring.
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton={false} className="max-h-[85vh] max-w-2xl overflow-auto p-0">
        <div className={clsx("relative h-40 overflow-hidden bg-gradient-to-br", project.cover)}>
          <div className="absolute inset-0 cyber-grid opacity-40" />
          <span className="absolute inset-0 grid place-items-center text-7xl text-white/25 animate-float-y">{project.icon}</span>
          <DialogClose
            aria-label={t.common.close}
            className="absolute top-3 end-3 rounded-full bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        <div className="p-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.stage} label={t.status[project.stage]} />
            <span className="chip">
              <Layers className="h-3 w-3" /> {project.industry}
            </span>
            {isPrivate && (
              <span className="chip border-rose-400/40 text-rose-300">
                <Lock className="h-3 w-3" /> {t.common.confidential}
              </span>
            )}
          </div>

          <DialogHeader>
            <DialogTitle dir="auto" className="mt-5 text-2xl font-black tracking-tight">{project.name}</DialogTitle>
            <DialogDescription dir="auto" className="mt-3 text-sm leading-relaxed">{project.summary}</DialogDescription>
          </DialogHeader>

          <dl className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Meta label={t.common.progress} value={`${project.progress}%`} />
            <Meta label={t.common.status} value={t.status[project.stage]} />
            <Meta label={t.portfolio.filters.visibility} value={isPrivate ? t.common.private : t.common.public} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span key={tech} className="chip font-mono">
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            {project.url && !isPrivate && (
              <Button asChild variant="neon">
                <a href={project.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {t.common.viewCase}
                </a>
              </Button>
            )}
            <Button type="button" onClick={onClose} variant="ghostNeon">
              {t.common.close}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mono-label !text-ink-low">{label}</dt>
      <dd className="mt-1.5 flex items-center gap-1.5 text-sm font-bold">
        <Calendar className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
        {value}
      </dd>
    </div>
  );
}
