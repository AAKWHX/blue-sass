"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cinemaCopy } from '@/lib/i18n/cinema';
import type { Locale } from '@/lib/i18n/config';
import type { PortfolioEntry } from '@/lib/db/portfolio';
import { safePortfolioUrl } from '@/lib/portfolio-presentation';
import { ImmersiveMedia } from './immersive-media';
import './cinematic-home.css';
import './immersive-v2.css';

export function projectTransitionName(id: string) { return `project-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`; }

export function ProjectCover({ src, name, id, priority = false }: { src: string | null; name: string; id: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className="cinema-project-cover" style={{ viewTransitionName: projectTransitionName(id) }}>
    {src && (safePortfolioUrl(src) || /^\/media\/[a-zA-Z0-9._-]+\.(webp|png|jpg)$/.test(src)) && !failed ? <Image src={src} alt={name} fill unoptimized sizes="(max-width: 767px) 90vw, 70vw" preload={priority} className="object-cover" onError={() => setFailed(true)}/> : <span className="cinema-project-fallback">{name}</span>}
  </div>;
}

export function CinematicPortfolio({ entries, locale, standalone = false, lab = false, paused = false }: { entries: PortfolioEntry[]; locale: Locale; standalone?: boolean; lab?: boolean; paused?: boolean }) {
  const c = cinemaCopy(locale); const Heading = standalone ? 'h1' : 'h2';
  return <section id="portfolio" className={`cinema-work cinema-section ${standalone ? 'cinema-work-standalone' : ''}`} aria-labelledby="cinema-work-heading">
    <div className="cinema-wrap">
      
      <div className="cinema-section-heading"><Heading id="cinema-work-heading" className="cinema-split-heading">{c.work}</Heading><p>{c.workIntro}</p></div>
      {lab && <p className="cinema-lab-label">{c.demo}</p>}
      {entries.length ? <div className="bs-track-viewport"><div className="cinema-project-track" data-cinematic-track tabIndex={0} role="region" aria-label={c.projects}>
        {entries.map((entry, index) => <article key={entry.id} className="cinema-project-card">
          {/* Native document navigation enables shared-image transitions and browser Back without intercepting history. */}
          <a href={`/${locale}/${lab ? 'motion-lab' : 'projects'}/${encodeURIComponent(entry.id)}`} className="cinema-project-link">
            <ProjectCover src={entry.cover} name={entry.name} id={entry.id} priority={standalone && index === 0}/>
            <div className="cinema-project-caption"><span><small>{entry.industry}</small><h3>{entry.name}</h3></span><span className="cinema-project-open">{c.open}<ArrowUpRight aria-hidden size={23}/></span></div>
            <p>{entry.summary}</p>
          </a>
        </article>)}
      </div></div> : <div className="cinema-work-empty">
        <figure className="cinema-work-window"><div className="immersive-work-scene"><ImmersiveMedia poster="/media/immersive-v2/web-showcase.webp" video={standalone ? undefined : "/media/immersive-v2/web-showcase.webm"} paused={paused}/></div><figcaption>{c.illustration}</figcaption></figure>
        <div className="cinema-work-empty-copy"><h3>{c.empty}</h3><p>{c.emptyText}</p><Button asChild variant="unstyled" size="auto" className="cinema-link"><Link href={`/${locale}/services`}>{c.all}<ArrowUpRight aria-hidden size={20}/></Link></Button></div>
      </div>}
      {!standalone && entries.length > 0 && <Button asChild variant="unstyled" size="auto" className="cinema-link"><Link href={`/${locale}/projects`}>{c.projects}<ArrowUpRight aria-hidden size={20}/></Link></Button>}
    </div>
  </section>;
}

