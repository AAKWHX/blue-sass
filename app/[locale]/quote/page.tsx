import { QuoteWizard } from "@/components/public/quote-wizard";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/db/access";

export const metadata = { title: "Project estimator — Blue Sass" };

export default async function QuotePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string }> }) {
  const { locale } = await params;
  const { type } = await searchParams;
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login?next=/${locale}/quote${type ? `?type=${encodeURIComponent(type)}` : ""}`);
  return <QuoteWizard initialType={type} initialEmail={viewer.email} payments={{
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    mollie: Boolean(process.env.MOLLIE_API_KEY),
  }} />;
}
