"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Briefcase, FileText, LayoutGrid, Mail, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { immersiveCopy } from '@/lib/i18n/immersive';
import type { Locale } from '@/lib/i18n/config';
import { InteractiveMetal } from './interactive-metal';
import { BrandIntro } from './brand-intro';
import {serviceTemplates} from '@/lib/service-templates';
import {TemplatePreview} from './template-preview';
import Link from 'next/link';
import { text } from '@/lib/discovery/types';
import type { ActiveLocale } from '@/lib/i18n/config';
import './discovery-browser.css';
const query = '(prefers-reduced-motion: no-preference)';
const subscribe = (notify: () => void) => { const q = matchMedia(query); q.addEventListener('change', notify); return () => q.removeEventListener('change', notify); };
const snapshot = () => matchMedia(query).matches;
const serverSnapshot = () => false;
export function HeroIntro({ locale, paused, children }: { locale: Locale; paused: boolean; children: ReactNode }) {
  const motion = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [ready, setReady] = useState(false);
  const finish=useCallback(()=>setReady(true),[]);
  const complete = ready || !motion || paused;
  return <div className="immersive-intro" data-ready={complete} data-started="true">
    <BrandIntro locale={locale} onComplete={finish}/>
    <div className="cinema-hero-object"><InteractiveMetal locale={locale} paused={paused||!complete}/></div>
    <div className="immersive-hero-content" inert={!complete}>{children}</div>
  </div>;
}
export function ProductShowcase({ locale, paused }: { locale: Locale; paused: boolean }) {
  const ref = useRef<HTMLDivElement>(null); const [index, setIndex] = useState(0);
  const swipe=useRef<{x:number;y:number}|null>(null);
  const slideDirection=useRef(1),scrollGesture=useRef({distance:0,lastChange:0});
  const c = immersiveCopy(locale); const motion = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const lang=locale as ActiveLocale;const templates=serviceTemplates(locale);const selected=templates[index];
  useEffect(() => {
    if (!motion || paused) return;
    scrollGesture.current={distance:0,lastChange:performance.now()};
    const direction=slideDirection.current*(locale==='ar'?-1:1);
    const node=ref.current?.querySelector('.immersive-gallery-slide');const animation=node?.animate([{opacity:.5,transform:`translateX(${direction*85}px) rotateY(${direction*-5}deg)`},{opacity:1,transform:'translateX(0) rotateY(0)'}],{duration:1000,easing:'cubic-bezier(.2,.7,.2,1)'});
    return()=>animation?.cancel();
  }, [index,motion,paused,locale]);
  useEffect(()=>{
    const node=ref.current;if(!node||!motion||paused)return;
    let previous=scrollY,frame=0;
    const update=()=>{frame=0;const y=scrollY,delta=y-previous;previous=y;const rect=node.getBoundingClientRect(),stage=node.querySelector('.immersive-gallery-stage')?.getBoundingClientRect();
      if(!stage||stage.bottom<innerHeight*.25||stage.top>innerHeight*.8||rect.bottom<0||Math.abs(delta)>innerHeight*.8){scrollGesture.current.distance=0;return;}
      const gesture=scrollGesture.current;if(Math.sign(delta)!==Math.sign(gesture.distance))gesture.distance=0;gesture.distance+=delta;
      if(Math.abs(gesture.distance)<180||performance.now()-gesture.lastChange<1200)return;
      const direction=Math.sign(gesture.distance);gesture.distance=0;gesture.lastChange=performance.now();slideDirection.current=direction;setIndex(value=>Math.max(0,Math.min(15,value+direction)));
    };
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};addEventListener('scroll',scroll,{passive:true});
    return()=>{removeEventListener('scroll',scroll);cancelAnimationFrame(frame);};
  },[motion,paused]);
  return <div ref={ref} className="immersive-gallery bs-template-gallery" data-index={index}>
    <div className="immersive-gallery-stage" onPointerDown={event=>{swipe.current={x:event.clientX,y:event.clientY};}} onPointerCancel={()=>{swipe.current=null;}} onPointerUp={event=>{const start=swipe.current;swipe.current=null;if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy))setIndex(value=>(value+(dx>0?(locale==='ar'?1:-1):(locale==='ar'?-1:1))+templates.length)%templates.length);}}><div key={selected.id} id={`design-panel-${index}`} role="tabpanel" aria-labelledby={`design-tab-${index}`} className="immersive-gallery-slide" data-active="true"><TemplatePreview template={selected} locale={locale}/></div></div>
    <div className="bs-gallery-controls"><Button variant="unstyled" size="auto" onClick={()=>setIndex(value=>(value-1+templates.length)%templates.length)}>{text('السابق','Previous','Vorige')[lang]}</Button><span aria-live="polite">{index+1} / {templates.length}</span><Button variant="unstyled" size="auto" onClick={()=>setIndex(value=>(value+1)%templates.length)}>{text('التالي','Next','Volgende')[lang]}</Button></div>
    <div className="immersive-gallery-tabs bs-template-tabs" role="tablist" aria-label={c.gallery} onKeyDown={event => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const direction = (locale === 'ar' ? -1 : 1) * (event.key === 'ArrowRight' ? 1 : -1); const next = event.key === 'Home' ? 0 : event.key === 'End' ? templates.length-1 : (index + direction + templates.length) % templates.length; setIndex(next); document.getElementById(`design-tab-${next}`)?.focus(); }}>{templates.map((template, i) => <Button key={template.id} id={`design-tab-${i}`} role="tab" aria-selected={index === i} aria-controls={index===i?`design-panel-${i}`:undefined} tabIndex={index === i ? 0 : -1} variant="unstyled" size="auto" onClick={() => setIndex(i)}>{template.name}</Button>)}</div>
    <div className="bs-gallery-caption"><strong>{selected.name}</strong><p>{text('قالب Blue Sass قابل للتخصيص. نراجع المحتوى والوظائف معك حسب تفاصيل المشروع.','A customisable Blue Sass template. Content and features are refined together around your project.','Een aanpasbaar Blue Sass-template. Inhoud en functies stemmen we af op je project.')[lang]}</p><Link href={`/${locale}/services/${selected.service}/templates/${selected.id}`}>{text('معاينة القالب','Preview template','Template bekijken')[lang]}</Link></div>
  </div>;
}
export function ToolSketch({ index }: { index: number }) {
  const Icon = [LayoutGrid, FileText, Search, Mail][index];
  return <div className={`immersive-tool-sketch immersive-tool-sketch-${index}`} aria-hidden="true"><Icon size={30}/>{index === 0 ? <div className="immersive-qr">{Array.from({ length: 49 }, (_, i) => <i key={i} data-dark={(i * 17 + i % 7) % 5 < 3}/>)}</div> : <div className="immersive-tool-lines"><i/><i/><i/>{index === 2 && <div className="immersive-search-bars"><b/><b/><b/><b/></div>}{index === 3 && <span className="immersive-message-check">✓</span>}</div>}<span className="immersive-tool-scan"/></div>;
}
export function PeopleIcon({ freelance }: { freelance: boolean }) { const Icon = freelance ? Users : Briefcase; return <Icon size={42} aria-hidden/>; }
