import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getViewer } from "@/lib/db/access";
import { StaffInvitationAccept } from "@/components/admin/staff-forms";
export const metadata = { title: "Blue Sass — Staff invitation", robots: { index: false, follow: false } };
export default async function StaffInvitePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const viewer = await getViewer();
  return <div className="tool-surface py-16"><div className="container-x max-w-2xl"><StaffInvitationAccept signedIn={Boolean(viewer)}/></div></div>;
}
