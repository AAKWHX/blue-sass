"use client";
import { useEffect, useSyncExternalStore, type RefObject } from 'react';
import { footerScene, headerOffset, horizontalScene, serviceScene } from '@/lib/public-scene-engine';
const subscribeDesktop=(notify:()=>void)=>{const query=matchMedia('(min-width:1024px)');query.addEventListener('change',notify);return()=>query.removeEventListener('change',notify);};
export function useCinematicMotion(ref: RefObject<HTMLDivElement | null>, paused: boolean) {
  const desktop=useSyncExternalStore(subscribeDesktop,()=>matchMedia('(min-width:1024px)').matches,()=>false);
  useEffect(() => {
    const root=ref.current;if(!root||paused)return;
    let cancelled=false;let dispose=()=>{};
    void Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([{gsap},{ScrollTrigger}])=>{
      if(cancelled)return;gsap.registerPlugin(ScrollTrigger);const media=gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)',()=>{
        root.dataset.scrollMotion='true';root.dataset.enhanced='true';const cleanup:Array<()=>void>=[];
        const context=gsap.context(()=>{
          const rtl=getComputedStyle(root).direction==='rtl';
          footerScene(gsap);
          const opening=root.querySelector<HTMLElement>('.cinema-opening'),hero=root.querySelector<HTMLElement>('.cinema-hero');
          if(opening&&hero&&desktop){
            gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'bs-home-opening',trigger:opening,pin:hero,pinSpacing:false,start:()=>`top top+=${headerOffset()-12}`,end:()=>`+=${innerHeight*1.05}`,scrub:.45,invalidateOnRefresh:true}})
              .to('.cinema-hero-object',{scale:.8,yPercent:-8,rotationY:rtl?7:-7,duration:1},0)
              .to('.cinema-hero-copy',{y:-55,scale:.94,duration:1},0)
              .to(hero,{scale:.92,yPercent:-5,duration:.65},.35);
          }
          cleanup.push(serviceScene(gsap,root,rtl));
          root.querySelectorAll<HTMLElement>('.bs-track-viewport').forEach(viewport=>cleanup.push(horizontalScene(gsap,ScrollTrigger,viewport,rtl)));
          root.querySelectorAll<HTMLElement>('.cinema-section,.cinema-existing section').forEach(section=>{
            // Do not transform an ancestor of a fixed pin.
            if(!section.querySelector('[data-service-scenes],.bs-track-viewport,form,input,textarea,select'))gsap.fromTo(section,{y:65},{y:0,ease:'none',scrollTrigger:{id:'bs-home-overlap',trigger:section,start:'top bottom',end:'top 45%',scrub:.45}});
            const heading=section.querySelector<HTMLElement>('.cinema-split-heading');
            if(heading)gsap.fromTo(heading,{y:30},{y:-12,ease:'none',scrollTrigger:{trigger:section,start:'top bottom',end:'center 35%',scrub:.4}});
          });
          root.querySelectorAll<HTMLElement>('.immersive-story-background,.immersive-sub-background,.cinema-work-window,.immersive-gallery-stage').forEach(node=>{
            gsap.fromTo(node,{scale:.88,y:35},{scale:1,y:-20,ease:'none',scrollTrigger:{id:'bs-home-media',trigger:node.closest('section'),start:'top 90%',end:'center 30%',scrub:.5}});
          });
          const story=root.querySelector<HTMLElement>('.cinema-story-sticky');
          if(story){
            const circle=story.querySelector('.bs-story-circle'),content=story.querySelector('.bs-story-content');
            if(circle&&content){
              const reveal=gsap.timeline({scrollTrigger:{id:'bs-home-circle',trigger:story,start:'top 65%',end:'top 12%',scrub:.65,invalidateOnRefresh:true}});
              reveal.fromTo(circle,{scale:.045,opacity:1},{scale:1.5,opacity:1,ease:'none',duration:1},0)
                .fromTo(content,{opacity:0,y:25},{opacity:1,y:0,ease:'none',duration:.45},.55);
            }
            const timeline=gsap.timeline({scrollTrigger:{id:'bs-home-process',trigger:story,start:'top 75%',end:'bottom 30%',scrub:.5}});
            story.querySelectorAll<HTMLElement>('ol li').forEach((step,i)=>timeline.fromTo(step,{x:(rtl?-1:1)*45,opacity:.4},{x:0,opacity:1,ease:'none',duration:1},i*.6));
          }
          root.querySelectorAll<HTMLElement>('.immersive-tool-tile,.cinema-host-steps li,.cinema-sub-features>div,.cinema-person-link').forEach((node,i)=>{
            gsap.fromTo(node,{y:35,rotation:(i%2?1:-1)*2,scale:.96},{y:0,rotation:0,scale:1,ease:'none',scrollTrigger:{id:'bs-home-detail',trigger:node,start:'top 98%',end:'top 55%',scrub:.4}});
          });
        },root);
        void document.fonts.ready.then(()=>{if(!cancelled)ScrollTrigger.refresh();});
        return()=>{context.revert();cleanup.forEach(fn=>fn());delete root.dataset.scrollMotion;delete root.dataset.enhanced;};
      },root);
      dispose=()=>media.revert();
    }).catch(()=>{delete root.dataset.scrollMotion;root.dataset.enhanced='fallback';});
    return()=>{cancelled=true;dispose();};
  },[ref,paused,desktop]);
}
