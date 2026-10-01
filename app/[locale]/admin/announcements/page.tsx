import { redirect } from "next/navigation";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { getViewer } from "@/lib/db/access";

export default async function AnnouncementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login`);
  if (!["super_admin", "admin"].includes(viewer.role)) redirect(`/${locale}/portal`);
  return <main className="bg-base"><div className="container-x max-w-3xl py-16"><AnnouncementForm/></div></main>;
}
