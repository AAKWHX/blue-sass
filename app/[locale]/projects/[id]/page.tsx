import { notFound } from 'next/navigation';
import { portfolioEntries } from '@/lib/db/portfolio';
import { isLocale } from '@/lib/i18n/config';
import { ProjectPresentation } from '@/components/public/project-presentation';
import type { Metadata } from 'next';
import { cache } from 'react';

type Props = { params: Promise<{ locale: string; id: string }> };
const publicEntry = cache(async (id: string) => (await portfolioEntries()).find(item => item.id === id));
// Use the same public-only projection as the existing portfolio. Private IDs never resolve here.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  if (!isLocale(locale)) return {};
  const entry = await publicEntry(id);
  if (!entry) return { robots: { index: false, follow: false } };
  return { title: entry.name, description: entry.summary, alternates: { canonical: `/${locale}/projects/${encodeURIComponent(id)}` } };
}
export default async function ProjectPage({ params }: Props) {
  const { locale, id } = await params; if (!isLocale(locale)) notFound();
  const entry = await publicEntry(id);
  if (!entry) notFound();
  return <ProjectPresentation entry={entry} locale={locale}/>;
}
