import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getViewer } from "@/lib/db/access";
import { isLocale } from "@/lib/i18n/config";
import { ownedReport, ownedReports, toolEntitlement } from "@/lib/db/audits";
import { auditTargetKey } from "@/lib/audits/target-key";
import { AuditReportView } from "@/components/public/audit-report";
export const metadata = { title: "Blue Sass — Private review report", robots: { index: false, follow: false } };
export default async function ReportPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ compare?: string }> }) {
  const { locale, id } = await params; if (!isLocale(locale) || !z.string().uuid().safeParse(id).success) notFound();
  const viewer = await getViewer(); if (!viewer) redirect(`/${locale}/login`);
  const current = await ownedReport(id); if (!current?.report || current.status !== "completed") notFound();
  const entitlement = await toolEntitlement(viewer.id); const query = await searchParams;
  const key = auditTargetKey(current.source, current.target);
  const candidate = entitlement.compare && z.string().uuid().safeParse(query.compare).success ? await ownedReport(query.compare!) : null;
  const previous = candidate?.status === "completed" && candidate.report && auditTargetKey(candidate.source, candidate.target) === key && (current.source !== "url" || candidate.report.pageKey === current.report.pageKey) ? candidate.report : null;
  const history = entitlement.compare ? (await ownedReports()).reports.filter(row => row.id !== id && row.status === "completed" && auditTargetKey(row.source, row.target) === key).slice(0, 8).map(row => ({ id: row.id, createdAt: row.createdAt.toISOString() })) : [];
  return <div className="tool-surface audit-report py-12"><div className="container-x max-w-6xl"><AuditReportView id={id} report={current.report} canExport={entitlement.jsonExport} previous={previous} compareLinks={history} shareExpires={current.shareExpiresAt?.toISOString()??null}/></div></div>;
}
