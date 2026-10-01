import { redirect } from "next/navigation";
import { AdminView } from "@/components/admin/admin-view";
import { LeadsPanel } from "@/components/admin/leads-panel";
import { getViewer, isStaff, isReadOnlyAssistant } from "@/lib/db/access";
import { listLeads } from "@/lib/db/queries";
import { listViewerProjects } from "@/lib/db/queries";
import { ProjectStatusPanel } from "@/components/admin/project-status-panel";
import { PortfolioEditor } from "@/components/admin/portfolio-editor";
import { portfolioEntries } from "@/lib/db/portfolio";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  const canPublish = !isReadOnlyAssistant(viewer) && ["super_admin", "admin", "pm"].includes(viewer.role);
  const portfolio = canPublish ? await portfolioEntries(true) : [];

  return (
    <>
      <div className="container-x flex flex-wrap gap-3 pt-8">
        {canPublish && <Button asChild variant="outline"><Link href={`/${locale}/admin/reviews`}>مراجعة آراء العملاء</Link></Button>}
        {["super_admin", "admin"].includes(viewer.role) && <Button asChild variant="outline"><Link href={`/${locale}/admin/announcements`}>إرسال العروض والتحديثات</Link></Button>}
      </div>
      <LeadsPanel leads={leads} locale={locale} readOnly={isReadOnlyAssistant(viewer) || !["super_admin", "admin", "pm"].includes(viewer.role)} />
      {!isReadOnlyAssistant(viewer) && ["super_admin", "admin", "pm"].includes(viewer.role) && <ProjectStatusPanel projects={projects} locale={locale} />}
      {canPublish && <PortfolioEditor entries={portfolio}/>}
      {viewer.role === "super_admin" && !isReadOnlyAssistant(viewer) && <AdminView demoMode={false} />}
    </>
  );
}
