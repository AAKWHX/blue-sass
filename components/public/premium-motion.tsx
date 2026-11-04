"use client";

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RecoveredPrism, RecoveredSilhouette, type RecoveredPrismHandle } from './recovered-prism';
import { useRecoveredSceneEffects } from './recovered-scene-effects';
import { useSculptureAudio } from '@/hooks/use-sculpture-audio';
import { Button } from '@/components/ui/button';
import type { ActiveLocale } from '@/lib/i18n/config';
import { createSculptureJourney, idleSnapshot, intentionalDrag, INTRO_DURATION_MS } from '@/lib/hero-interaction';

const subscribe = (notify: () => void) => {
 const media = matchMedia('(prefers-reduced-motion: reduce)');
 media.addEventListener('change', notify);
 return () => media.removeEventListener('change', notify);
};
const reducedSnapshot = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverSnapshot = () => true;
const hydrateSubscribe = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;
const MotionStopped = createContext(true);
const labels = {
 ar: {pause:'إيقاف الحركة',play:'تشغيل الحركة',intro:'Blue Sass · من الفكرة إلى الإطلاق',welcome:'مقدمة Blue Sass',skip:'تخطي المقدمة',drag:'اضغط واسحب حرف B لتدويره. يبدأ عدّ ثلاث ثوانٍ بعد السحب ثم تفتح خدمة عشوائية. استخدم الأسهم للتدوير وEnter لبدء الاكتشاف، وEscape للإلغاء.',hint:'اسحب B لتدويره واكتشاف خدمة بعد 3 ثوانٍ',count:'سيبدأ الانتقال بعد 3 ثوانٍ. يمكنك الإلغاء.',breaking:'نفتح لك مسارًا جديدًا…',cancel:'إلغاء الانتقال',browse:'استكشف الخدمات دون حركة'},
 en: {pause:'Pause motion',play:'Play motion',intro:'Blue Sass · From idea to launch',welcome:'Blue Sass introduction',skip:'Skip introduction',drag:'Press and drag B to rotate. A three-second countdown starts after dragging, then opens a random service. Use arrow keys to rotate, Enter to start discovery, and Escape to cancel.',hint:'Drag B to rotate and discover a service after 3 seconds',count:'Transition starts after 3 seconds. You can cancel.',breaking:'Opening a new direction…',cancel:'Cancel transition',browse:'Explore services without motion'},
 nl: {pause:'Beweging pauzeren',play:'Beweging afspelen',intro:'Blue Sass · Van idee tot lancering',welcome:'Blue Sass introductie',skip:'Introductie overslaan',drag:'Druk op B en sleep om te draaien. Na het slepen begint een aftelling van drie seconden, daarna opent een willekeurige dienst. Gebruik de pijltjestoetsen om te draaien, Enter om te ontdekken en Escape om te annuleren.',hint:'Sleep B om te draaien en na 3 seconden een dienst te ontdekken',count:'De overgang begint na 3 seconden. U kunt annuleren.',breaking:'Een nieuwe richting openen…',cancel:'Overgang annuleren',browse:'Ontdek diensten zonder beweging'},
};

function BrandArrival({locale,stopped}:{locale:ActiveLocale;stopped:boolean}) {
 const hydrated=useSyncExternalStore(hydrateSubscribe,clientHydrated,serverHydrated);
 const [done,setDone]=useState(false);
 const node=useRef<HTMLDivElement>(null);
 const visible=hydrated&&!stopped&&!done;
 useEffect(()=>{
  if(!visible||!node.current)return;
  const element=node.current,previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
  const siblings=Array.from(document.body.children).filter((child):child is HTMLElement=>child instanceof HTMLElement&&!child.contains(element)&&!['SCRIPT','STYLE','LINK'].includes(child.tagName)).map(child=>({child,inert:child.inert}));
  siblings.forEach(({child})=>{child.inert=true;});document.body.style.overflow='hidden';element.focus({preventScroll:true});
  const timer=setTimeout(()=>setDone(true),INTRO_DURATION_MS);
  return()=>{clearTimeout(timer);siblings.forEach(({child,inert})=>{child.inert=inert;});document.body.style.overflow=overflow;previous?.focus({preventScroll:true});};
 },[visible]);
 if(!visible)return null;
 const c=labels[locale];
 return createPortal(<div ref={node} className="bs-qa-brand-arrival z-overlay" role="dialog" aria-modal="true" aria-label={c.welcome} tabIndex={-1} data-duration-ms={INTRO_DURATION_MS} onKeyDown={event=>{if(event.key==='Escape')setDone(true);}}>
  
  <div className="bs-qa-intro-name" dir="ltr"><Image src="/blue-sass-mark.svg" alt="" width={76} height={76} priority/><span>Blue Sass</span></div>
 </div>,document.body);
}

