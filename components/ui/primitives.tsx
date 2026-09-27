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
  done: "bg-emerald-100 text-emerald-800 border-emerald-300",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  in_progress: "bg-sky-100 text-sky-800 border-sky-300",
  development: "bg-sky-100 text-sky-800 border-sky-300",
  testing: "bg-amber-100 text-amber-800 border-amber-300",
  review: "bg-violet-100 text-violet-800 border-violet-300",
  design: "bg-blue-100 text-blue-800 border-blue-300",
  planning: "bg-slate-100 text-slate-800 border-slate-300",
  blocked: "bg-rose-100 text-rose-800 border-rose-300",
  todo: "bg-white text-ink-low border-line-strong",
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
