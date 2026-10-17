"use client";
import { useEffect, type RefObject } from 'react';
import { footerScene, horizontalScene } from '@/lib/public-scene-engine';
/** Form controls and account workflows are never pinned or hidden. */
export function usePublicMotion(ref: RefObject<HTMLDivElement | null>, pathname: string, enabled: boolean) {
  useEffect(()=>{
    const root=ref.current;if(!root||!enabled)return;
    let cancelled=false;let dispose=()=>{};
    void Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([{gsap},{ScrollTrigger}])=>{
      if(cancelled)return;gsap.registerPlugin(ScrollTrigger);const media=gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)',()=>{
        root.dataset.sceneMotion='true';const cleanup:Array<()=>void>=[];
        const context=gsap.context(()=>{
          const rtl=getComputedStyle(root).direction==='rtl';
          footerScene(gsap);
          root.querySelectorAll<HTMLElement>('.bs-track-viewport').forEach(viewport=>cleanup.push(horizontalScene(gsap,ScrollTrigger,viewport,rtl)));
          root.querySelectorAll<HTMLElement>('h1').forEach(node=>{
            gsap.to(node,{y:-30,scale:.96,transformOrigin:rtl?'right center':'left center',ease:'none',scrollTrigger:{id:'bs-public-title',trigger:node,start:'top 25%',end:'bottom top',scrub:.45}});
          });
          root.querySelectorAll<HTMLElement>('section').forEach(section=>{
            if(section.querySelector('.bs-track-viewport,form,[role=dialog],input,textarea,select,[data-slot=input]'))return;
            if(section.parentElement?.closest('section'))return;
            gsap.fromTo(section,{y:45},{y:0,ease:'none',scrollTrigger:{id:'bs-public-section',trigger:section,start:'top bottom',end:'top 45%',scrub:.4}});
          });
          root.querySelectorAll<HTMLElement>('.creation-detail-art,figure,.cinema-project-cover,.studio-card,.creation-benefits>article,.creation-route>li,.project-service-grid>article,.project-type-grid>article,.platform-card,.tool-card,.gold-product-card,.project-tools-grid>a,.project-catalog-intro,.bg-base>.container-x>.mt-8').forEach((node,i)=>{
            if(node.closest('form,[role=dialog],.bs-track-viewport')||node.querySelector('form,input,textarea,select,[role=dialog]'))return;
            gsap.fromTo(node,{y:35,scale:.94,rotation:(i%2?1:-1)*1.5},{y:0,scale:1,rotation:0,ease:'none',scrollTrigger:{id:'bs-public-content',trigger:node,start:'top 98%',end:'top 55%',scrub:.4}});
          });
        },root);
        void document.fonts.ready.then(()=>{if(!cancelled)ScrollTrigger.refresh();});
        return()=>{context.revert();cleanup.forEach(fn=>fn());delete root.dataset.sceneMotion;};
      },root);
      dispose=()=>media.revert();
    }).catch(()=>{delete root.dataset.sceneMotion;});
    return()=>{cancelled=true;dispose();};
  },[ref,pathname,enabled]);
}
