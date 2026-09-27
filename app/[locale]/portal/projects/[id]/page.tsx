import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getViewer } from "@/lib/db/access";
import { getProjectDetail, summariseProgress } from "@/lib/db/queries";
import { lifecycleState } from "@/lib/db/project-lifecycle";
import { ClientDashboard } from "@/components/portal/client-dashboard";
import { ProjectControls } from "@/components/portal/project-controls";
import { PortalNav } from "@/components/portal/portal-nav";
import { getDictionary, isLocale } from "@/lib/i18n";
export default async function ProjectPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
 const { locale, id } = await params;
 if (!isLocale(locale) || !z.string().uuid().safeParse(id).success) notFound();
 const viewer = await getViewer(); if (!viewer) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/portal/projects/${id}`)}`);
 const detail = await getProjectDetail(id); if (!detail) notFound();
 const state = await lifecycleState(id); const c = getDictionary(locale).experience;
 return <><PortalNav locale={locale}/><ProjectControls project={detail.project} cancelled={state.cancelled} editable={detail.project.clientId === viewer.id && detail.project.stage === "planning" && !state.locked && !state.cancelled}/><ClientDashboard viewerName={viewer.name ?? viewer.email} viewerCompany={null} projects={[{ ...detail, summary: summariseProgress(detail) }]} orders={[]}/><section className="container-x pb-12"><div className="rounded-2xl border border-black/15 bg-neon-cyan/15 p-6"><h2 className="text-xl font-bold">{c.payment}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-ink-low">{c.paymentNote}</p></div></section></>;
}