export function PremiumMotion({locale,children}:{locale:ActiveLocale;children:ReactNode}) {
 const root=useRef<HTMLDivElement>(null);
 const reduced=useSyncExternalStore(subscribe,reducedSnapshot,serverSnapshot);
 const stopped=reduced;
 useRecoveredSceneEffects(root,stopped);
 return <MotionStopped value={stopped}><div ref={root} className="premium-home" data-motion={stopped?'paused':'active'}>
  <BrandArrival locale={locale} stopped={stopped}/>{children}
 </div></MotionStopped>;
}

function DiscoveryCountdown(){const [seconds,setSeconds]=useState(3);useEffect(()=>{const timer=setInterval(()=>setSeconds(n=>Math.max(1,n-1)),1000);return()=>clearInterval(timer);},[]);return <span className="premium-count-value" aria-hidden="true">{seconds}</span>;}
const glassShards=Array.from({length:24},(_,i)=>{const cell=Math.floor(i/2),col=cell%3,row=Math.floor(cell/3),x=col*100/3,y=row*25,w=100/3;const points=i%2?[[x,y],[x+w,y+25],[x,y+25]]:[[x,y],[x+w,y],[x+w,y+25]];return{clip:'polygon('+points.map(([a,b])=>a+'% '+b+'%').join(',')+')',x:(col-1)*210+(i%2?55:-55),y:(row-1.5)*140,spin:(i%2?1:-1)*(25+i*4)};});
function BFace({id}:{id:string}) { return <div className="recovered-fragment-fallback" data-artwork={id}><RecoveredSilhouette/></div>; }
export function PremiumVisual({locale}:{locale:ActiveLocale}) {
 const c=labels[locale],stopped=useContext(MotionStopped),router=useRouter(),id=useId();
 const rendered=useRef<RecoveredPrismHandle>(null),model=useRef<HTMLDivElement>(null),pointer=useRef<{id:number;x:number;y:number;rx:number;ry:number}|null>(null),angles=useRef({x:-5.73,y:-18.34});
 const journey=useMemo(()=>createSculptureJourney({locale,enabled:!stopped,navigate:path=>router.push(path),random:()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296,schedule:(callback,delay)=>setTimeout(callback,delay),cancel:timer=>clearTimeout(timer)}),[locale,router,stopped]);
 const phase=useSyncExternalStore(journey.subscribe,journey.snapshot,idleSnapshot);
 const {start:audioStart,move:audioMove,stop:audioStop,shatter:audioShatter}=useSculptureAudio();
 useEffect(()=>{if(phase==='shattering')audioShatter();else if(phase==='idle')audioStop();},[phase,audioShatter,audioStop]);
 useEffect(()=>{journey.activate();return()=>journey.dispose();},[journey]);
 useEffect(()=>{const cancel=()=>{if(document.hidden)journey.cancel();};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){pointer.current=null;journey.cancel();}};document.addEventListener('visibilitychange',cancel);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('visibilitychange',cancel);document.removeEventListener('keydown',escape);};},[journey]);
 const rotate=(x:number,y:number)=>{angles.current={x:Math.max(-55,Math.min(55,x)),y:Math.max(-80,Math.min(80,y))};rendered.current?.rotate(angles.current.x,angles.current.y);if(model.current){model.current.style.setProperty('--rx',`${angles.current.x}deg`);model.current.style.setProperty('--ry',`${angles.current.y}deg`);}};
 const status=phase==='shattering'?c.breaking:phase==='countdown'?c.count:c.hint;
 return <div className="premium-visual" data-journey={phase} onKeyDown={event=>{if(event.key==='Escape')journey.cancel();}}>
  <div className="premium-light"/>
  <Button type="button" variant="unstyled" size="auto" className="premium-sculpture-control z-stage" aria-label={c.drag} aria-describedby={`${id}-hint`} disabled={stopped} onPointerDown={event=>{if(stopped||phase==='shattering'||!event.isPrimary||event.button!==0)return;pointer.current={id:event.pointerId,x:event.clientX,y:event.clientY,rx:angles.current.x,ry:angles.current.y};event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={event=>{const start=pointer.current;if(!start||start.id!==event.pointerId||stopped)return;if(intentionalDrag(event.clientX,event.clientY,start.x,start.y)&&journey.start())audioStart();audioMove(Math.hypot(event.movementX,event.movementY),event.movementX);rotate(start.rx+(event.clientY-start.y)*.24,start.ry+(event.clientX-start.x)*.24);}} onPointerUp={event=>{pointer.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerCancel={()=>{pointer.current=null;journey.cancel();}} onKeyDown={event=>{if(event.key==='Escape'){journey.cancel();return;}if(event.key==='Home'){event.preventDefault();rotate(-5.73,-18.34);return;}const directions:Record<string,[number,number]>={ArrowUp:[-8,0],ArrowDown:[8,0],ArrowLeft:[0,-8],ArrowRight:[0,8]};const move=directions[event.key];if(move){event.preventDefault();rotate(angles.current.x+move[0],angles.current.y+move[1]);}if((event.key==='Enter'||event.key===' ')&&!event.repeat){event.preventDefault();if(journey.start())audioStart();}}}>
   <div ref={model} className="premium-sculpture" data-shattered={phase==='shattering'}>
    <div className="premium-solid"><RecoveredPrism ref={rendered} phase={phase}/></div>
    {phase==='shattering'&&glassShards.map((shard,i)=><div key={i} className="premium-fragment" style={{clipPath:shard.clip,'--dx':`${shard.x}px`,'--dy':`${shard.y}px`,'--rz':`${shard.spin}deg`,'--dz':`${80+i*9}px`} as CSSProperties}><BFace id={`${id}-fragment-${i}`}/></div>)}
   </div>
  </Button>
  <div className="premium-discovery-status z-content"><p id={`${id}-hint`} role="status" aria-live="polite">{stopped?c.browse:status}</p>{phase==='countdown'&&<><DiscoveryCountdown/><span className="premium-countdown" aria-hidden="true"><i/></span></>}{stopped&&<a href={`/${locale}/services`}>{c.browse}</a>}</div>
  <p className="premium-stage-caption">{c.intro}</p>{phase==="countdown"&&createPortal(<div className="premium-journey-cancel-layer z-overlay" role="region" aria-label={c.count}><p>{c.count}</p><Button type="button" variant="unstyled" size="auto" className="premium-cancel" onPointerDown={event=>{event.stopPropagation();pointer.current=null;journey.cancel();}} onKeyDown={event=>{if(["Enter"," ","Escape"].includes(event.key)){event.preventDefault();event.stopPropagation();pointer.current=null;journey.cancel();}}} onClick={()=>{pointer.current=null;journey.cancel();}}>{c.cancel}</Button></div>,document.body)}
 </div>;
}
/** Recovered MiniPrism geometry, native renderer and scroll mapping. */
export function BottomSculpture() {
 const root=useRef<HTMLDivElement>(null),model=useRef<HTMLDivElement>(null),rendered=useRef<RecoveredPrismHandle>(null);
 const reduced=useSyncExternalStore(subscribe,reducedSnapshot,serverSnapshot);
 useEffect(()=>{
  const node=root.current,object=model.current;if(!node||!object)return;
  let frame=0,visible=false,lastTime=0,current=.5,target=.5;
  const paint=()=>{rendered.current?.rotate((-.1+(current-.5)*.9)*57.3,(-.32+(current-.5)*1.8)*57.3);node.dataset.scrollProgress=current.toFixed(4);};
  const tick=(time:number)=>{frame=0;if(!visible||document.hidden)return;const dt=Math.min(64,lastTime?time-lastTime:16);lastTime=time;current+=(target-current)*(1-Math.exp(-dt/90));if(Math.abs(target-current)<.0005)current=target;paint();if(current!==target)frame=requestAnimationFrame(tick);};
  const update=()=>{if(!visible)return;const rect=node.getBoundingClientRect(),next=reduced?.5:Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));node.dataset.scrollDirection=next>target?'down':next<target?'up':'still';target=next;if(reduced){current=.5;paint();return;}if(!frame){lastTime=0;frame=requestAnimationFrame(tick);}};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)update();else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'80px'});observer.observe(node);
  const resize=new ResizeObserver(update);resize.observe(node);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else update();};
  window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update,{passive:true});document.addEventListener('visibilitychange',visibility);paint();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();window.removeEventListener('scroll',update);window.removeEventListener('resize',update);document.removeEventListener('visibilitychange',visibility);};
 },[reduced]);
 return <div ref={root} className="premium-bottom-stage" aria-hidden="true" data-recovered="mini-prism-renderer"><div className="premium-bottom-light"/><div ref={model} className="premium-bottom-model"><RecoveredPrism ref={rendered}/></div></div>;
}
