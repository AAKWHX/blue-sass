"use client";
import { useEffect, type RefObject } from 'react';

export function useRecoveredSceneEffects(root:RefObject<HTMLDivElement|null>,stopped:boolean){
 useEffect(()=>{
  const node=root.current;if(!node||stopped)return;
  const hero=node.querySelector<HTMLElement>('.prism-hero'),light=node.querySelector<HTMLElement>('.premium-light');
  let frame=0,lastY=scrollY,direction=1,visible=true,point:{x:number;y:number;target:Element|null}|null=null;
  const animations=new Set<Animation>(),pulses=new Set<HTMLElement>();
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const element=entry.target as HTMLElement;element.dataset.revealDirection=direction>0?'down':'up';const animation=element.animate([{opacity:.35,transform:`translateY(${direction*42}px)`},{opacity:1,transform:'translateY(0)'}],{duration:750,easing:'cubic-bezier(.16,1,.3,1)'});animations.add(animation);animation.onfinish=()=>animations.delete(animation);}}, {threshold:.12});
  node.querySelectorAll('[data-premium-reveal]').forEach(element=>observer.observe(element));
  const cards=Array.from(node.querySelectorAll<HTMLElement>('.company-services article'));
  const measure=()=>{for(const card of cards)card.dataset.pin=String(card.offsetHeight<innerHeight-150);};measure();
  const cardResize=new ResizeObserver(measure);cards.forEach(card=>cardResize.observe(card));
  const paint=()=>{frame=0;if(document.hidden)return;if(hero&&visible){const r=hero.getBoundingClientRect(),progress=Math.max(0,Math.min(1,-r.top/Math.max(innerHeight,1)));const x=point?(point.x-r.left)/Math.max(r.width,1)-.5:0,y=point?(point.y-r.top)/Math.max(r.height,1)-.5:0;if(light)light.style.transform=`translate3d(${x*160}px,${y*100+progress*70}px,0) scale(1.15)`;hero.style.setProperty('--scene-shift',`${progress*70}px`);hero.querySelector('.recovered-prism')?.dispatchEvent(new CustomEvent('prism-light',{detail:{x,y}}));}
   for(let i=0;i<cards.length-1;i++){const card=cards[i],next=cards[i+1].getBoundingClientRect();const t=card.dataset.pin==='true'?Math.max(0,Math.min(1,(innerHeight-next.top)/Math.max(1,innerHeight-140))):0;card.style.setProperty('--stack-scale',String(1-t*.035));}
   const card=point?.target?.closest<HTMLElement>('.company-services article');if(card&&point){const r=card.getBoundingClientRect(),glow=card.querySelector<HTMLElement>('.catalog-light');if(glow)glow.style.transform=`translate3d(${((point.x-r.left)/r.width-.5)*130}px,${((point.y-r.top)/r.height-.5)*90}px,0)`;}
  };
  const schedule=()=>{if(!frame&&!document.hidden)frame=requestAnimationFrame(paint);};
  const scroll=()=>{direction=scrollY>=lastY?1:-1;lastY=scrollY;node.dataset.scrollDirection=direction>0?'down':'up';schedule();};
  const move=(event:PointerEvent)=>{point={x:event.clientX,y:event.clientY,target:event.target instanceof Element?event.target:null};schedule();};
  const leave=()=>{point=null;schedule();};



  const heroObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();});if(hero)heroObserver.observe(hero);
  node.addEventListener('pointermove',move,{passive:true});node.addEventListener('pointerleave',leave);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);schedule();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();heroObserver.disconnect();cardResize.disconnect();animations.forEach(a=>a.cancel());pulses.forEach(s=>s.remove());node.removeEventListener('pointermove',move);node.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',schedule);};
 },[root,stopped]);
 // Recovered PrismHero exit and service-title scrub from use-cinematic-motion.ts.
 useEffect(()=>{
  const node=root.current;if(!node||stopped)return;
  let disposed=false,revert=()=>{};
  void Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([{gsap},{ScrollTrigger}])=>{
   if(disposed)return;gsap.registerPlugin(ScrollTrigger);
   const context=gsap.context(()=>{
    const hero=node.querySelector<HTMLElement>('.prism-hero'),grid=node.querySelector('.prism-hero-grid'),copy=node.querySelector('.prism-copy'),heading=node.querySelector('.recovered-service-heading');
    if(hero&&grid){
     gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'qa-recovered-prism-exit',trigger:hero,start:'top top+=80',end:'bottom top+=80',scrub:.55,invalidateOnRefresh:true}})
      .to(grid,{scale:()=>matchMedia('(min-width:1024px)').matches?.89:.96,yPercent:-7,opacity:.25,duration:1},0)
      .to(copy,{y:-45,opacity:.35,duration:1},0);
    }
    if(heading)gsap.fromTo(heading,{y:45,opacity:.15},{y:0,opacity:1,ease:'none',scrollTrigger:{id:'qa-recovered-services-entry',trigger:heading,start:'top bottom',end:'top 55%',scrub:.5}});
   },node);
   node.dataset.scrollEngine='recovered-gsap';revert=()=>context.revert();
   void document.fonts.ready.then(()=>{if(!disposed)ScrollTrigger.refresh();});
  }).catch(()=>{if(!disposed)node.dataset.scrollEngine='native-fallback';});
  return()=>{disposed=true;revert();delete node.dataset.scrollEngine;};
 },[root,stopped]);

}
