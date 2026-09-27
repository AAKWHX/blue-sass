import { FolderKanban } from "lucide-react";
import { setProjectStageAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { ProgressBar, StatusBadge } from "@/components/ui/primitives";
import { getDictionary, isLocale } from "@/lib/i18n";
import type { Project, ProjectStage } from "@/lib/db/schema";

const stages: ProjectStage[] = ["planning", "design", "development", "testing", "review", "completed"];
const copy = {
  ar: { title: "تحديث حالة مشاريع العملاء", empty: "لا توجد مشاريع عملاء بعد.", move: "نقل إلى" },
  en: { title: "Update client project status", empty: "No client projects yet.", move: "Move to" },
  nl: { title: "Status van klantprojecten", empty: "Nog geen klantprojecten.", move: "Verplaats naar" },
  de: { title: "Status der Kundenprojekte", empty: "Noch keine Kundenprojekte.", move: "Verschieben zu" },
  tr: { title: "Müşteri proje durumları", empty: "Henüz müşteri projesi yok.", move: "Taşı" },
  fr: { title: "Statut des projets clients", empty: "Aucun projet client.", move: "Passer à" },
  es: { title: "Estado de proyectos", empty: "Aún no hay proyectos.", move: "Mover a" },
} as const;

export function ProjectStatusPanel({ projects, locale }: { projects: Project[]; locale: string }) {
  if (!isLocale(locale)) return null;
  const c = copy[locale];
  const t = getDictionary(locale);
  return <section className="container-x pt-6"><div className="rounded-3xl border border-black bg-white p-6">
    <h2 className="flex items-center gap-2 text-lg font-bold text-black"><FolderKanban className="size-5 text-neon-blue"/>{c.title}</h2>
    {!projects.length ? <p className="mt-5 text-sm text-ink-low">{c.empty}</p> : <div className="mt-5 space-y-4">{projects.map(project => <article key={project.id} className="rounded-2xl border border-black/15 bg-base p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-black">{project.name}</h3><p className="mt-1 text-xs text-ink-low">{project.summary}</p></div><StatusBadge status={project.stage} label={t.status[project.stage]}/></div>
      <ProgressBar value={project.progress} className="mt-4"/>
      <form action={setProjectStageAction} className="mt-4 flex flex-wrap gap-2"><input type="hidden" name="projectId" value={project.id}/>{stages.map(stage => <Button key={stage} type="submit" name="stage" value={stage} variant="outline" size="sm" disabled={stage === project.stage} className={stage === project.stage ? "border-neon-blue bg-neon-cyan/25" : ""}>{c.move} {t.status[stage]}</Button>)}</form>
    </article>)}</div>}
  </div></section>;
}
