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
import { getProjectRequest } from "@/lib/db/project-requests";
import { ProjectRequestSummary } from "@/components/public/project-request-summary";
import { builderCopy } from "@/lib/i18n/project-builder";
import { billingState } from "@/lib/db/billing";
import { InstallmentSummary } from "@/components/portal/installment-summary";

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale) || !z.string().uuid().safeParse(id).success) notFound();
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/portal/projects/${id}`)}`);
  const detail = await getProjectDetail(id);
  if (!detail) notFound();
  const [state, payment, request] = await Promise.all([
    lifecycleState(id),
    detail.project.clientId === viewer.id ? getProjectPayment(id, viewer.id) : Promise.resolve(null),
    getProjectRequest(id),
  ]);
  const c = getDictionary(locale).experience;
  const pc = paymentCopy[locale];
  const billing = await billingState(detail.project);
  const editable = detail.project.clientId === viewer.id && detail.project.stage === "planning" && !state.locked && !state.cancelled && payment?.status !== "pending" && payment?.status !== "paid" && !billing?.paidCents;

  return (
    <>
      <PortalNav locale={locale} />
      <ProjectControls project={detail.project} cancelled={state.cancelled} editable={editable} />
      {request ? <section className="container-x request-builder mt-8 py-8"><h1 className="mb-6 text-3xl font-bold">{detail.project.name}</h1><ProjectRequestSummary configuration={request.configuration} quote={request.estimate} email={detail.project.clientId === viewer.id ? viewer.email : undefined} editHref={editable ? `/${locale}/portal/projects/${id}/edit` : undefined}/><p className="mt-5 text-sm leading-7">{state.cancelled ? c.cancelled : builderCopy.timing[locale]}</p>{!editable && !state.cancelled ? <p className="mt-4 text-sm leading-7">{builderCopy.blocked[locale]}</p> : null}</section> : null}
      {billing ? <InstallmentSummary locale={locale} billing={billing}/> : null}
      <ClientDashboard viewerName={viewer.name ?? viewer.email} viewerCompany={null} projects={[{ ...detail, summary: summariseProgress(detail), paymentStatus: billing?.paidCents ? "paid" : payment?.status ?? null, cancelled: state.cancelled }]} orders={[]} />
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
