import { QuoteWizard } from "@/components/public/quote-wizard";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/db/access";

export const metadata = { title: "Project estimator — Blue Sass" };

export default async function QuotePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string; service?: string }> }) {
  const { locale } = await params;
  const { type, service } = await searchParams;
  const viewer = await getViewer();
  const query = new URLSearchParams();
  if (type) query.set("type", type);
  if (service) query.set("service", service);
  if (!viewer) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/quote?${query}`)}`);
  return <QuoteWizard initialType={type} initialService={service} initialEmail={viewer.email} payments={{
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    mollie: Boolean(process.env.MOLLIE_API_KEY),
  }} />;
}
