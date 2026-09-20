"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  Building2,
  Gauge,
  Gem,
  KanbanSquare,
  Lock,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useI18n } from "@/components/providers";
import { ProgressBar, StatusBadge } from "@/components/ui/primitives";
import { canAccess, roleOrder, type AdminModule } from "@/lib/permissions";
import { CmsStats } from "@/components/admin/cms-stats";
import { CmsPortfolio } from "@/components/admin/cms-portfolio";
import { Reveal } from "@/components/ui/motion";
import { getProfile, getRole, kpis, profiles, projects, tasks, userRoles } from "@/lib/mock-data";
import type { AppRole } from "@/lib/demo-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const modules: { key: AdminModule; icon: typeof Gauge }[] = [
  { key: "dashboard", icon: Gauge },
  { key: "projects", icon: Briefcase },
  { key: "tasks", icon: KanbanSquare },
  { key: "team", icon: Users },
  { key: "clients", icon: Building2 },
  { key: "cmsStats", icon: Sparkles },
  { key: "cmsPortfolio", icon: Gem },
];

const columns = ["todo", "in_progress", "blocked", "done"] as const;

export function AdminView() {
  const { t, locale } = useI18n();
  const [role, setRole] = useState<AppRole>("super_admin");
  const [module, setModule] = useState<AdminModule>("dashboard");
  const [query, setQuery] = useState("");

  const allowed = canAccess(role, module);

  const filteredProjects = useMemo(
    () => projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const money = (v: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

  return (
    <section className="relative py-12">
      <div className="container-x relative z-content">
        <header className="glass-card flex flex-wrap items-center justify-between gap-5 p-6">
          <div>
            <span className="mono-label rounded-full border border-violet-400/30 bg-violet-400/5 px-3 py-1.5">AAKWHX / ERP CORE</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight"><span className="text-gradient">{t.admin.title}</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="role-switch" className="text-xs font-semibold uppercase tracking-widest text-ink-low">
              {t.admin.roleLabel}
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger id="role-switch" className="!w-auto !py-2 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOrder.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t.admin.roles[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr]">
          <nav className="glass-card sticky top-20 h-fit p-3">
            <ul className="space-y-1">
              {modules.map(({ key, icon: Icon }) => {
                const can = canAccess(role, key);
                return (
                  <li key={key}>
                    <Button variant="unstyled" size="auto"
                      type="button"
                      onClick={() => setModule(key)}
                      className={clsx(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                        module === key
                          ? "bg-gradient-to-r from-neon-cyan to-neon-indigo text-white shadow-glow-cyan"
                          : can
                            ? "text-ink-low hover:bg-white/[0.05]"
                            : "text-ink-low",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-start">{t.admin.tabs[key]}</span>
                      {!can && <Lock className="h-3.5 w-3.5" />}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-5">
            {!allowed ? (
              <div className="glass-card flex items-center gap-3 p-8 text-sm font-semibold text-rose-300">
                <AlertTriangle className="h-5 w-5" />
                {t.admin.permissionDenied}
              </div>
            ) : module === "dashboard" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Kpi label={t.admin.kpis.revenue} value={money(kpis.revenueYtd)} icon={TrendingUp} tone="emerald" />
                  <Kpi label={t.admin.kpis.active} value={String(kpis.activeProjects)} icon={Briefcase} tone="brand" />
                  <Kpi label={t.admin.kpis.utilisation} value={`${kpis.utilisation}%`} icon={Gauge} tone="violet" />
                  <Kpi label={t.admin.kpis.overdue} value={String(kpis.overdueTasks)} icon={AlertTriangle} tone="rose" />
                </div>

                <div className="glass-card p-6">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-ink-low">
                    <BarChart3 className="h-4 w-4" /> {t.admin.kpis.revenue}
                  </h3>
                  <div className="mt-6 flex h-48 items-end gap-2">
                    {kpis.revenueByMonth.map((m) => (
                      <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-neon-cyan via-neon-blue to-neon-indigo shadow-glow-cyan transition-all"
                          style={{ height: `${(m.value / 500) * 100}%` }}
                          title={`${m.value}k`}
                        />
                        <span className="text-[10px] font-semibold text-ink-low">{m.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.admin.workflow}</h3>
                  <ul className="mt-5 space-y-4">
                    {projects
                      .filter((p) => p.stage !== "completed")
                      .map((p) => (
                        <li key={p.id} className="flex flex-wrap items-center gap-4">
                          <span className="w-52 shrink-0 truncate text-sm font-semibold">{p.name}</span>
                          <ProgressBar value={p.progress} className="!h-2 flex-1" />
                          <StatusBadge status={p.stage} label={t.status[p.stage]} />
                        </li>
                      ))}
                  </ul>
                </div>
              </>
            ) : module === "projects" ? (
              <div className="glass-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.admin.tabs.projects}</h3>
                  <label className="relative">
                    <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-ink-low start-3" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t.common.search}
                      className="field !w-56 !py-2 ps-9 text-sm"
                    />
                  </label>
                </div>
                <div className="mt-5">
                  <Table className="min-w-[720px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.admin.tabs.projects}</TableHead>
                        <TableHead>{t.common.client}</TableHead>
                        <TableHead>{t.common.status}</TableHead>
                        <TableHead>{t.common.progress}</TableHead>
                        <TableHead>{t.common.budget}</TableHead>
                        <TableHead>{t.common.deadline}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <span className="font-semibold">{p.name}</span>
                            <span className="ms-2 text-[10px] uppercase text-ink-low">{p.industry}</span>
                          </TableCell>
                          <TableCell className="text-ink-low">{getProfile(p.client_id)?.company}</TableCell>
                          <TableCell>
                            <StatusBadge status={p.stage} label={t.status[p.stage]} />
                          </TableCell>
                          <TableCell className="w-32">
                            <ProgressBar value={p.progress} className="!h-1.5" />
                          </TableCell>
                          <TableCell className="tabular-nums text-ink-low">{money(p.budget)}</TableCell>
                          <TableCell className="pe-0 tabular-nums text-ink-low">{p.deadline}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : module === "tasks" ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {columns.map((col) => (
                  <div key={col} className="surface p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-ink-low">{t.status[col]}</h3>
                      <span className="text-xs font-bold text-ink-low">
                        {tasks.filter((task) => task.status === col).length}
                      </span>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {tasks
                        .filter((task) => task.status === col)
                        .map((task) => {
                          const assignee = getProfile(task.assignee_id);
                          const project = projects.find((p) => p.id === task.project_id);
                          return (
                            <li
                              key={task.id}
                              className="rounded-xl border border-line p-3"
                            >
                              <p className="text-sm font-semibold leading-snug">{task.title}</p>
                              <p className="mt-1 text-[11px] text-ink-low">{project?.name}</p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-[11px] text-ink-low">
                                  <Avatar className="size-6">
                                    <AvatarFallback className="text-[10px]">
                                      {assignee?.full_name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {assignee?.full_name.split(" ")[0]}
                                </span>
                                <span
                                  className={clsx(
                                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                    task.priority === "critical"
                                      ? "bg-rose-500/15 text-rose-300"
                                      : task.priority === "high"
                                        ? "bg-amber-500/15 text-amber-300"
                                        : "bg-white/[0.06] text-ink-low",
                                  )}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : module === "team" ? (
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.admin.tabs.team}</h3>
                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                  {profiles
                    .filter((p) => userRoles.some((r) => r.user_id === p.id && r.role !== "client"))
                    .map((member) => {
                      const memberRole = getRole(member.id);
                      const load = tasks.filter((task) => task.assignee_id === member.id);
                      const hours = load.reduce((sum, task) => sum + task.hours, 0);
                      return (
                        <li key={member.id} className="rounded-xl border border-line p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-11">
                              <AvatarFallback className="text-sm">{member.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">{member.full_name}</p>
                              <p className="text-xs text-ink-low">{member.title}</p>
                            </div>
                            <span className="ms-auto chip !text-[10px]">{t.admin.roles[memberRole]}</span>
                          </div>
                          <div className="mt-4">
                            <div className="mb-1.5 flex justify-between text-[11px] text-ink-low">
                              <span>{load.length} tasks</span>
                              <span className="tabular-nums">{hours}h</span>
                            </div>
                            <ProgressBar value={Math.min(100, hours * 2)} className="!h-1.5" />
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ) : module === "cmsStats" ? (
              <CmsStats />
            ) : module === "cmsPortfolio" ? (
              <CmsPortfolio />
            ) : (
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.admin.directory}</h3>
                <ul className="mt-5 space-y-3">
                  {profiles
                    .filter((p) => getRole(p.id) === "client")
                    .map((clientProfile) => {
                      const owned = projects.filter((p) => p.client_id === clientProfile.id);
                      const value = owned.reduce((sum, p) => sum + p.budget, 0);
                      return (
                        <li
                          key={clientProfile.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line p-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-neon-cyan/10 text-neon-cyan">
                              <Building2 className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-sm font-bold">{clientProfile.company}</p>
                              <p className="text-xs text-ink-low">
                                {clientProfile.full_name} · {clientProfile.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-xs">
                            <span className="text-ink-low">
                              {owned.length} {t.admin.tabs.projects}
                            </span>
                            <span className="tabular font-bold text-neon-cyan">{money(value)}</span>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Gauge;
  tone: "emerald" | "brand" | "violet" | "rose";
}) {
  const tones = {
    emerald: "text-neon-emerald bg-neon-emerald/10",
    brand: "text-neon-cyan bg-neon-cyan/10",
    violet: "text-neon-purple bg-neon-purple/10",
    rose: "text-rose-300 bg-rose-500/10",
  } as const;

  return (
    <div className="glass-card p-5">
      <span className={clsx("grid h-10 w-10 place-items-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="tabular mt-4 text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-low">{label}</p>
    </div>
  );
}
