"use client";

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Pause, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCinematicMotion } from '@/hooks/use-cinematic-motion';
import { useMotionActive } from '@/hooks/use-motion-active';
import { cinemaCopy } from '@/lib/i18n/cinema';
import { homePlatformCopy } from '@/lib/i18n/home-platform';
import { workflowVideo } from '@/lib/immersive-assets';
import type { ActiveLocale } from '@/lib/i18n/config';
import type { PortfolioEntry } from '@/lib/db/portfolio';
import { CinematicPortfolio } from './cinematic-portfolio';
import { ImmersiveMedia } from './immersive-media';
import { HeroIntro, ProductShowcase, ToolSketch, PeopleIcon } from './immersive-showcase';
import './cinematic-home.css';
import './immersive-v2.css';
import './format-hero.css';
import './scroll-scenes.css';
import { ServiceScenes } from './service-scenes';
import { HomePointerEffects } from './home-pointer-effects';
import { text } from '@/lib/discovery/types';
import {toolCatalog} from '@/lib/tools/catalog';
import {DiscoveryOrbit} from './discovery-orbit';
import './home-refinements.css';

type Service = { slug: string; title: string; description: string; features: string[] };
const toolPaths = ['qr-code-generator', 'invoice-generator', 'seo-checker', 'message-checker'];

function Ambient({ kind = 'light' }: { kind?: string }) {
  const ref = useRef<HTMLDivElement>(null); const active = useMotionActive(ref);
  return <div ref={ref} className={`cinema-ambient cinema-ambient-${kind} pointer-events-none z-backdrop`} aria-hidden="true" data-active={active}>{kind === 'violet' && <Image className="cinema-ambient-image" src="/media/higgsfield/architecture-violet-v1.webp" alt="" fill sizes="100vw" quality={75}/>}<i/><i/><i/></div>;
}

