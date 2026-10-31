"use client";
import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useMotionActive } from '@/hooks/use-motion-active';
type NetworkInformation = EventTarget & { saveData?: boolean; effectiveType?: string };
const connection = () => (navigator as Navigator & { connection?: NetworkInformation }).connection;
function subscribe(notify: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const network = connection(); query.addEventListener('change', notify); network?.addEventListener('change', notify);
  return () => { query.removeEventListener('change', notify); network?.removeEventListener('change', notify); };
}
const capableSnapshot = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !connection()?.saveData && !['slow-2g', '2g'].includes(connection()?.effectiveType || '');
const serverSnapshot = () => false;
/** Posters stay available. Offscreen, paused and data-saving views do not request video. */
export function ImmersiveMedia({ poster, video, paused = false, intro = false, onStart, onSettle, sourceWidth=1400 }: { poster: string; video?: string; paused?: boolean; intro?: boolean; onStart?: () => void; onSettle?: () => void; sourceWidth?:number }) {
  const ref = useRef<HTMLDivElement>(null); const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFits,setVideoFits]=useState(false);
  const active = useMotionActive(ref); const capable = useSyncExternalStore(subscribe, capableSnapshot, serverSnapshot);
  const enabled = capable && active && !paused && videoFits;
  useEffect(()=>{
    const node=ref.current;if(!node)return;
    const measure=()=>setVideoFits(node.getBoundingClientRect().width*(devicePixelRatio||1)<=sourceWidth);
    const observer=new ResizeObserver(measure);observer.observe(node);measure();
    return()=>observer.disconnect();
  },[sourceWidth]);
  useEffect(() => {
    const node = videoRef.current; if (!node) return;
    if (enabled && node.dataset.settled !== 'true') void node.play().catch(() => onSettle?.()); else node.pause();
    return () => node.pause();
  }, [enabled, onSettle]);
  return <div ref={ref} className="cinema-artwork immersive-media" data-video-enabled={enabled} aria-hidden="true">
    <Image src={poster} alt="" fill preload={intro} sizes="(max-width:767px) 120vw, 130vw" quality={92}/>
    {enabled && video && <video ref={videoRef} className="cinema-artwork-video" poster={poster} autoPlay muted loop={!intro} playsInline preload="none" tabIndex={-1}
      onPlaying={event => { event.currentTarget.dataset.playing = 'true'; onStart?.(); }}
      onTimeUpdate={event => { const node = event.currentTarget; if (!intro) return; node.playbackRate = Math.max(.45, 1 - Math.max(0, node.currentTime - 2.2) * .55); if (node.currentTime >= 3.2) { node.dataset.settled = 'true'; node.pause(); onSettle?.(); } }}
      onEnded={onSettle} onError={event => { event.currentTarget.hidden = true; onSettle?.(); }}><source src={video} type={video.endsWith('.webm') ? 'video/webm' : 'video/mp4'}/></video>}
  </div>;
}
