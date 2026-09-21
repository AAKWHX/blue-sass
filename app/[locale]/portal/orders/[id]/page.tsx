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
  const viewer = await getViewer(); if (!viewer) redirect(`/${locale}/login`);
  const order = await getViewerLead(id, viewer.email); if (!order) notFound();
  const ar = locale === "ar";
  return <section className="container-x py-12 print:py-4"><div className="mx-auto max-w-3xl"><div className="flex flex-wrap items-start justify-between gap-5"><div><span className="mono-label">Blue Sass · {ar ? "معلومات المشروع" : "Project information"}</span><h1 className="mt-3 text-3xl font-black">{order.projectType}</h1><p className="mt-2 text-ink-low">{ar ? "طلب محفوظ" : "Saved project request"} · {order.status}</p></div><PrintReceipt locale={locale}/></div><div className="mt-8 grid gap-5 sm:grid-cols-2"><article className="glass-card p-6"><FileText className="size-6 text-neon-cyan"/><h2 className="mt-5 font-bold">{ar ? "تفاصيل المشروع" : "Project details"}</h2><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-low">{order.message || (ar ? "لا توجد ملاحظات إضافية." : "No additional notes.")}</p></article><article className="glass-card p-6"><ShieldCheck className="size-6 text-neon-emerald"/><h2 className="mt-5 font-bold">{ar ? "الدفع" : "Payment"}</h2><p className="mt-3 text-sm text-ink-low">{ar ? "لم يتم تفعيل الدفع بعد. ستظهر الفاتورة وإيصال الدفع هنا فور إتمام عملية محمية عبر مزود الدفع." : "Payment is not enabled yet. A receipt and invoice appear here after a secure provider payment completes."}</p><p className="mt-4 text-xl font-black">{formatEUR(order.budgetEstimate, locale)}</p></article></div><div className="mt-8 print:hidden"><Button asChild variant="neon"><Link href={`/${locale}/portal`}>{ar ? "العودة إلى لوحة العميل" : "Back to client portal"}<ArrowRight className="size-4 flip-x"/></Link></Button></div></div></section>;
}
