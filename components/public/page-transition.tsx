"use client";
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
const subscribe = () => () => {};
const ready = () => true;
const serverReady = () => false;
const publicPath = (path: string) => /^\/(ar|en|nl)(?:\/(?:services(?:\/(?:web|android|ios|windows|store|erp|ai|design))?|contact|privacy|terms|pricing))?\/?$/.test(path);
/** Only public same-origin links get a cover. Forms, auth and payment routes retain their native behavior. */
export function PublicPageTransition() {
 const hydrated=useSyncExternalStore(subscribe,ready,serverReady),pathname=usePathname(),router=useRouter();
 const previous=useRef(pathname),node=useRef<HTMLDivElement>(null),animation=useRef<Animation|null>(null),pending=useRef(false),timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const release=useCallback(()=>{animation.current?.cancel();if(node.current)node.current.style.transform='translateY(100%)';pending.current=false;if(timeout.current)clearTimeout(timeout.current);},[]);
 const uncover=useCallback(()=>{const element=node.current;if(!element)return release();animation.current?.cancel();animation.current=element.animate([{transform:'translateY(0)'},{transform:'translateY(-100%)'}],{duration:420,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'});void animation.current.finished.then(release).catch(()=>{});},[release]);
 useLayoutEffect(()=>{if(previous.current===pathname)return;previous.current=pathname;if(pending.current)uncover();},[pathname,uncover]);
 useEffect(()=>{
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!publicPath(pathname)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!link||link.hasAttribute('download')||link.target&&link.target!=='_self'||link.closest('[role=dialog],form')||link.dataset.noTransition!==undefined)return;
   const url=new URL(link.href,location.href);
   if(url.origin!==location.origin||url.pathname===pathname||url.hash||!publicPath(url.pathname)||!node.current)return;
   event.preventDefault();if(pending.current)return;pending.current=true;
   timeout.current=setTimeout(release,2200);
   animation.current=node.current.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:300,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'});
   void animation.current.finished.then(()=>{if(pending.current)router.push(url.pathname+url.search);}).catch(release);
  };
  document.addEventListener('click',click,true);
  return()=>document.removeEventListener('click',click,true);
 },[pathname,router,release]);
 useEffect(()=>()=>release(),[release]);
 if(!hydrated)return null;
 return createPortal(<div ref={node} className="bs-qa-page-curtain z-overlay" aria-hidden="true"><Image src="/blue-sass-mark.svg" alt="" width={70} height={70}/><span dir="ltr">Blue Sass</span></div>,document.body);
}