"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMotionPreview } from '@/hooks/use-motion-preview';
import { motionPreviewCopy } from '@/lib/motion-preview';
import type { ActiveLocale } from '@/lib/i18n/config';
import type { serviceCatalog } from '@/lib/service-catalog';
import { PreviewMedia } from './media';
import { PreviewLink } from './navigation';

export function MotionPreview({ locale, services }: { locale: ActiveLocale; services: ReturnType<typeof serviceCatalog> }) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [scene, setScene] = useState(0);
  const c = motionPreviewCopy(locale);
  const { jumpTo, jumpProject } = useMotionPreview(root, paused, locale === 'ar', setScene);
  return <div ref={root} data-motion-preview data-preview-page dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <nav className="mp-toolbar z-content" aria-label={c.lab}>
      <span className="mp-lab">{c.lab}</span>
      <div className="mp-chapters">{c.chapters.map((chapter, i) => <Button key={chapter} variant="unstyled" size="auto" aria-current={scene === i ? 'step' : undefined} onClick={() => jumpTo(i)}>{chapter}</Button>)}</div>
      <Button variant="unstyled" size="auto" className="mp-toggle" aria-label={paused ? c.resume : c.pause} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={18}/> : <Pause size={18}/>}</Button>
      <a className="mp-skip" href="#mp-after">{c.skip}</a>
      <div className="mp-progress" aria-hidden="true"><div className="mp-progress-fill"/></div>
    </nav>
    <div className="mp-story"><div className="mp-stage">
      <section className="mp-panel mp-hero" data-scene="0" aria-labelledby="mp-title">
        <div className="mp-hero-media"><PreviewMedia image="/media/higgsfield/hero-titanium-v1.webp" video="/media/higgsfield/hero-titanium-v1.webm" active={!paused && scene === 0} priority/></div>
        <div className="mp-hero-shade"/>
        <div className="mp-hero-copy"><span className="mp-wordmark" dir="ltr">Blue Sass</span><h1 id="mp-title" tabIndex={-1}>{c.title.map(line => <span key={line}>{line}</span>)}</h1><p>{c.intro}</p><Button variant="unstyled" size="auto" className="mp-button" onClick={() => jumpTo(1)}>{c.explore}</Button></div>
      </section>
      <section className="mp-panel mp-services" data-scene="1" aria-labelledby="mp-services-title">
        <div className="mp-light" aria-hidden="true"/>
        <div className="mp-service-heading"><h2 id="mp-services-title" tabIndex={-1}>{c.services}</h2><p>{c.serviceIntro}</p><Link className="mp-text-link" href={`/${locale}/services`}>{c.all}</Link></div>
        <div className="mp-deck">{services.map((service, i) => <article className="mp-service-card" data-service-card={i} key={service.slug}><span className="mp-card-number" aria-hidden="true">0{i + 1}</span><h3>{service.title}</h3><p>{service.description}</p><ul>{service.features.slice(0, 2).map(feature => <li key={feature}>{feature}</li>)}</ul><Link className="mp-text-link" href={`/${locale}/services/${service.slug}`}>{c.details}</Link></article>).reverse()}</div>
      </section>
      <section className="mp-panel mp-projects" data-scene="2" aria-labelledby="mp-projects-title">
        <div className="mp-project-heading"><h2 id="mp-projects-title" tabIndex={-1}>{c.projects}</h2><p>{c.studyNote}</p></div>
        <div className="mp-project-viewport"><div className="mp-project-track">{c.studies.map((study, i) => <article className="mp-project" data-study={i} key={study.slug}><div className="mp-project-media"><PreviewMedia image={`/media/immersive-v2/${study.image}.webp`}/></div><div className="mp-project-caption"><div><h3>{study.name}</h3><p>{study.text}</p></div><PreviewLink className="mp-text-link" href={`/${locale}/motion-preview/project/${study.slug}`}>{c.open}</PreviewLink></div></article>)}</div></div>
        <nav className="mp-study-selector" aria-label={c.projects}>{c.studies.map((study, i) => <Button key={study.slug} variant="unstyled" size="auto" onClick={() => jumpProject(i)} aria-label={study.name}>0{i + 1}</Button>)}</nav>
      </section>
      <section className="mp-panel mp-finale" data-scene="3" aria-labelledby="mp-finale-title"><Image src="/blue-sass-mark.svg" alt="Blue Sass" width={72} height={72}/><h2 id="mp-finale-title" tabIndex={-1}>{c.finale.map(line => <span key={line}>{line}</span>)}</h2><p>{c.finaleText}</p><PreviewLink className="mp-button" href={`/${locale}/motion-preview/project/${c.studies[0].slug}`}>{c.navigate}</PreviewLink></section>
    </div></div>
    <div id="mp-after" className="mp-after" tabIndex={-1}><p>{c.studyNote}</p><Link className="mp-text-link" href={`/${locale}/services`}>{c.all}</Link></div>
  </div>;
}
