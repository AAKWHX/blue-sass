import { withExtraLocales } from "@/lib/i18n/extra-locales";
import { lifecycleState } from "@/lib/db/project-lifecycle";
import { FolderKanban } from "lucide-react";
import { setProjectStageAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { ProgressBar, StatusBadge } from "@/components/ui/primitives";
import { getDictionary, isLocale } from "@/lib/i18n";
import type { Project, ProjectStage } from "@/lib/db/schema";
import { billingState } from "@/lib/db/billing";
import { Input } from "@/components/ui/input";
import { PriceApprovalForm } from "@/components/admin/price-approval-form";

const stages: ProjectStage[] = ["planning", "design", "development", "testing", "review", "completed"];
const copy = withExtraLocales({
  ar: { title: "تحديث حالة مشاريع العملاء", empty: "لا توجد مشاريع عملاء بعد.", move: "نقل إلى" },
  en: { title: "Update client project status", empty: "No client projects yet.", move: "Move to" },
  nl: { title: "Status van klantprojecten", empty: "Nog geen klantprojecten.", move: "Verplaats naar" },
  de: { title: "Status der Kundenprojekte", empty: "Noch keine Kundenprojekte.", move: "Verschieben zu" },
  tr: { title: "Müşteri proje durumları", empty: "Henüz müşteri projesi yok.", move: "Taşı" },
  fr: { title: "Statut des projets clients", empty: "Aucun projet client.", move: "Passer à" },
  es: { title: "Estado de proyectos", empty: "Aún no hay proyectos.", move: "Mover a" },
} as const);

export async function ProjectStatusPanel({ projects, locale, canApprove = false, canStage = false }: { projects: Project[]; locale: string; canApprove?: boolean; canStage?: boolean }) {
  if (!isLocale(locale)) return null;
  const c = copy[locale];
  const t = getDictionary(locale);
  const states = new Map(await Promise.all(projects.map(async project => [project.id, await lifecycleState(project.id)] as const)));
  const bills = new Map(await Promise.all(projects.map(async project => [project.id, await billingState(project)] as const)));
  return <section className="tool-surface container-x pt-6"><div className="tool-card rounded-3xl border p-6">
    <h2 className="flex items-center gap-2 text-lg font-bold text-white"><FolderKanban className="size-5"/>{c.title}</h2>
    {!projects.length ? <p className="mt-5 text-sm text-ink-low">{c.empty}</p> : <div className="mt-5 space-y-4">{projects.map(project => <article key={project.id} className="rounded-2xl border border-black/15 bg-base p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-white">{project.name}</h3><p className="mt-1 text-sm leading-7 text-white/70">{project.summary}</p></div><StatusBadge status={project.stage} label={states.get(project.id)?.cancelled ? t.experience.cancelled : t.status[project.stage]}/></div>
      <ProgressBar value={project.progress} className="mt-4"/>
      {canApprove && bills.get(project.id) && !states.get(project.id)?.cancelled ? <PriceApprovalForm projectId={project.id} locale={locale} approved={Boolean(bills.get(project.id)?.plan.approvedTotalCents)} amount={(bills.get(project.id)?.plan.approvedTotalCents ?? project.budget * 100) / 100} locked={!!bills.get(project.id)?.paidCents || project.stage !== "planning" || !!states.get(project.id)?.locked}/> : null}
      {canStage && <form action={setProjectStageAction} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"><Input type="hidden" name="projectId" value={project.id}/>{stages.map(stage => <Button key={stage} type="submit" name="stage" value={stage} variant="outline" size="sm" disabled={stage === project.stage || states.get(project.id)?.cancelled} className={stage === project.stage ? "border-neon-blue bg-neon-cyan/25" : ""}>{c.move} {t.status[stage]}</Button>)}</form>}
    </article>)}</div>}
  </div></section>;
}
