import { redirect } from "next/navigation";
import { AdminView } from "@/components/admin/admin-view";
import { LeadsPanel } from "@/components/admin/leads-panel";
import { getViewer, isStaff, isReadOnlyAssistant } from "@/lib/db/access";
import { listLeads } from "@/lib/db/queries";
import { listViewerProjects } from "@/lib/db/queries";
import { ProjectStatusPanel } from "@/components/admin/project-status-panel";

export const metadata = { title: "Administration — Blue Sass" };

/**
 * This route is staff-only in every environment. A preview must never expose
 * an operations dashboard or even demo customer information to anonymous
 * visitors.
 */
export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login`);
  if (!isStaff(viewer.role)) redirect(`/${locale}/portal`);

  const [leads, projects] = await Promise.all([listLeads(), listViewerProjects()]);

  return (
    <>
      <LeadsPanel leads={leads} locale={locale} readOnly={isReadOnlyAssistant(viewer) || !["super_admin", "admin", "pm"].includes(viewer.role)} />
      {!isReadOnlyAssistant(viewer) && ["super_admin", "admin", "pm"].includes(viewer.role) && <ProjectStatusPanel projects={projects} locale={locale} />}
      {viewer.role === "super_admin" && !isReadOnlyAssistant(viewer) && <AdminView demoMode={false} />}
    </>
  );
}
