import { redirect } from "next/navigation";
import { AdminView } from "@/components/admin/admin-view";
import { LeadsPanel } from "@/components/admin/leads-panel";
import { getViewer, canOpenAdmin, hasCapability } from "@/lib/db/access";
import { listLeads } from "@/lib/db/queries";
import { listViewerProjects } from "@/lib/db/queries";
import { ProjectStatusPanel } from "@/components/admin/project-status-panel";
import { PortfolioEditor } from "@/components/admin/portfolio-editor";
import { portfolioEntries } from "@/lib/db/portfolio";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toolOrderIds } from "@/lib/db/tool-subscriptions";
import { assignmentDirectory } from "@/lib/db/staff";
import { ProjectAssignmentForm } from "@/components/admin/staff-forms";
import { platformCopy } from "@/lib/i18n/platform-tools";
import { isLocale } from "@/lib/i18n/config";

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
  if (!canOpenAdmin(viewer)) redirect(`/${locale}/portal`);

  const [leads, projects] = await Promise.all([listLeads(), listViewerProjects()]);
  const toolIds = await toolOrderIds(projects.map(project => project.id));
  const assignment = hasCapability(viewer, "projects.assign") ? await assignmentDirectory() : null;
  const canPublish = hasCapability(viewer, "portfolio.manage");
  const portfolio = canPublish ? await portfolioEntries(true) : [];

  return (
    <>
      <div className="container-x flex flex-wrap gap-3 pt-8">
        {isLocale(locale) && <Button asChild variant="outline"><Link href={`/${locale}/portal`}>{platformCopy(locale).project}</Link></Button>}
        {viewer.isOwner && <Button asChild variant="neon"><Link href={`/${locale}/admin/team`}>إدارة الموظفين والصلاحيات</Link></Button>}
        {hasCapability(viewer, "reviews.manage") && <Button asChild variant="outline"><Link href={`/${locale}/admin/reviews`}>مراجعة آراء العملاء</Link></Button>}
        {hasCapability(viewer, "announcements.send") && <Button asChild variant="outline"><Link href={`/${locale}/admin/announcements`}>إرسال العروض والتحديثات</Link></Button>}
      </div>
      {assignment && <section className="container-x tool-surface rounded-2xl p-5"><ProjectAssignmentForm {...assignment}/></section>}
      {(hasCapability(viewer, "leads.read") || hasCapability(viewer, "leads.manage")) && <LeadsPanel leads={leads} locale={locale} readOnly={!hasCapability(viewer, "leads.manage")} />}
      {(hasCapability(viewer, "billing.approve") || hasCapability(viewer, "projects.stage")) && <ProjectStatusPanel projects={projects.filter(project => !toolIds.has(project.id))} locale={locale} canApprove={hasCapability(viewer, "billing.approve")} canStage={hasCapability(viewer, "projects.stage")} />}
      {canPublish && <PortfolioEditor entries={portfolio}/>}
      {hasCapability(viewer, "cms.manage") && <AdminView demoMode={false} />}
    </>
  );
}
