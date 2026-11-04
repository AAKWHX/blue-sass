"use client";
import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useSyncExternalStore } from 'react';
import type { PrismRenderer } from './recovered-prism-renderer';

export type RecoveredPrismHandle = { rotate: (x: number, y: number) => void };
const subscribe=(notify:()=>void)=>{const m=matchMedia('(prefers-reduced-motion: reduce)');m.addEventListener('change',notify);return()=>m.removeEventListener('change',notify);};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const shape='M65 35H183L245 63L270 107V155L236 202L278 236L290 292L270 348L218 385H65V35ZM120 92V169H176L207 150V115L182 92H120ZM120 238V324H190L224 299V267L195 238H120Z';

/** Recovered PrismSilhouette, used only when the original renderer is unavailable. */
export function RecoveredSilhouette(){
 const id=useId();
 return <svg viewBox="0 0 320 420" fill="none" aria-hidden="true"><defs><linearGradient id={id} x1="40" y1="40" x2="295" y2="380" gradientUnits="userSpaceOnUse"><stop stopColor="#75e8ff"/><stop offset=".3" stopColor="#0a2446"/><stop offset=".65" stopColor="#183d63"/><stop offset="1" stopColor="#7763c5"/></linearGradient></defs><path d={shape} fill={`url(#${id})`} fillRule="evenodd" stroke="#71d8ff" strokeWidth="2"/><path d="M65 35L43 60V399L65 385M65 385L218 385L270 348L290 292L308 270M65 35L120 92M65 385L120 324M236 202L176 169M236 202L120 238" stroke="#8ecff1" strokeOpacity=".7" strokeWidth="1.5"/></svg>;
}

/** Original native renderer: no engine, textures, idle loop or new package. */
export const RecoveredPrism=forwardRef<RecoveredPrismHandle,{phase?:string}>(function RecoveredPrism({phase='idle'},ref){
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),renderer=useRef<PrismRenderer|null>(null);
 const rotation=useRef({x:-.1,y:-.32}),energy=useRef(0),redraw=useRef(()=>{});
 const stopped=useSyncExternalStore(subscribe,reduced,()=>true);
 useImperativeHandle(ref,()=>({rotate(x,y){rotation.current={x:x*Math.PI/180,y:y*Math.PI/180};redraw.current();}}),[]);
 useEffect(()=>{
  const node=root.current,element=canvas.current;if(!node||!element)return;
  let disposed=false,visible=false,loading=false;
  const draw=()=>{if(disposed||!visible||document.hidden)return;const fallback=node.querySelector<HTMLElement>('.recovered-prism-fallback');if(fallback)fallback.style.transform=`perspective(900px) rotateX(${rotation.current.x*180/Math.PI}deg) rotateY(${rotation.current.y*180/Math.PI}deg)`;renderer.current?.draw(rotation.current.x,rotation.current.y,energy.current);node.dataset.draws=String(Number(node.dataset.draws||0)+1);};
  redraw.current=draw;
  const load=async()=>{if(disposed||loading||renderer.current)return;loading=true;try{const {createPrismRenderer}=await import('./recovered-prism-renderer');if(disposed)return;renderer.current=createPrismRenderer(element);node.dataset.renderer=renderer.current?'webgl':'svg-fallback';if(renderer.current)node.dataset.vertices=String(renderer.current.vertices);draw();}catch{node.dataset.renderer='svg-fallback';}finally{loading=false;}};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;node.dataset.visible=String(visible);if(visible){void load();draw();}},{rootMargin:'40px'});observer.observe(node);
  const resize=new ResizeObserver(draw);resize.observe(node);
  const lost=(e:Event)=>{e.preventDefault();node.dataset.renderer='svg-fallback';};
  const restored=()=>{renderer.current?.dispose();renderer.current=null;void load();};
  element.addEventListener('webglcontextlost',lost);element.addEventListener('webglcontextrestored',restored);
  const light=(event:Event)=>{const {x,y}=(event as CustomEvent<{x:number;y:number}>).detail;if(!Number.isFinite(x)||!Number.isFinite(y))return;renderer.current?.setLighting?.(x,y);draw();};
  node.addEventListener('prism-light',light);document.addEventListener('visibilitychange',draw);
  return()=>{disposed=true;node.removeEventListener('prism-light',light);observer.disconnect();resize.disconnect();element.removeEventListener('webglcontextlost',lost);element.removeEventListener('webglcontextrestored',restored);document.removeEventListener('visibilitychange',draw);renderer.current?.dispose();renderer.current=null;redraw.current=()=>{};};
 },[]);
 useEffect(()=>{
  let frame=0;const start=performance.now();energy.current=0;
  const model=root.current?.closest<HTMLElement>('.premium-sculpture');
  if(model&&phase!=='shattering'){delete model.dataset.snapshot;model.style.removeProperty('--prism-shatter-image');}
  const tick=()=>{energy.current=stopped?0:Math.min(1,(performance.now()-start)/3000);redraw.current();if(phase==='countdown'&&!stopped&&energy.current<1&&!document.hidden)frame=requestAnimationFrame(tick);};
  if(phase==='countdown')tick();else redraw.current();
  if(phase==='shattering'&&model&&canvas.current&&renderer.current){
   renderer.current.draw(rotation.current.x,rotation.current.y,1);
   try{const image=canvas.current.toDataURL('image/png');model.style.setProperty('--prism-shatter-image',`url("${image}")`);model.dataset.snapshot='true';}catch{delete model.dataset.snapshot;}
  }
  return()=>cancelAnimationFrame(frame);
 },[phase,stopped]);
 return <div ref={root} className="recovered-prism" data-renderer="svg-fallback" aria-hidden="true"><div className="recovered-prism-fallback"><RecoveredSilhouette/></div><canvas ref={canvas}/></div>;
});
