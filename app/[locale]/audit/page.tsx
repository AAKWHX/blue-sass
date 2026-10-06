import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { platformCopy } from "@/lib/i18n/platform-tools";
import { getViewer } from "@/lib/db/access";
import { ownedReports, toolEntitlement } from "@/lib/db/audits";
import { AuditDashboard } from "@/components/public/audit-dashboard";
export const metadata = { title: "Blue Sass — Website and source review", robots: { index: false, follow: true } };
export default async function AuditPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ mode?: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const viewer = await getViewer(); const c = platformCopy(locale);
  const data = viewer ? await ownedReports() : { reports: [], entitlement: await toolEntitlement("") };
  const search = await searchParams;
  return <div className="tool-surface py-12 sm:py-16"><div className="container-x max-w-6xl"><h1 className="mb-4 text-3xl font-bold leading-tight sm:text-5xl">{c.audit}</h1><p className="mb-9 max-w-3xl text-base leading-8 text-white/65">{c.auditIntro}</p><AuditDashboard signedIn={Boolean(viewer)} initialSource={search.mode === "files" ? "files" : "url"} reports={data.reports.map(row => ({ ...row, createdAt: row.createdAt.toISOString() }))} entitlement={{ ...data.entitlement, startsAt: data.entitlement.startsAt.toISOString(), endsAt: data.entitlement.endsAt.toISOString() }}/></div></div>;
}
