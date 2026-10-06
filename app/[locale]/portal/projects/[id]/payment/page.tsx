import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CircleCheck, CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PayPalCheckout } from "@/components/portal/paypal-checkout";
import { PortalNav } from "@/components/portal/portal-nav";
import { getViewer, hasCapability } from "@/lib/db/access";
import { PriceApprovalForm } from "@/components/admin/price-approval-form";
import { getProjectPayment, projectPaymentAmount } from "@/lib/db/payments";
import { getProjectDetail } from "@/lib/db/queries";
import { lifecycleState } from "@/lib/db/project-lifecycle";
import { isLocale } from "@/lib/i18n";
import { paymentCopy } from "@/lib/i18n/payment-copy";
import { paymentSafetyCopy } from "@/lib/i18n/payment-safety-copy";
import { getPayPalClientConfig } from "@/lib/paypal";
import { billingState } from "@/lib/db/billing";
import { InstallmentSummary } from "@/components/portal/installment-summary";
import { billingCopy } from "@/lib/i18n/billing-copy";
import { projectWorkspace } from "@/lib/db/project-workspace";
import { workspaceCopy } from "@/lib/i18n/workspace-copy";

function formatMoney(amountCents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amountCents / 100);
}

export default async function ProjectPaymentPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale) || !z.string().uuid().safeParse(id).success) notFound();
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/portal/projects/${id}/payment`)}`);

  const detail = await getProjectDetail(id);
  if (!detail || detail.project.clientId !== viewer.id) notFound();
  const [payment, lifecycle] = await Promise.all([getProjectPayment(id, viewer.id), lifecycleState(id)]);
  const config = getPayPalClientConfig();
  const copy = paymentCopy[locale];
  const safetyCopy = paymentSafetyCopy[locale];
  const billing = await billingState(detail.project);
  const workspace = await projectWorkspace(id);
  const scopeReady = !workspace.agreement || Boolean(workspace.agreement.acceptedAt && workspace.agreement.acceptedBy === viewer.id && workspace.agreement.priceCents === billing?.plan.approvedTotalCents);

  let payable: { amountCents: number; currency: string } | null = null;
  try {
    payable = billing ? billing.next && billing.ready && billing.plan.approvedTotalCents ? { amountCents: billing.next.amountCents, currency: "EUR" } : null : projectPaymentAmount(detail.project);
  } catch {
    payable = null;
  }
  const amountCents = payment?.amountCents ?? payable?.amountCents ?? 0;
  const currency = payment?.currency ?? payable?.currency ?? "EUR";
  const available = config.configured && payable && !lifecycle.cancelled && scopeReady;

  return (
    <>
      <PortalNav locale={locale} />
      <main className="payment-page container-x min-h-[70vh] py-10 sm:py-14">
        <Button asChild variant="ghostNeon" size="sm">
          <Link href={`/${locale}/portal/projects/${id}`}>{copy.back}</Link>
        </Button>

        <div className="mx-auto mt-8 max-w-5xl">
          {!scopeReady && <p className="mb-5 rounded-xl border border-white/25 p-4 text-sm leading-7">{workspaceCopy(locale).scopeRequired}</p>}
          {billing && !billing.plan.approvedTotalCents && hasCapability(viewer, "billing.approve") && <div className="tool-surface tool-card mb-6 rounded-2xl border border-white/20 p-5"><PriceApprovalForm projectId={id} locale={locale} amount={detail.project.budget} locked={lifecycle.cancelled || lifecycle.locked || detail.project.stage !== "planning"}/></div>}
          <div className="mb-8 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon-emerald/30 bg-neon-emerald/10 px-3 py-1 text-xs font-bold text-neon-emerald">
              <LockKeyhole className="size-3.5" />
              {copy.title}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-ink-high sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 leading-7 text-ink-low">{copy.subtitle}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <section className="rounded-3xl border border-line bg-surface/90 p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl border border-line bg-surface-2">
                  <CreditCard className="size-5 text-neon-cyan" />
                </div>
                <div>
                  <h2 className="font-black text-ink-high">{copy.paypal}</h2>
                  <p className="text-xs text-ink-low">{copy.method}</p>
                </div>
              </div>

              {config.environment === "sandbox" ? (
                <div className="mt-5 rounded-xl border border-neon-sky/25 bg-neon-sky/10 px-4 py-3 text-xs leading-6 text-ink-high"><p className="font-black">{copy.sandbox}</p><p className="mt-1 text-ink-low">{safetyCopy.sandboxDetail}</p></div>
              ) : null}

              <div className="mt-6">
                {payment?.status === "paid" ? (
                  <div className="flex items-start gap-3 rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 p-4 text-neon-emerald">
                    <CircleCheck className="mt-0.5 size-5 shrink-0" />
                    <div><p className="font-black">{copy.paid}</p><p className="mt-1 text-sm">{copy.success}</p></div>
                  </div>
                ) : available ? (
                  <PayPalCheckout
                    projectId={id}
                    clientId={config.clientId}
                    currency={currency}
                    copy={copy}
                    initialStatus={payment?.status ?? "idle"}
                  />
                ) : (
                  <div className="rounded-xl border border-white/25 bg-white/5 p-4 text-sm leading-7 text-white"><p>{billing && !billing.plan.approvedTotalCents ? billingCopy.approval[locale] : !scopeReady ? workspaceCopy(locale).scopeRequired : billing && !billing.ready ? billingCopy.waiting[locale] : copy.unavailable}</p><Button asChild variant="outline" className="mt-4 w-full"><Link href={`/${locale}/portal/projects/${id}`}>{copy.back}</Link></Button></div>
                )}
              </div>
            </section>

            <aside className="rounded-3xl border border-line bg-surface-2/80 p-6 sm:p-8">
              <h2 className="text-lg font-black text-ink-high">{copy.summary}</h2>
              <dl className="mt-6 space-y-5 text-sm">
                <div className="border-b border-line pb-5">
                  <dt className="text-ink-low">{copy.project}</dt>
                  <dd className="mt-1 font-bold text-ink-high">{detail.project.name}</dd>
                </div>
                <div className="border-b border-line pb-5">
                  <dt className="text-ink-low">{copy.method}</dt>
                  <dd className="mt-1 font-bold text-ink-high">{safetyCopy.cards}</dd>
                </div>
                <div>
                  <dt className="text-ink-low">{copy.amount}</dt>
                  <dd className="mt-2 text-3xl font-black tabular-nums text-ink-high">{formatMoney(amountCents, currency, locale)}</dd>
                </div>
              </dl>
              <div className="mt-8 flex items-start gap-2 border-t border-line pt-5 text-xs leading-5 text-ink-low">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-neon-emerald" />
                <span>{copy.secure}</span>
              </div>
            </aside>
          </div>
        </div>
      </main>
      {billing ? <InstallmentSummary locale={locale} billing={billing}/> : null}
    </>
  );
}
