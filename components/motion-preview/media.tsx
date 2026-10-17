"use client";
import Image from 'next/image';
import { useRef, useSyncExternalStore } from 'react';
import { useMotionActive } from '@/hooks/use-motion-active';
type Network = EventTarget & { saveData?: boolean; effectiveType?: string };
const network = () => (navigator as Navigator & { connection?: Network }).connection;
const snapshot = () => !matchMedia('(prefers-reduced-motion: reduce)').matches && !network()?.saveData && !['slow-2g','2g'].includes(network()?.effectiveType || '');
function subscribe(notify: () => void) { const query = matchMedia('(prefers-reduced-motion: reduce)');const net = network();query.addEventListener('change',notify);net?.addEventListener('change',notify);return () => {query.removeEventListener('change',notify);net?.removeEventListener('change',notify);}; }
const serverSnapshot = () => false;
export function PreviewMedia({ image, video, active = true, priority = false }: { image: string; video?: string; active?: boolean; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null); const visible = useMotionActive(ref); const capable = useSyncExternalStore(subscribe,snapshot,serverSnapshot);
  return <div ref={ref} className="mp-media" aria-hidden="true"><Image src={image} alt="" fill sizes="100vw" quality={75} preload={priority}/>{video && active && visible && capable && <video muted autoPlay loop playsInline preload="none" poster={image} tabIndex={-1} onError={e => { e.currentTarget.hidden = true; }}><source src={video} type="video/webm"/></video>}</div>;
}
