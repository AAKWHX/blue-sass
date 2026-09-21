import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getViewer } from "@/lib/db/access";
import { listViewerProjects } from "@/lib/db/queries";
import { PortalNav } from "@/components/portal/portal-nav";

export default async function CompletedProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = await getViewer(); if (!viewer) redirect(`/${locale}/login`);
  const projects = (await listViewerProjects()).filter((project) => project.stage === "completed");
  const ar = locale === "ar";
  return <><PortalNav locale={locale}/><section className="container-x py-12"><h1 className="text-3xl font-black">{ar ? "المشاريع المكتملة" : "Completed projects"}</h1><div className="mt-8 grid gap-4 md:grid-cols-2">{projects.map((project) => <article key={project.id} className="glass-card p-6"><CheckCircle2 className="size-6 text-neon-emerald"/><h2 className="mt-5 text-xl font-bold">{project.name}</h2><p className="mt-2 text-sm text-ink-low">{project.summary}</p></article>)}</div>{!projects.length ? <p className="mt-10 text-ink-low">{ar ? "لا توجد مشاريع مكتملة بعد." : "There are no completed projects yet."}</p> : null}</section></>;
}
