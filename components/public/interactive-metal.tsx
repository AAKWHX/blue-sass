"use client";
import { useCallback, useEffect, useRef, useSyncExternalStore, type PointerEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMotionActive } from '@/hooks/use-motion-active';
import { infinitySurfaces } from '@/lib/infinity-geometry';
import {useSculptureAudio} from '@/hooks/use-sculpture-audio';
import type { Locale } from '@/lib/i18n/config';
import './interactive-metal.css';
import {ImmersiveMedia} from './immersive-media';
const subscribe=(notify:()=>void)=>{const q=matchMedia('(prefers-reduced-motion: reduce)');q.addEventListener('change',notify);return()=>q.removeEventListener('change',notify);};
const reducedSnapshot=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const copy={ar:{label:'مجسّم اللانهاية. اسحب أو استخدم الأسهم للتدوير في جميع الاتجاهات. اضغط باستمرار أو اسحب لمدة ثلاث ثوانٍ لفتح صفحة عشوائية. Home يعيد الاتجاه.',hold:'استمر 3 ثوانٍ لاكتشاف صفحة'},en:{label:'Infinity sculpture. Drag or use arrows to rotate freely. Hold or drag for three seconds to discover a random page. Home resets orientation.',hold:'Hold 3 seconds to discover a page'},nl:{label:'Oneindigheidssculptuur. Sleep of gebruik pijlen om vrij te draaien. Houd drie seconden vast om een willekeurige pagina te ontdekken. Home herstelt de stand.',hold:'Houd 3 seconden vast en ontdek een pagina'}};
const destinations=['services','about','projects','products','subscriptions','hosting','jobs','marketplace','discover','compare'];
export function InteractiveMetal({locale,paused}:{locale:Locale;paused:boolean}){
 const router=useRouter(),c=copy[locale as keyof typeof copy]||copy.en;
 const sound=useSculptureAudio();
 const ref=useRef<HTMLDivElement>(null),rotor=useRef<HTMLDivElement>(null),progress=useRef<HTMLSpanElement>(null);
 const active=useMotionActive(ref),reduced=useSyncExternalStore(subscribe,reducedSnapshot,()=>true);
 const position=useRef({x:-8,y:-12}),drag=useRef<{x:number;y:number}|null>(null),frame=useRef(0);
 const hold=useRef<ReturnType<typeof setTimeout>|null>(null),holdAnimation=useRef<Animation|null>(null);
 const stopSound=sound.stop;
 const stopHold=useCallback(()=>{if(hold.current)clearTimeout(hold.current);hold.current=null;holdAnimation.current?.cancel();stopSound();if(ref.current)delete ref.current.dataset.holding;},[stopSound]);
 const startHold=()=>{
  if(paused||hold.current)return;
  sound.start();
  if(ref.current)ref.current.dataset.holding='true';
  holdAnimation.current=progress.current?.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:3000,easing:'linear',fill:'forwards'})||null;
  hold.current=setTimeout(()=>{const random=crypto.getRandomValues(new Uint32Array(1))[0];stopHold();drag.current=null;router.push(`/${locale}/${destinations[random%destinations.length]}`);},3000);
 };
 const paint=()=>{if(frame.current)return;frame.current=requestAnimationFrame(()=>{frame.current=0;if(rotor.current)rotor.current.style.transform=`rotateX(${position.current.x}deg) rotateY(${position.current.y}deg)`;});};
 useEffect(()=>()=>{cancelAnimationFrame(frame.current);stopHold();},[stopHold]);
 useEffect(()=>{if(paused||!active)stopHold();},[paused,active,stopHold]);
 useEffect(()=>{const cancel=()=>{drag.current=null;stopHold();};const visibility=()=>{if(document.hidden)cancel();};addEventListener('blur',cancel);document.addEventListener('visibilitychange',visibility);return()=>{removeEventListener('blur',cancel);document.removeEventListener('visibilitychange',visibility);};},[stopHold]);
 useEffect(()=>{
  const root=ref.current;if(!root||!active||paused||reduced)return;
  const animations:Animation[]=[];
  root.querySelectorAll<HTMLElement>('.bs-metal-light').forEach((light,i)=>animations.push(light.animate([{transform:'translate3d(-8%,-4%,0) scale(.92)',opacity:.45},{transform:'translate3d(9%,8%,0) scale(1.12)',opacity:.8}],{duration:10000+i*3500,iterations:Infinity,direction:'alternate',easing:'ease-in-out'})));
  const drift=root.querySelector('.bs-metal-drift');
  if(drift)animations.push(drift.animate([{transform:'translateY(-8px) rotateX(-6deg) rotateY(-9deg) rotateZ(-3deg)'},{transform:'translateY(8px) rotateX(6deg) rotateY(9deg) rotateZ(3deg)'}],{duration:9000,iterations:Infinity,direction:'alternate',easing:'ease-in-out'}));
  return()=>animations.forEach(animation=>animation.cancel());
 },[active,paused,reduced]);
 const move=(event:PointerEvent<HTMLDivElement>)=>{if(!drag.current||paused)return;const dx=event.clientX-drag.current.x,dy=event.clientY-drag.current.y;sound.move(Math.hypot(dx,dy),dx);position.current.y+=dx*.38;position.current.x-=dy*.32;drag.current={x:event.clientX,y:event.clientY};paint();};
 const key=(event:KeyboardEvent<HTMLDivElement>)=>{
  if(paused)return;
  if(event.key===' '||event.key==='Enter'){event.preventDefault();if(!event.repeat)startHold();return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
  event.preventDefault();if(event.key==='Home')position.current={x:-8,y:-12};else if(event.key==='ArrowLeft')position.current.y-=15;else if(event.key==='ArrowRight')position.current.y+=15;else position.current.x+=event.key==='ArrowUp'?-12:12;paint();
 };
 const end=()=>{drag.current=null;stopHold();};
 return <div ref={ref} className="bs-metal-stage" data-active={active&&!paused&&!reduced}>
  <div className="bs-metal-generated"><ImmersiveMedia poster="/media/higgsfield/ambient-gold-v2.webp" video="/media/higgsfield/ambient-gold-v2.mp4" paused={paused} sourceWidth={1920}/></div>
  <div className="bs-metal-light bs-metal-light-blue"/><div className="bs-metal-light bs-metal-light-purple"/><div className="bs-metal-light bs-metal-light-gold"/>
  <div className="bs-metal-control" role="button" tabIndex={0} aria-label={c.label} onKeyDown={key} onKeyUp={event=>{if(event.key===' '||event.key==='Enter')end();}} onBlur={end} onPointerDown={event=>{if(paused||event.button!==0)return;drag.current={x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);startHold();}} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
   <div ref={rotor} className="bs-metal-rotor"><div className="bs-metal-drift" aria-hidden="true">{infinitySurfaces.map((style,i)=><i className="bs-infinity-face" key={i} style={style}/>)}</div></div>
  </div>
  <div className="bs-metal-hold" aria-hidden="true"><p>{c.hold}</p><span ref={progress}/></div>
 </div>;
}
