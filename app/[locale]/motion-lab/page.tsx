import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { motionLabEntry } from '@/lib/motion-lab';
import { CinematicPortfolio } from '@/components/public/cinematic-portfolio';
import { motionLabAllowed } from '@/lib/motion-lab-access';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blue Sass — Local Motion Lab', robots: { index: false, follow: false } };
export default async function MotionLab({ params }: { params: Promise<{ locale: string }> }) {
  if (!(await motionLabAllowed())) notFound();
  const { locale } = await params; if (!isLocale(locale)) notFound();
  return <CinematicPortfolio entries={[motionLabEntry(locale)]} locale={locale} standalone lab/>;
}
