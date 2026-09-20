import { redirect } from "next/navigation";
import { AdminView } from "@/components/admin/admin-view";
import { LeadsPanel } from "@/components/admin/leads-panel";
import { isDatabaseConfigured } from "@/lib/db";
import { getViewer, isStaff } from "@/lib/db/access";
import { listLeads } from "@/lib/db/queries";

export const metadata = { title: "Operations & ERP — AAKWHX" };

/**
 * With a database connected the route is staff-only and shows the live sales
 * inbox above the ERP console. Without one it renders the demo ERP so the
 * preview stays complete.
 */
export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isDatabaseConfigured) return <AdminView />;

  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login`);
  if (!isStaff(viewer.role)) redirect(`/${locale}/portal`);

  const leads = await listLeads();

  return (
    <>
      <LeadsPanel leads={leads} locale={locale} />
      <AdminView />
    </>
  );
}
