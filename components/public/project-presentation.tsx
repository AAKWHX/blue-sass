import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { PortfolioEntry } from '@/lib/db/portfolio';
import type { Locale } from '@/lib/i18n/config';
import { cinemaCopy } from '@/lib/i18n/cinema';
import { redesignCopy } from '@/lib/i18n/redesign';
import { portfolioStatus, safePortfolioUrl } from '@/lib/portfolio-presentation';
import { Button } from '@/components/ui/button';
import { ProjectCover } from './cinematic-portfolio';

export function ProjectPresentation({ entry, locale, lab = false }: { entry: PortfolioEntry; locale: Locale; lab?: boolean }) {
  const c = cinemaCopy(locale); const labels = redesignCopy(locale);
  return <article className="cinema-project-page"><div className="cinema-wrap">
    <a href={`/${locale}/${lab ? 'motion-lab' : 'projects'}`} className="cinema-link">← {c.back}</a>
    {lab && <p className="cinema-lab-label">{c.demo}</p>}
    <h1>{entry.name}</h1>
    <ProjectCover src={entry.cover} name={entry.name} id={entry.id} priority/>
    <div className="cinema-project-body"><div><p>{entry.summary}</p><div className="cinema-actions">{safePortfolioUrl(entry.liveUrl) && <Button asChild variant="unstyled" size="auto" className="cinema-cta"><a href={entry.liveUrl} target="_blank" rel="noopener noreferrer">{c.visit}<ArrowUpRight aria-hidden size={20}/></a></Button>}{safePortfolioUrl(entry.url) && <Button asChild variant="unstyled" size="auto" className="cinema-link"><a href={entry.url} target="_blank" rel="noopener noreferrer">{c.preview}<ArrowUpRight aria-hidden size={20}/></a></Button>}</div></div>
      <div><p>{entry.industry}</p>{!lab && <><p>{labels[portfolioStatus(entry.stage, entry.liveUrl)]} · {entry.progress}%</p><p>{c.updated}: <time dateTime={new Date(entry.updatedAt).toISOString()}>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', calendar: 'gregory' }).format(new Date(entry.updatedAt))}</time></p></>}<h2>{c.features}</h2><ul>{entry.features.map((feature,index) => <li key={index}>{feature}</li>)}</ul></div></div>
    {entry.images.length > 0 && <div className="cinema-project-gallery">{entry.images.map((src,index) => <ProjectCover key={src+index} src={src} name={`${entry.name} / ${index+1}`} id={`${entry.id}-gallery-${index}`}/>)}</div>}
    <Button asChild variant="unstyled" size="auto" className="cinema-link"><Link href={`/${locale}/create-project`}>{c.start}<ArrowUpRight aria-hidden size={20}/></Link></Button>
  </div></article>;
}
