import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { motionLabEntry } from '@/lib/motion-lab';
import { ProjectPresentation } from '@/components/public/project-presentation';
import { motionLabAllowed } from '@/lib/motion-lab-access';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blue Sass — Internal Transition Study', robots: { index: false, follow: false } };
export default async function MotionLabProject({ params }: { params: Promise<{ locale: string; id: string }> }) {
  if (!(await motionLabAllowed())) notFound();
  const { locale, id } = await params; if (!isLocale(locale) || id !== 'blue-sass-study') notFound();
  return <ProjectPresentation entry={motionLabEntry(locale)} locale={locale} lab/>;
}
