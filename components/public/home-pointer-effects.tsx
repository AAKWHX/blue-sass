"use client";
import { useEffect, useRef, type RefObject } from 'react';
export function HomePointerEffects({scope,paused}:{scope:RefObject<HTMLDivElement|null>;paused:boolean}){
 const layer=useRef<HTMLDivElement>(null),cursor=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const root=scope.current,lights=layer.current;if(!root||!lights||paused)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let index=0,frame=0;const animations=new Set<Animation>();
  const click=(event:PointerEvent)=>{
   if(reduced.matches||(event.target as Element).closest('a,button,input,textarea,select,[role=button],[role=dialog],.bs-metal-control'))return;
   const node=lights.children[index++%lights.children.length] as HTMLElement;
   node.getAnimations().forEach(animation=>animation.cancel());node.style.left=`${event.clientX}px`;node.style.top=`${event.clientY}px`;
   const animation=node.animate([{transform:'translate(-50%,-50%) scale(.1)',opacity:.5},{transform:'translate(-50%,-50%) scale(3)',opacity:0}],{duration:1700,easing:'cubic-bezier(.15,.5,.2,1)'});animations.add(animation);void animation.finished.finally(()=>animations.delete(animation)).catch(()=>{});
  };
  const move=(event:PointerEvent)=>{
   const node=cursor.current;if(!node)return;
   const section=(event.target as Element).closest('#home-tools,#home-products,#home-careers,#home-discover');
   node.hidden=!section||reduced.matches||event.pointerType!=='mouse';
   if(node.hidden)return;if(frame)cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{node.style.transform=`translate3d(${event.clientX+18}px,${event.clientY+18}px,0) rotate(${event.clientX*.06}deg)`;node.dataset.section=section?.id||'';});
  };
  const leave=()=>{if(cursor.current)cursor.current.hidden=true;};
  root.addEventListener('pointerdown',click,{passive:true});root.addEventListener('pointermove',move,{passive:true});root.addEventListener('pointerleave',leave);
  return()=>{root.removeEventListener('pointerdown',click);root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',leave);animations.forEach(animation=>animation.cancel());cancelAnimationFrame(frame);leave();};
 },[scope,paused]);
 return <><div ref={layer} className="bs-reactive-lights z-content" aria-hidden="true">{Array.from({length:6},(_,i)=><i key={i}/>)}</div><div ref={cursor} className="bs-pointer-object z-content" aria-hidden="true" hidden><i/><i/><i/></div></>;
}
