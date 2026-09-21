import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FolderKanban } from "lucide-react";
import { getViewer } from "@/lib/db/access";
import { listViewerProjects } from "@/lib/db/queries";
import { PortalNav } from "@/components/portal/portal-nav";

export default async function ActiveProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = await getViewer(); if (!viewer) redirect(`/${locale}/login`);
  const projects = (await listViewerProjects()).filter((project) => project.stage !== "completed");
  const ar = locale === "ar";
  return <><PortalNav locale={locale}/><section className="container-x py-12"><h1 className="text-3xl font-black">{ar ? "المشاريع قيد التنفيذ" : "Active projects"}</h1><p className="mt-3 text-ink-low">{ar ? "تابع مراحل مشروعك وملفاته وملاحظاتك من لوحة المشروع." : "Follow project stages, files and feedback from your workspace."}</p><div className="mt-8 grid gap-4 md:grid-cols-2">{projects.map((project) => <article key={project.id} className="glass-card p-6"><FolderKanban className="size-6 text-neon-cyan"/><h2 className="mt-5 text-xl font-bold">{project.name}</h2><p className="mt-2 text-sm text-ink-low">{project.summary}</p><Link href={`/${locale}/portal`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-neon-cyan">{ar ? "فتح لوحة المشروع" : "Open project workspace"}<ArrowRight className="size-4 flip-x"/></Link></article>)}</div>{!projects.length ? <p className="mt-10 text-ink-low">{ar ? "لا يوجد مشروع قيد التنفيذ حاليًا." : "No project is currently in progress."}</p> : null}</section></>;
}
