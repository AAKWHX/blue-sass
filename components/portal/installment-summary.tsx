import { getDictionary, type Locale } from "@/lib/i18n";
import { billingCopy } from "@/lib/i18n/billing-copy";
import { paymentCopy } from "@/lib/i18n/payment-copy";
import type { billingState } from "@/lib/db/billing";

export function InstallmentSummary({ locale, billing }: { locale: Locale; billing: NonNullable<Awaited<ReturnType<typeof billingState>>> }) {
  const t = getDictionary(locale);
  const money = (cents: number) => new Intl.NumberFormat(locale, { style:"currency", currency:"EUR" }).format(cents / 100);
  return <section className="container-x py-8"><div className="request-panel"><h2 className="text-2xl font-bold">{billingCopy.title[locale]}</h2>
    {!billing.plan.approvedTotalCents ? <p className="mt-4 leading-7">{billingCopy.approval[locale]}</p> : <><p className="mt-4 text-lg">{billingCopy.total[locale]}: {money(billing.plan.approvedTotalCents)}</p><ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{billing.installments.map(item => <li key={item.stage} className="rounded-2xl border border-white/20 p-4"><h3 className="font-semibold">{t.status[item.stage]} · {item.percent}%</h3><p className="mt-3 text-xl font-bold">{money(item.amountCents)}</p><p className="mt-3 text-sm text-white/65">{item.payment?.status === "paid" ? paymentCopy[locale].paid : item.stage === billing.next?.stage && billing.ready ? t.experience.payment : billingCopy.waiting[locale]}</p></li>)}</ol></>}
    <p className="mt-5 text-sm leading-7 text-white/65">{billingCopy.note[locale]}</p>
  </div></section>;
}
