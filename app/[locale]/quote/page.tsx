import { getPayPalClientConfig } from "@/lib/paypal";
import { publicFeatureFlags } from "@/lib/capabilities";
import { stripeClientAvailable } from "@/lib/stripe";
import { randomUUID } from "node:crypto";
import { QuoteWizard } from "@/components/public/quote-wizard";
import { notFound, redirect } from "next/navigation";
import { getViewer } from "@/lib/db/access";
import { isLocale } from "@/lib/i18n/config";

export const metadata = { robots: { index: false, follow: false }, title: "Project details | Blue Sass" };

export default async function QuotePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string; service?: string; kind?: string }> }) {
  const { locale } = await params;
  if (!publicFeatureFlags.projectWorkflows) notFound();
  if (!isLocale(locale)) notFound();
  const { type, service, kind, features, modules, languages } = await searchParams as {type?:string;service?:string;kind?:string;features?:string;modules?:string;languages?:string};
  if (service?.startsWith("subscription-")) notFound();
  const viewer = await getViewer();
  const query = new URLSearchParams();
  if (type) query.set("type", type);
  if (service) query.set("service", service);
  if (kind) query.set("kind", kind);
  if(features&&features.length<=300)query.set("features",features);if(modules&&modules.length<=300)query.set("modules",modules);if(languages)query.set("languages",languages);
  if (!viewer) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/quote?${query}`)}`);
  return <QuoteWizard requestId={randomUUID()} initialType={type} initialService={service} initialKind={kind} initialFeatures={features} initialModules={modules} initialLanguageCount={languages} initialEmail={viewer.email} payments={{
    stripe: stripeClientAvailable(),
    paypal: getPayPalClientConfig().configured,
  }} />;
}
