import { redirect } from "next/navigation";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { getViewer, hasCapability } from "@/lib/db/access";

export default async function AnnouncementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login`);
  if (!hasCapability(viewer, "announcements.send")) redirect(`/${locale}/portal`);
  return <main className="bg-base"><div className="container-x max-w-3xl py-16"><AnnouncementForm/></div></main>;
}
