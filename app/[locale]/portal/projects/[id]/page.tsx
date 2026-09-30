import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getViewer } from "@/lib/db/access";
import { getProjectPayment } from "@/lib/db/payments";
import { getProjectDetail, summariseProgress } from "@/lib/db/queries";
import { lifecycleState } from "@/lib/db/project-lifecycle";
import { ClientDashboard } from "@/components/portal/client-dashboard";
import { ProjectControls } from "@/components/portal/project-controls";
import { PortalNav } from "@/components/portal/portal-nav";
import { Button } from "@/components/ui/button";
import { getDictionary, isLocale } from "@/lib/i18n";
import { paymentCopy } from "@/lib/i18n/payment-copy";

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale) || !z.string().uuid().safeParse(id).success) notFound();
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/portal/projects/${id}`)}`);
  const detail = await getProjectDetail(id);
  if (!detail) notFound();
  const [state, payment] = await Promise.all([
    lifecycleState(id),
    detail.project.clientId === viewer.id ? getProjectPayment(id, viewer.id) : Promise.resolve(null),
  ]);
  const c = getDictionary(locale).experience;
  const pc = paymentCopy[locale];

  return (
    <>
      <PortalNav locale={locale} />
      <ProjectControls project={detail.project} cancelled={state.cancelled} editable={detail.project.clientId === viewer.id && detail.project.stage === "planning" && !state.locked && !state.cancelled} />
      <ClientDashboard viewerName={viewer.name ?? viewer.email} viewerCompany={null} projects={[{ ...detail, summary: summariseProgress(detail), paymentStatus: payment?.status ?? null }]} orders={[]} />
      <section className="container-x pb-12">
        <div className="rounded-2xl border border-black/15 bg-neon-cyan/15 p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <h2 className="text-xl font-bold">{c.payment}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-low">{payment?.status === "paid" ? pc.success : c.paymentNote}</p>
              {payment ? <p className="mt-2 text-xs font-bold uppercase tracking-wider text-ink-low">{payment.status === "paid" ? pc.paid : payment.status === "pending" ? pc.pending : pc.failed}</p> : null}
            </div>
            {detail.project.clientId === viewer.id && !state.cancelled ? (
              <Button asChild variant="neon">
                <Link href={`/${locale}/portal/projects/${id}/payment`}>{payment?.status === "paid" ? pc.paid : payment?.status === "failed" ? pc.retry : pc.pay}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
