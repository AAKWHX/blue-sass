import { publicPageMetadata } from "@/lib/i18n/seo";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return publicPageMetadata((await params).locale, "projects", "/projects"); }
import { CinematicPortfolio } from "@/components/public/cinematic-portfolio";
import { portfolioEntries } from "@/lib/db/portfolio";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

/** A dedicated route makes the showcase easy to find without duplicating it. */
export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const entries = await portfolioEntries();
  return <CinematicPortfolio entries={entries} locale={locale} standalone/>;
}
