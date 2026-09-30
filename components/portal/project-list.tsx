import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowUpRight, FolderKanban } from "lucide-react";
import { getViewer } from "@/lib/db/access";
import { listViewerProjects } from "@/lib/db/queries";
import { lifecycleState } from "@/lib/db/project-lifecycle";
import { getProjectPayment } from "@/lib/db/payments";
import { getDictionary, isLocale } from "@/lib/i18n";
import { PortalNav } from "@/components/portal/portal-nav";
import { Button } from "@/components/ui/button";
export async function ProjectList({ locale, filter = "all" }: { locale: string; filter?: "all" | "active" | "completed" | "changes" }) {
 if (!isLocale(locale)) notFound();
 const viewer = await getViewer(); if (!viewer) redirect(`/${locale}/login`);
 const t = getDictionary(locale); const c = t.experience;
 const rows = await listViewerProjects();
 const items = await Promise.all(rows.map(async project => ({ project, state: await lifecycleState(project.id), payment: project.clientId === viewer.id ? await getProjectPayment(project.id, viewer.id) : null })));
 const visible = items.filter(({ project, state }) => filter === "all" || (filter === "completed" ? project.stage === "completed" && !state.cancelled : filter === "changes" ? project.stage === "planning" && !state.cancelled && !state.locked && project.clientId === viewer.id : project.stage !== "completed" && !state.cancelled));
 return <><div className="container-x pt-6 text-sm text-ink-low">{t.portal.welcome}, <span className="font-semibold" dir="auto">{viewer.name ?? viewer.email}</span></div><PortalNav locale={locale}/><section className="container-x py-9"><h1 className="text-2xl font-bold">{filter === "all" ? c.allProjects : c[filter]}</h1><p className="mt-3 text-sm leading-7 text-ink-low">{c.editPolicy}</p>
 <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map(({ project, state, payment }) => { const awaiting = project.clientId === viewer.id && payment?.status !== "paid"; return <article key={project.id} className="flex flex-col rounded-3xl border border-black/15 bg-white p-6"><div className="flex items-center justify-between gap-3"><FolderKanban className="size-7 text-neon-blue"/><span className={`rounded-full px-3 py-1 text-xs font-bold ${state.cancelled ? "bg-red-50 text-red-800" : awaiting ? "bg-amber-100 text-amber-900" : "bg-neon-cyan/30 text-black"}`}>{state.cancelled ? c.cancelled : awaiting ? (locale === "ar" ? "بانتظار الدفع" : "Awaiting payment") : t.status[project.stage]}</span></div><h2 className="mt-6 break-words text-xl font-bold" dir="auto">{project.name}</h2><p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-7 text-ink-low" dir="auto">{project.summary}</p><div role="progressbar" aria-label={t.status[project.stage]} aria-valuenow={awaiting ? 0 : project.progress} aria-valuemin={0} aria-valuemax={100} className="mt-6 h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full bg-neon-blue" style={{ width: `${awaiting ? 0 : project.progress}%` }}/></div><span className="mt-2 text-xs text-ink-low">{awaiting ? 0 : project.progress}%</span><div className="mt-auto flex flex-wrap gap-2 pt-6"><Button asChild variant="neon"><Link href={awaiting ? `/${locale}/portal/projects/${project.id}/payment` : `/${locale}/portal/projects/${project.id}`}>{awaiting ? (locale === "ar" ? "أكمل الدفع" : "Complete payment") : c.details}<ArrowUpRight className="size-4"/></Link></Button>{!state.cancelled && !state.locked && project.stage === "planning" && project.clientId === viewer.id && <Button asChild variant="outline"><Link href={`/${locale}/portal/projects/${project.id}#project-options`}>{c.edit}</Link></Button>}</div></article>; })}</div>
 {!visible.length && <div className="mt-8 rounded-2xl border border-dashed border-black/20 p-8"><p>{c.empty}</p><Button asChild variant="neon" className="mt-5"><Link href={`/${locale}/services#templates`}>{c.templates}</Link></Button></div>}</section></>;
}
