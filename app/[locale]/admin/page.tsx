import { redirect } from "next/navigation";
import { AdminView } from "@/components/admin/admin-view";
import { LeadsPanel } from "@/components/admin/leads-panel";
import { getViewer, isStaff } from "@/lib/db/access";
import { listLeads } from "@/lib/db/queries";

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

  const leads = await listLeads();

  return (
    <>
      <LeadsPanel leads={leads} locale={locale} />
      <AdminView demoMode={false} />
    </>
  );
}
