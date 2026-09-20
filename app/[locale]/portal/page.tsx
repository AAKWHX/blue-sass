import { redirect } from "next/navigation";
import { ClientDashboard, type DashboardProject } from "@/components/portal/client-dashboard";
import { PortalView } from "@/components/portal/portal-view";
import { isDatabaseConfigured } from "@/lib/db";
import { getViewer } from "@/lib/db/access";
import { getProjectDetail, listViewerProjects, summariseProgress } from "@/lib/db/queries";

export const metadata = { title: "Client Portal — AAKWHX" };

/**
 * With a database connected this is the real, per-account dashboard.
 * Without one it falls back to the demo portal so the preview still works.
 */
export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isDatabaseConfigured) return <PortalView />;

  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login`);

  const rows = await listViewerProjects();
  const details = await Promise.all(rows.map((row) => getProjectDetail(row.id)));

  const projects: DashboardProject[] = details
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .map((detail) => ({ ...detail, summary: summariseProgress(detail) }));

  return (
    <ClientDashboard
      viewerName={viewer.name ?? viewer.email}
      viewerCompany={null}
      projects={projects}
    />
  );
}
