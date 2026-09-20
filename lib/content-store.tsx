"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { projects as seedProjects } from "@/lib/mock-data";
import type { Project, ProjectStage, Visibility } from "@/lib/demo-types";

/**
 * Central content store for everything the marketing site renders.
 *
 * The Admin CMS writes to it and the public showcase reads from it, so any edit
 * made in /admin is reflected instantly on /. State is persisted to
 * localStorage; the same shapes map 1:1 to the `projects` table defined in
 * lib/db/schema.ts.
 */

export interface StatItem {
  id: string;
  value: number;
  suffix: string;
  prefix: string;
  decimals: number;
  /** i18n key into hero.stats, or a custom label typed in the CMS. */
  label: string;
  growth: number;
}

export interface ShowcaseProject {
  id: string;
  name: string;
  summary: string;
  industry: string;
  visibility: Visibility;
  stage: ProjectStage;
  progress: number;
  tech: string[];
  cover: string;
  url: string;
  icon: string;
  featured: boolean;
}

export const gradientPresets = [
  "from-cyan-500/40 via-blue-500/20 to-violet-600/40",
  "from-emerald-500/40 via-teal-500/20 to-cyan-500/40",
  "from-fuchsia-500/40 via-purple-500/20 to-indigo-600/40",
  "from-amber-500/40 via-orange-500/20 to-rose-500/40",
  "from-rose-500/40 via-pink-500/20 to-fuchsia-600/40",
  "from-slate-400/30 via-zinc-500/20 to-slate-700/40",
];

export const iconPresets = ["◈", "◆", "▲", "●", "⬢", "✦", "⬡", "◇"];

const defaultStats: StatItem[] = [
  { id: "s-1", value: 184, suffix: "+", prefix: "", decimals: 0, label: "Products shipped", growth: 12 },
  { id: "s-2", value: 31, suffix: "", prefix: "", decimals: 0, label: "Countries served", growth: 8 },
  { id: "s-3", value: 99.98, suffix: "%", prefix: "", decimals: 2, label: "Platform uptime", growth: 0.4 },
  { id: "s-4", value: 7, suffix: "", prefix: "", decimals: 0, label: "Languages supported", growth: 40 },
];

const defaultProjects: ShowcaseProject[] = seedProjects.map((p: Project, i) => ({
  id: p.id,
  name: p.name,
  summary: p.summary,
  industry: p.industry,
  visibility: p.visibility,
  stage: p.stage,
  progress: p.progress,
  tech: p.tech,
  cover: gradientPresets[i % gradientPresets.length],
  url: p.visibility === "private" ? "" : `https://${p.slug}.example.com`,
  icon: iconPresets[i % iconPresets.length],
  featured: i < 3,
}));

interface ContentValue {
  stats: StatItem[];
  showcase: ShowcaseProject[];
  updateStat: (id: string, patch: Partial<StatItem>) => void;
  addStat: () => void;
  removeStat: (id: string) => void;
  upsertProject: (project: ShowcaseProject) => void;
  removeProject: (id: string) => void;
  reset: () => void;
  hydrated: boolean;
}

const ContentContext = createContext<ContentValue | null>(null);

const STORAGE_KEY = "awwa-cms-content";

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<StatItem[]>(defaultStats);
  const [showcase, setShowcase] = useState<ShowcaseProject[]>(defaultProjects);
  const [hydrated, setHydrated] = useState(false);

  /**
   * Stored content is applied AFTER mount, deliberately.
   *
   * A lazy useState initialiser reading localStorage would make the first
   * client render differ from the server HTML and produce a hydration
   * mismatch. React's compiler lints this as "setState in effect", but the
   * post-mount read is the correct trade-off for SSR-safe persistence.
   */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { stats?: StatItem[]; showcase?: ShowcaseProject[] };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- see note above: reading storage during render would break hydration
        if (Array.isArray(parsed.stats) && parsed.stats.length) setStats(parsed.stats);
        if (Array.isArray(parsed.showcase) && parsed.showcase.length) setShowcase(parsed.showcase);
      }
    } catch {
      // Corrupted payload — fall back to the seeded content.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, showcase }));
    window.dispatchEvent(new CustomEvent("awwa-content-change"));
  }, [stats, showcase, hydrated]);

  // Keep every open tab / route in sync.
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      const parsed = JSON.parse(e.newValue) as { stats: StatItem[]; showcase: ShowcaseProject[] };
      setStats(parsed.stats);
      setShowcase(parsed.showcase);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const updateStat = useCallback((id: string, patch: Partial<StatItem>) => {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const addStat = useCallback(() => {
    setStats((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        value: 0,
        suffix: "",
        prefix: "",
        decimals: 0,
        label: "New metric",
        growth: 0,
      },
    ]);
  }, []);

  const removeStat = useCallback((id: string) => {
    setStats((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const upsertProject = useCallback((project: ShowcaseProject) => {
    setShowcase((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      return exists ? prev.map((p) => (p.id === project.id ? project : p)) : [project, ...prev];
    });
  }, []);

  const removeProject = useCallback((id: string) => {
    setShowcase((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const reset = useCallback(() => {
    setStats(defaultStats);
    setShowcase(defaultProjects);
  }, []);

  const value = useMemo<ContentValue>(
    () => ({ stats, showcase, updateStat, addStat, removeStat, upsertProject, removeProject, reset, hydrated }),
    [stats, showcase, updateStat, addStat, removeStat, upsertProject, removeProject, reset, hydrated],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}

export function emptyProject(): ShowcaseProject {
  return {
    id: `p-${Date.now()}`,
    name: "",
    summary: "",
    industry: "SaaS",
    visibility: "public",
    stage: "planning",
    progress: 0,
    tech: [],
    cover: gradientPresets[0],
    url: "",
    icon: iconPresets[0],
    featured: false,
  };
}
