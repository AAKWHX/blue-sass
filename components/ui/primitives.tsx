"use client";

import clsx from "clsx";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card as ShadcnCard } from "@/components/ui/card";

/**
 * App-level primitives.
 *
 * ProgressBar / Card / StatusBadge are thin wrappers over the shadcn
 * components so the ~10 existing call sites keep their API while the actual
 * markup, a11y and styling come from one shared implementation.
 */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={clsx("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-start")}>
      {eyebrow && (
        <Badge variant="neon" className="mono-label px-3 py-1.5">
          {eyebrow}
        </Badge>
      )}
      <h2 className="mt-5 text-3xl sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-ink-low">{subtitle}</p>}
    </div>
  );
}

/** Radix-backed progress bar (correct role + aria-valuenow come for free). */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return <Progress value={value} className={className} />;
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <ShadcnCard className={clsx("p-6", className)}>{children}</ShadcnCard>;
}

const statusTone: Record<string, string> = {
  done: "bg-neon-emerald/15 text-neon-emerald border-neon-emerald/35",
  completed: "bg-neon-emerald/15 text-neon-emerald border-neon-emerald/35",
  in_progress: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/35",
  development: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/35",
  testing: "bg-amber-400/15 text-amber-300 border-amber-400/35",
  review: "bg-neon-purple/15 text-neon-purple border-neon-purple/35",
  design: "bg-neon-indigo/15 text-neon-blue border-neon-indigo/35",
  planning: "bg-neon-blue/15 text-neon-blue border-neon-blue/35",
  blocked: "bg-rose-500/15 text-rose-300 border-rose-500/35",
  todo: "bg-white/[0.06] text-ink-low border-line-strong",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <Badge
      className={clsx("px-2.5 py-1 text-[11px] font-semibold backdrop-blur", statusTone[status] ?? statusTone.todo)}
    >
      {label}
    </Badge>
  );
}
