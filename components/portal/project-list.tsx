import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowUpRight, FolderKanban } from "lucide-react";
import { getViewer } from "@/lib/db/access";
import { listViewerProjects } from "@/lib/db/queries";
import { projectListSnapshots } from "@/lib/db/project-list-snapshots";
import { getDictionary, isLocale } from "@/lib/i18n";
import { PortalNav } from "@/components/portal/portal-nav";
import { Button } from "@/components/ui/button";
import { builderCopy } from "@/lib/i18n/project-builder";
import { toolOrderIds } from "@/lib/db/tool-subscriptions";
import { ToolAccessPanel } from "@/components/portal/tool-access-panel";
export async function ProjectList({ locale, filter = "all" }: { locale: string; filter?: "all" | "active" | "completed" | "changes" }) {
 if (!isLocale(locale)) notFound();
 const viewer = await getViewer(); if (!viewer) redirect(`/${locale}/login`);
 const t = getDictionary(locale); const c = t.experience;
 const allRows = await listViewerProjects(); const toolIds = await toolOrderIds(allRows.map(project => project.id));
 const rows = allRows.filter(project => !toolIds.has(project.id) && project.industry !== "commerce");
 const snapshots=await projectListSnapshots(rows,viewer.id);
 const items = rows.map(project=>({project,...snapshots.get(project.id)!}));
 const visible = items.filter(({ project, state }) => filter === "all" || (filter === "completed" ? project.stage === "completed" && !state.cancelled : filter === "changes" ? project.stage === "planning" && !state.cancelled && !state.locked && project.clientId === viewer.id : project.stage !== "completed" && !state.cancelled));
 return <><div className="container-x pt-6 text-sm text-ink-low">{t.portal.welcome}, <span className="font-semibold" dir="auto">{viewer.name ?? viewer.email}</span></div><PortalNav locale={locale}/><ToolAccessPanel locale={locale}/><section className="container-x py-9"><h1 className="text-2xl font-bold">{filter === "all" ? c.allProjects : c[filter]}</h1><p className="mt-3 text-sm leading-7 text-ink-low">{c.editPolicy}</p>
 <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map(({ project, state, payment }) => { const awaiting = project.clientId === viewer.id && payment?.status !== "paid"; return <article key={project.id} className="request-panel flex flex-col"><div className="flex items-center justify-between gap-3"><FolderKanban className="size-7"/><span className="text-xs font-semibold">{state.cancelled ? c.cancelled : awaiting ? builderCopy.saveLater[locale] : t.status[project.stage]}</span></div><h2 className="mt-6 break-words text-xl font-bold" dir="auto">{project.name}</h2><p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-7 text-white/65" dir="auto">{project.summary}</p><p className="mt-5 text-lg font-semibold tabular-nums">{new Intl.NumberFormat(locale, { style: "currency", currency: project.currency }).format(project.budget)}</p><div role="progressbar" aria-label={t.status[project.stage]} aria-valuenow={awaiting ? 0 : project.progress} aria-valuemin={0} aria-valuemax={100} className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-white" style={{ width: `${awaiting ? 0 : project.progress}%` }}/></div><span className="mt-2 text-xs text-white/65">{awaiting ? 0 : project.progress}%</span><div className="mt-auto flex flex-wrap gap-2 pt-6"><Button asChild variant="neon"><Link href={`/${locale}/portal/projects/${project.id}`}>{c.details}<ArrowUpRight className="size-4"/></Link></Button>{awaiting && !state.cancelled ? <Button asChild variant="outline"><Link href={`/${locale}/portal/projects/${project.id}/payment`}>{c.payment}</Link></Button> : null}{!state.cancelled && !state.locked && project.stage === "planning" && project.clientId === viewer.id && payment?.status !== "pending" && payment?.status !== "paid" ? <Button asChild variant="outline"><Link href={`/${locale}/portal/projects/${project.id}/edit`}>{c.edit}</Link></Button> : null}</div></article>; })}</div>
 {!visible.length && <div className="mt-8 rounded-2xl border border-dashed border-black/20 p-8"><p>{c.empty}</p><Button asChild variant="neon" className="mt-5"><Link href={`/${locale}/services#templates`}>{c.templates}</Link></Button></div>}</section></>;
}
