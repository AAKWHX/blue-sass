import { isLocale } from "@/lib/i18n/config";
import { z } from "zod";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { getViewer } from "@/lib/db/access";
import { getViewerLead } from "@/lib/db/queries";
import { formatEUR } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { PrintReceipt } from "@/components/portal/print-receipt";

export default async function OrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale) || !z.string().uuid().safeParse(id).success) notFound();
  const viewer = await getViewer(); if (!viewer) redirect(`/${locale}/login`);
  const order = await getViewerLead(id, viewer.email); if (!order) notFound();
  const c = {
    ar: { info: "معلومات المشروع", saved: "طلب محفوظ", details: "تفاصيل المشروع", empty: "لا توجد ملاحظات إضافية.", estimate: "التقدير الأولي", payment: "هذا ملخص طلب، وليس فاتورة أو إثبات دفع. راجع صفحة مشروعك للاطلاع على خطة الأقساط وحالة الدفع المسجلة.", back: "العودة إلى لوحة العميل" },
    en: { info: "Project information", saved: "Saved project request", details: "Project details", empty: "No additional notes.", estimate: "Initial estimate", payment: "This is a request summary, not an invoice or proof of payment. Open your project to view its installment plan and recorded payment status.", back: "Back to client portal" },
    nl: { info: "Projectinformatie", saved: "Opgeslagen projectaanvraag", details: "Projectdetails", empty: "Geen aanvullende opmerkingen.", estimate: "Eerste schatting", payment: "Dit is een samenvatting van uw aanvraag, geen factuur of betalingsbewijs. Open uw project voor het termijnschema en de opgeslagen betaalstatus.", back: "Terug naar het klantportaal" },
  }[locale];
  return <section className="container-x py-12 print:py-4"><div className="mx-auto max-w-3xl"><div className="flex flex-wrap items-start justify-between gap-5"><div><span className="mono-label">Blue Sass · {c.info}</span><h1 className="mt-3 text-3xl font-black">{order.projectType}</h1><p className="mt-2 text-ink-low">{c.saved} · {order.status}</p></div><PrintReceipt locale={locale}/></div><div className="mt-8 grid gap-5 sm:grid-cols-2"><article className="glass-card p-6"><FileText className="size-6 text-neon-cyan"/><h2 className="mt-5 font-bold">{c.details}</h2><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-low">{order.message || c.empty}</p></article><article className="glass-card p-6"><ShieldCheck className="size-6 text-neon-emerald"/><h2 className="mt-5 font-bold">{c.estimate}</h2><p className="mt-3 text-sm text-ink-low">{c.payment}</p><p className="mt-4 text-xl font-black">{formatEUR(order.budgetEstimate, locale)}</p></article></div><div className="mt-8 print:hidden"><Button asChild variant="neon"><Link href={`/${locale}/portal`}>{c.back}<ArrowRight className="size-4 flip-x"/></Link></Button></div></div></section>;
}
