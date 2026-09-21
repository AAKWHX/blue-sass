import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { getViewer } from "@/lib/db/access";
import { PortalNav } from "@/components/portal/portal-nav";
import { Button } from "@/components/ui/button";

export default async function ChangeRequestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = await getViewer(); if (!viewer) redirect(`/${locale}/login`);
  const ar = locale === "ar";
  return <><PortalNav locale={locale}/><section className="container-x py-12"><div className="glass-card mx-auto max-w-2xl p-8"><SlidersHorizontal className="size-8 text-neon-cyan"/><h1 className="mt-5 text-3xl font-black">{ar ? "تعديل المشروع وخياراته" : "Project changes & options"}</h1><p className="mt-4 leading-relaxed text-ink-low">{ar ? "يمكنك إرسال طلب تعديل للتصميم أو المحتوى أو نطاق العمل من قسم الملاحظات داخل لوحة مشروعك. يبقى نطاق العمل المعتمد محفوظًا، ويظهر أي تغيير جديد للمراجعة قبل التنفيذ." : "Send changes to design, content or scope from the feedback area in your project workspace. Approved scope stays protected and every new change is reviewed before work begins."}</p><Button asChild variant="neon" className="mt-7"><Link href={`/${locale}/portal`}>{ar ? "فتح لوحة المشروع" : "Open project workspace"}<ArrowRight className="size-4 flip-x"/></Link></Button></div></section></>;
}
