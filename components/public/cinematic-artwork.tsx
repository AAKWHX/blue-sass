"use client";

import Image from 'next/image';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useMotionActive } from '@/hooks/use-motion-active';

const videoQuery = '(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (hover: hover)';
type NetworkInformation = EventTarget & { saveData?: boolean; effectiveType?: string };
const connection = () => (navigator as Navigator & { connection?: NetworkInformation }).connection;
function subscribe(notify: () => void) {
  const query = window.matchMedia(videoQuery);
  const network = connection();
  query.addEventListener('change', notify);
  network?.addEventListener('change', notify);
  return () => { query.removeEventListener('change', notify); network?.removeEventListener('change', notify); };
}
function canPlayVideo() {
  const network = connection();
  return window.matchMedia(videoQuery).matches && !network?.saveData && !['slow-2g', '2g'].includes(network?.effectiveType || '') && Boolean(document.createElement('video').canPlayType('video/webm;codecs="vp9"'));
}
const serverSnapshot = () => false;

/** The generated poster is always available; video is fetched only while eligible and visible. */
export function CinematicArtwork({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = useMotionActive(ref);
  const capable = useSyncExternalStore(subscribe, canPlayVideo, serverSnapshot);
  const enabled = capable && active && !paused;
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    video.muted = true;
    void video.play().catch(() => { delete video.dataset.playing; });
    return () => { video.pause(); };
  }, [enabled]);
  return <div ref={ref} className="cinema-artwork" data-video-enabled={enabled} aria-hidden="true">
    <Image src="/media/higgsfield/hero-titanium-v1.webp" alt="" fill preload sizes="(max-width:767px) 100vw, (max-width:1699px) 800px, 1000px" quality={85}/>
    {enabled && <video ref={videoRef} className="cinema-artwork-video" poster="/media/higgsfield/hero-titanium-v1.webp" autoPlay muted loop playsInline preload="none" tabIndex={-1}
      onPlaying={event => { event.currentTarget.dataset.playing = 'true'; }}
      onPause={event => { delete event.currentTarget.dataset.playing; }}
      onError={event => { event.currentTarget.hidden = true; event.currentTarget.pause(); }}><source src="/media/higgsfield/hero-titanium-v1.webm" type="video/webm"/></video>}
  </div>;
}
