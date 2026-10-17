"use client";
import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { publicMotionPath } from '@/lib/public-scene-engine';

/** App Router owns history; only unmodified public navigation gets the visual cover. */
export function PublicPageTransition() {
  const pathname=usePathname();const router=useRouter();const previous=useRef(pathname);
  const node=useRef<HTMLDivElement>(null);const animation=useRef<Animation|null>(null);const locked=useRef(false);const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
  const release=useCallback(()=>{animation.current?.cancel();if(node.current)node.current.style.transform='translateY(100%)';locked.current=false;if(timeout.current)clearTimeout(timeout.current);},[]);
  const uncover=useCallback(()=>{
    if(!node.current)return release();animation.current?.cancel();
    animation.current=node.current.animate([{transform:'translateY(0)'},{transform:'translateY(-100%)'}],{duration:480,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'});
    void animation.current.finished.then(()=>{release();const title=document.querySelector<HTMLElement>('main h1');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}).catch(()=>{});
  },[release]);
  useLayoutEffect(()=>{
    if(previous.current===pathname)return;const wasPublic=publicMotionPath(previous.current);previous.current=pathname;
    if(!wasPublic||!publicMotionPath(pathname)||matchMedia('(prefers-reduced-motion: reduce)').matches)return release();
    uncover();
  },[pathname,release,uncover]);
  useEffect(()=>{
    const click=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!publicMotionPath(pathname)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
      if(!link||link.hasAttribute('download')||link.target&&link.target!=='_self'||link.closest('[role=dialog],form')||link.dataset.noTransition!==undefined)return;
      const url=new URL(link.href,location.href);
      if(url.origin!==location.origin||url.pathname===pathname||url.hash||!publicMotionPath(url.pathname)||!/^\/(ar|en|nl)(\/|$)/.test(url.pathname)||!node.current)return;
      event.preventDefault();if(locked.current)return;locked.current=true;
      timeout.current=setTimeout(uncover,2400);
      animation.current=node.current.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'});
      void animation.current.finished.then(()=>router.push(url.pathname+url.search)).catch(release);
    };
    document.addEventListener('click',click,true);
    return()=>{document.removeEventListener('click',click,true);};
  },[pathname,router,release,uncover]);
  useEffect(()=>()=>release(),[release]);
  return <div ref={node} className="bs-page-curtain z-overlay" aria-hidden="true"><Image src="/blue-sass-mark.svg" alt="" width={72} height={72}/><span dir="ltr">Blue Sass</span></div>;
}
