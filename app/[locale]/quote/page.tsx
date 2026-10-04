import { QuoteWizard } from "@/components/public/quote-wizard";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/db/access";
import { SubscriptionRequest } from "@/components/public/subscription-request";
import { subscriptionIds, type SubscriptionId } from "@/lib/subscriptions";

export const metadata = { title: "Project details | Blue Sass" };

export default async function QuotePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string; service?: string; template?: string; kind?: string }> }) {
  const { locale } = await params;
  const { type, service, template, kind } = await searchParams;
  const viewer = await getViewer();
  const query = new URLSearchParams();
  if (type) query.set("type", type);
  if (service) query.set("service", service);
  if (template) query.set("template", template);
  if (kind) query.set("kind", kind);
  if (!viewer) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/quote?${query}`)}`);
  const plan = service?.replace(/^subscription-/, "") as SubscriptionId;
  if (service?.startsWith("subscription-") && subscriptionIds.includes(plan)) return <SubscriptionRequest id={plan}/>;
  return <QuoteWizard initialType={type} initialService={service} initialTemplate={template} initialKind={kind} initialEmail={viewer.email} payments={{
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
  }} />;
}
