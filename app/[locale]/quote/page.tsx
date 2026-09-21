import { QuoteWizard } from "@/components/public/quote-wizard";

export const metadata = { title: "Project estimator — Blue Sass" };

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return <QuoteWizard initialType={type} payments={{
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    mollie: Boolean(process.env.MOLLIE_API_KEY),
  }} />;
}
