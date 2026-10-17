"use client";
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Locale } from '@/lib/i18n/config';
import './discovery-experience.css';
const hydrate=()=>()=>{};
export function BrandIntro({locale,onComplete}:{locale:Locale;onComplete:()=>void}){
 const hydrated=useSyncExternalStore(hydrate,()=>true,()=>false);
 const [phase,setPhase]=useState<'arrival'|'brand'|'glitch'|'done'>('arrival');
 const done=phase==='done';
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!hydrated||done)return;
  const node=root.current;if(!node)return;
  const prior=document.activeElement as HTMLElement|null;const previousOverflow=document.body.style.overflow;
  const siblings=[...document.body.children].filter((child):child is HTMLElement=>child instanceof HTMLElement&&!child.contains(node)&&!['SCRIPT','STYLE','LINK'].includes(child.tagName)).map(child=>({child,inert:child.inert}));
  siblings.forEach(({child})=>{child.inert=true;});document.body.style.overflow='hidden';
  node.focus({preventScroll:true});
  return()=>{siblings.forEach(({child,inert})=>{child.inert=inert;});document.body.style.overflow=previousOverflow;prior?.focus({preventScroll:true});};
 },[hydrated,done]);
 useEffect(()=>{
  if(!hydrated||phase==='done')return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animations:Animation[]=[];
  if(phase==='arrival'&&!reduced)root.current?.querySelectorAll<HTMLElement>('.bs-intro-shard').forEach((node,i)=>animations.push(node.animate([{transform:`rotate(${i*60}deg) translateX(140px) scale(.4)`,opacity:0},{transform:`rotate(${i*60+50}deg) translateX(60px) scale(1)`,opacity:.65},{transform:`rotate(${i*60+80}deg) translateX(20px) scale(.3)`,opacity:0}],{duration:650,fill:'both',easing:'cubic-bezier(.2,.7,.2,1)'})));
  if(phase==='glitch'&&!reduced){const node=root.current?.querySelector('.bs-intro-name');if(node)animations.push(node.animate([{transform:'translateX(0)',opacity:1},{transform:'translateX(-5px) skewX(3deg)',opacity:.85},{transform:'translateX(5px) skewX(-3deg)',opacity:1},{transform:'translateY(-10px) scaleY(.7)',opacity:0}],{duration:500,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'}));}
  const timeout=setTimeout(()=>{
   if(phase==='arrival')setPhase('brand');else if(phase==='brand')setPhase(reduced?'done':'glitch');else setPhase('done');
  },phase==='arrival'?(reduced?0:650):phase==='brand'?5000:500);
  return()=>{clearTimeout(timeout);animations.forEach(animation=>animation.cancel());};
 },[phase,hydrated]);
 useEffect(()=>{if(phase==='done')onComplete();},[phase,onComplete]);
 if(!hydrated||phase==='done')return null;
 return createPortal(<div ref={root} tabIndex={-1} className="bs-brand-intro z-overlay" data-phase={phase} role="dialog" aria-modal="true" aria-label={locale==='ar'?'مقدمة Blue Sass':locale==='nl'?'Blue Sass introductie':'Blue Sass introduction'} onKeyDown={event=>{if(event.key==='Escape')setPhase('done');}}>
  <div className="bs-intro-orbit" aria-hidden="true">{Array.from({length:6},(_,i)=><i key={i} className="bs-intro-shard"/>)}</div>
  <div className="bs-intro-brand" data-visible={phase!=='arrival'}><Image src="/blue-sass-mark.svg" alt="" width={72} height={72}/><span className="bs-intro-name" dir="ltr">Blue Sass</span></div>
 </div>,document.body);
}
