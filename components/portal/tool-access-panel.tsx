import Link from "next/link";
import { getViewer } from "@/lib/db/access";
import { toolEntitlement } from "@/lib/db/audits";
import { platformCopy } from "@/lib/i18n/platform-tools";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { ownToolOrders } from "@/lib/db/tool-subscriptions";
export async function ToolAccessPanel({ locale }: { locale: Locale }) {
  const viewer = await getViewer(); if (!viewer) return null;
  const c = platformCopy(locale); const [access, orders] = await Promise.all([toolEntitlement(viewer.id), ownToolOrders()]);
  return <section className="container-x mt-7"><div className="tool-surface rounded-2xl border border-white/20 p-5"><div className="flex flex-wrap items-center justify-between gap-5"><div><h2 className="text-lg font-semibold">{c.audit}</h2><p className="mt-2 text-sm text-white/65">{c.available}: {access.reports} · {c.maxSites}: {access.sites}</p></div><Button asChild variant="neon"><Link href={`/${locale}/audit`}>{c.history}</Link></Button></div>{orders.length > 0 && <ul className="mt-6 grid gap-3 md:grid-cols-2">{orders.map(order => <li key={order.id} className="rounded-xl border border-white/20 p-4"><p className="text-sm font-semibold">{order.name}</p><p className="mt-2 text-xs text-white/60">€{order.price.price} · {c.period}</p><Button asChild variant="outline" size="sm" className="mt-3"><Link href={`/${locale}/portal/projects/${order.id}`}>{c.currentPlan}</Link></Button></li>)}</ul>}</div></section>;
}
