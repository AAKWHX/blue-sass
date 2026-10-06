import Link from "next/link";
import { platformCopy } from "@/lib/i18n/platform-tools";
import type { Locale } from "@/lib/i18n/config";
import { paymentCopy } from "@/lib/i18n/payment-copy";
import { getProjectPayment } from "@/lib/db/payments";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ownToolOrder } from "@/lib/db/tool-subscriptions";
export async function ToolSubscriptionDetail({ locale, data, userId }: { locale: Locale; data: NonNullable<Awaited<ReturnType<typeof ownToolOrder>>>; userId: string }) {
  const c = platformCopy(locale); const pc = paymentCopy[locale]; const payment = await getProjectPayment(data.project.id, userId);
  const confirmed = payment?.status === "paid" && payment.environment === "live";
  const end = confirmed && payment.paidAt ? new Date(payment.paidAt.getTime() + data.order.snapshot.durationDays * 86_400_000) : null;
  const active = Boolean(end && end > new Date());
  return <div className="tool-surface py-12"><div className="container-x max-w-4xl"><h1 className="text-3xl font-bold">{data.project.name}</h1><Card className="tool-card mt-7"><CardHeader><CardTitle className="text-white">{c.currentPlan}</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-3xl font-semibold">€{data.order.snapshot.price} / {c.period}</p><p>{active ? c.enabled : confirmed ? c.disabled : pc.pending}</p>{end && <p className="text-sm text-white/65" dir="ltr">{payment?.paidAt?.toISOString().slice(0, 10)} → {end.toISOString().slice(0, 10)} UTC</p>}<ul className="space-y-3 text-sm leading-7">{c.toolFeatures.map(feature => <li key={feature}>{feature}</li>)}<li>{c.reportLimit.replace("{count}", String(data.order.snapshot.reports))}</li><li>{c.siteLimit.replace("{count}", String(data.order.snapshot.sites))}</li>{data.order.snapshot.compare && <li>{c.comparisonFeature}</li>}{data.order.snapshot.jsonExport && <li>{c.jsonFeature}</li>}</ul><p className="text-sm leading-8 text-white/65">{c.planNote}</p><p className="text-xs leading-7 text-white/55">{c.hostingNote}</p><div className="flex flex-wrap gap-3">{!confirmed && <Button asChild variant="neon"><Link href={`/${locale}/portal/projects/${data.project.id}/payment`}>{pc.pay}</Link></Button>}<Button asChild variant="outline"><Link href={`/${locale}/audit`}>{c.history}</Link></Button></div></CardContent></Card></div></div>;
}