export function CinematicHome({ locale, services, entries, children }: { locale: ActiveLocale; services: Service[]; entries: PortfolioEntry[]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null); const [paused, setPaused] = useState(false);
  useCinematicMotion(ref, paused);
  const c = cinemaCopy(locale); const platform = homePlatformCopy(locale);
  return <div ref={ref} className="cinema-home" data-paused={paused}>
    <HomePointerEffects scope={ref} paused={paused}/>
    <a href="#studio-services" className="cinema-skip">{c.skip}</a>
    <section className="cinema-opening" aria-labelledby="cinema-title">
      <div className="cinema-hero"><HeroIntro locale={locale} paused={paused}><div className="cinema-wrap"><div className="cinema-hero-copy">
            <h1 id="cinema-title">{c.title.map((line,index) => <span key={line} className={`cinema-title-line cinema-title-line-${index}`}><span>{line}</span></span>)}</h1>
            <p className="cinema-intro">{c.intro}</p>
            <div className="cinema-actions"><Button asChild variant="unstyled" size="auto" className="cinema-cta"><Link href={`/${locale}/create-project`}>{c.start}</Link></Button><a href="#studio-services" className="cinema-link">{c.explore}<ArrowDown aria-hidden size={18}/></a></div>
          </div></div></HeroIntro>
        <div className="cinema-hero-bottom cinema-wrap relative z-content"><span className="cinema-scroll-line" aria-hidden="true"/><Button variant="unstyled" size="auto" onClick={() => setPaused(v => !v)} aria-pressed={paused} className="cinema-motion-control">{paused ? <Play size={14} aria-hidden/> : <Pause size={14} aria-hidden/>}{paused ? c.resume : c.pause}</Button></div>
      </div>
    </section>

    <section id="studio-services" className="cinema-services cinema-section relative z-content" aria-labelledby="cinema-services-heading"><Ambient kind="violet"/>
      <div className="cinema-wrap relative z-content"><div className="cinema-section-heading"><h2 id="cinema-services-heading" className="cinema-split-heading">{c.services}</h2><p>{c.serviceIntro}</p></div>
        <ServiceScenes services={services} locale={locale}/>
      </div>
      <div className="cinema-story" id="process"><div className="cinema-story-sticky"><div className="bs-story-circle" aria-hidden="true"/><div className="bs-story-content"><div className="immersive-story-background"><ImmersiveMedia poster="/media/immersive-v2/workflow.webp" video={workflowVideo} paused={paused}/></div><div className="cinema-wrap"><div className="cinema-story-text"><h2>{c.story}</h2><p>{c.storyIntro}</p><ol>{c.steps.map(step => <li key={step.tag}><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol><div className="cinema-story-rule" aria-hidden="true"><span className="cinema-story-progress"/></div></div></div></div></div></div>
    </section>

    <CinematicPortfolio entries={entries} locale={locale} paused={paused}/>

    <section className="cinema-tools cinema-section" id="home-tools" aria-labelledby="cinema-tools-heading"><Ambient kind="blue"/><div className="cinema-wrap relative z-content"><div className="cinema-section-heading"><h2 id="cinema-tools-heading" className="cinema-split-heading">{c.tools}</h2><p>{c.toolsIntro}</p></div>
      <div className="cinema-tool-console"><div className="immersive-tool-board">{platform.tools.map((tool,index) => <Link href={`/${locale}/tools/${toolPaths[index]}`} key={toolPaths[index]} className="immersive-tool-tile"><ToolSketch index={index}/><span>{tool.split('|')[0]}</span></Link>)}</div><div className="cinema-tool-list">{platform.tools.map((tool,index) => { const [title,text] = tool.split('|'); return <Link key={toolPaths[index]} href={`/${locale}/tools/${toolPaths[index]}`} className="cinema-tool"><span><h3>{title}</h3><p>{text}</p></span><span className="cinema-tool-open">{c.try}</span></Link>; })}</div></div><p className="cinema-fine-print">{platform.note}</p>
      <nav className="bs-more-tools" aria-label={text('المزيد من الأدوات','More tools','Meer tools')[locale]}>{toolCatalog(locale).filter(tool=>!toolPaths.includes(tool.id)).map(tool=><Button key={tool.id} asChild variant="unstyled" size="auto"><Link href={`/${locale}/tools/${tool.id}`}>{tool.title}</Link></Button>)}<Button asChild variant="unstyled" size="auto"><Link href={`/${locale}/tools`}>{text('جميع الأدوات','All tools','Alle tools')[locale]}</Link></Button></nav>
    </div></section>

    <section className="cinema-products cinema-section" id="home-products" aria-labelledby="cinema-products-heading"><div className="cinema-wrap cinema-product-layout"><ProductShowcase locale={locale} paused={paused}/>
      <div><h2 id="cinema-products-heading" className="cinema-split-heading">{c.products}</h2><p className="cinema-section-deck">{c.productIntro}</p><ul className="cinema-ticks">{text('معاينة متطابقة مع اسم القالب|تصميم متجاوب للشاشات المختلفة|تخصيص المحتوى والوظائف حسب مشروعك','A preview matched to each template|Responsive layouts across screen sizes|Content and features tailored to your project','Een passende preview per template|Responsieve schermindelingen|Inhoud en functies op maat')[locale].split('|').map(f => <li key={f}>{f}</li>)}</ul><Button asChild variant="unstyled" size="auto" className="cinema-cta"><Link href={`/${locale}/services`}>{c.productCta}</Link></Button></div>
    </div></section>

    <section className="cinema-subscriptions cinema-section" id="home-subscriptions" aria-labelledby="cinema-subscriptions-heading"><div className="immersive-sub-background"><ImmersiveMedia poster="/media/immersive-v2/monitoring.webp" video="/media/immersive-v2/monitoring.webm" paused={paused}/></div><div className="cinema-wrap relative z-content"><div className="cinema-sub-layout"><div><h2 id="cinema-subscriptions-heading" className="cinema-split-heading">{c.subscriptions}</h2><p className="cinema-section-deck">{c.subIntro}</p><Button asChild variant="unstyled" size="auto" className="cinema-cta"><Link href={`/${locale}/subscriptions`}>{c.plans}</Link></Button></div></div><div className="cinema-sub-features">{platform.features[0].map(f => <div key={f}><h3>{f}</h3><Plus aria-hidden size={22}/></div>)}</div></div></section>

    <section className="cinema-hosting cinema-section" id="home-hosting" aria-labelledby="cinema-hosting-heading"><Ambient kind="network"/><div className="cinema-wrap relative z-content"><div className="cinema-host-layout"><div><h2 id="cinema-hosting-heading" className="cinema-split-heading">{c.hosting}</h2><p className="cinema-section-deck">{c.hostIntro}</p><Button asChild variant="unstyled" size="auto" className="cinema-link"><Link href={`/${locale}/hosting`}>{c.hostCta}</Link></Button></div><ol className="cinema-host-steps">{c.hostSteps.map((step,index) => <li key={step}><span>0{index+1}</span><h3>{step}</h3><span className="cinema-network-node" aria-hidden="true"/></li>)}</ol></div></div></section>

    <section className="cinema-people cinema-section" id="home-careers" aria-labelledby="cinema-people-heading"><div className="cinema-wrap"><h2 id="cinema-people-heading" className="cinema-split-heading">{c.people}</h2><div className="cinema-people-grid">{[{path:'jobs',title:c.jobs,text:c.jobText},{path:'marketplace',title:c.freelance,text:c.freelanceText}].map((item,index) => <Link href={`/${locale}/${item.path}`} key={item.path} className="cinema-person-link"><span className="cinema-person-glyph" aria-hidden="true"><PeopleIcon freelance={Boolean(index)}/></span><span><h3>{item.title}</h3><p>{item.text}</p></span></Link>)}</div></div></section>

    <section id="home-discover" className="cinema-section bs-home-discover"><div className="cinema-wrap"><h2 className="cinema-split-heading">{text('مسارات جديدة على الويب.','New paths through the web.','Nieuwe routes op het web.')[locale]}</h2><p>{text('استكشف عشرة مسارات تضم 150 تجربة وموقعًا، وقارن 24 أداة وخدمة حسب الاستخدام والميزات وأساس السعر.','Explore ten paths with 150 websites and experiences, and compare 24 tools and services by use, features and pricing basis.','Ontdek tien routes met 150 websites en ervaringen en vergelijk 24 tools en diensten op gebruik, functies en prijsbasis.')[locale]}</p><DiscoveryOrbit locale={locale}/><nav><Link className="cinema-link" href={`/${locale}/discover`}>{text('اكتشف المواقع','Explore websites','Ontdek websites')[locale]}</Link><Link className="cinema-link" href={`/${locale}/compare`}>{text('قارن الأدوات والخدمات','Compare tools & services','Vergelijk tools & diensten')[locale]}</Link></nav></div></section>
    <div className="cinema-existing">{children}</div>
    <section className="cinema-closing cinema-section" aria-labelledby="cinema-closing-heading"><div className="cinema-wrap"><span className="cinema-closing-symbol" aria-hidden="true">✳</span><h2 id="cinema-closing-heading">{c.closing}</h2><Button asChild variant="unstyled" size="auto" className="cinema-cta"><Link href={`/${locale}/create-project`}>{c.start}</Link></Button></div></section>
  </div>;
}

