import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getViewer } from "@/lib/db/access";
import { getProjectDetail } from "@/lib/db/queries";
import { getProjectRequest } from "@/lib/db/project-requests";
import { getProjectPayment } from "@/lib/db/payments";
import { lifecycleState } from "@/lib/db/project-lifecycle";
import { canChangeRequest } from "@/lib/project-policy";
import { initialConfiguration, featureOptions } from "@/lib/project-options";
import type { ProjectType, FeatureKey } from "@/lib/pricing";
import { isLocale } from "@/lib/i18n";
import { ProjectBuilder } from "@/components/public/project-builder";
import { PortalNav } from "@/components/portal/portal-nav";

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ step?: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale) || !z.string().uuid().safeParse(id).success) notFound();
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/portal/projects/${id}/edit`)}`);
  const detail = await getProjectDetail(id);
  if (!detail || detail.project.clientId !== viewer.id) notFound();
  const [state, payment, request] = await Promise.all([lifecycleState(id), getProjectPayment(id, viewer.id), getProjectRequest(id)]);
  if (!canChangeRequest(detail.project, viewer.id, state) || payment?.status === "pending" || payment?.status === "paid") redirect(`/${locale}/portal/projects/${id}`);
  if (!(detail.project.industry in featureOptions)) redirect(`/${locale}/portal/projects/${id}`);
  const fallback = initialConfiguration(detail.project.industry as ProjectType);
  fallback.projectName = detail.project.name;
  fallback.name = viewer.name ?? "";
  fallback.languages = [locale];
  fallback.features = [...new Set([...fallback.features, ...detail.project.tech.filter(f => featureOptions[fallback.type].includes(f as FeatureKey)) as FeatureKey[]])];
  fallback.notes = detail.project.summary;
  const requestedStep = Number((await searchParams).step ?? 0);
  return <><PortalNav locale={locale}/><ProjectBuilder initial={request?.configuration ?? fallback} email={viewer.email} projectId={id} initialStep={Number.isInteger(requestedStep) ? requestedStep : 0}/></>;
}
