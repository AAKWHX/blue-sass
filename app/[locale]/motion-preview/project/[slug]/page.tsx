import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { motionPreviewCopy } from '@/lib/motion-preview';
import { PreviewLink } from '@/components/motion-preview/navigation';
import { PreviewMedia } from '@/components/motion-preview/media';
export default async function StudyPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale,slug } = await params; if (!isLocale(locale)) notFound();
  const c = motionPreviewCopy(locale); const index = c.studies.findIndex(study => study.slug === slug);if(index < 0) notFound(); const study = c.studies[index]; const next = c.studies[(index+1)%c.studies.length];
  return <article className="mp-detail" data-preview-page><div className="mp-detail-wrap"><p className="mp-lab-note">{c.lab}</p><PreviewLink href={`/${locale}/motion-preview`} className="mp-text-link">{c.back}</PreviewLink><h1 tabIndex={-1}>{study.name}</h1><p className="mp-detail-intro">{study.text}</p><div className="mp-detail-media"><PreviewMedia image={`/media/immersive-v2/${study.image}.webp`}/></div><div className="mp-detail-copy"><h2>{c.detail}</h2><div><p>{c.detailIntro}</p><ul>{c.detailPoints.map(point => <li key={point}>{point}</li>)}</ul></div></div><PreviewLink href={`/${locale}/motion-preview/project/${next.slug}`} className="mp-button">{c.next}: {next.name}</PreviewLink></div></article>;
}
