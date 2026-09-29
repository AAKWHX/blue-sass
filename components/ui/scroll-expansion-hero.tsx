"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollExpandMediaProps {
  mediaSrc: string;
  bgImageSrc: string;
  mediaAlt: string;
  backgroundAlt?: string;
  title: string;
  eyebrow?: string;
  scrollToExpand: string;
  children: ReactNode;
}

export function ScrollExpandMedia({
  mediaSrc,
  bgImageSrc,
  mediaAlt,
  backgroundAlt = "",
  title,
  eyebrow,
  scrollToExpand,
  children,
}: ScrollExpandMediaProps) {
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [mobile, setMobile] = useState(false);
  const progressRef = useRef(progress);
  const expandedRef = useRef(expanded);
  const touchY = useRef<number | null>(null);

  const applyProgress = useCallback((next: number) => {
    const bounded = Math.min(1, Math.max(0, next));
    progressRef.current = bounded;
    setProgress(bounded);
    const complete = bounded >= 0.995;
    expandedRef.current = complete;
    setExpanded(complete);
  }, []);

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const onWheel = (event: globalThis.WheelEvent) => {
      if (window.scrollY > 8) return;
      if (!expandedRef.current) {
        event.preventDefault();
        applyProgress(progressRef.current + event.deltaY * 0.00115);
      } else if (event.deltaY < -8) {
        event.preventDefault();
        applyProgress(Math.max(0, 1 + event.deltaY * 0.00115));
      }
    };
    const onTouchStart = (event: globalThis.TouchEvent) => {
      touchY.current = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event: globalThis.TouchEvent) => {
      const previous = touchY.current;
      const current = event.touches[0]?.clientY;
      if (previous === null || current === undefined || window.scrollY > 8) return;
      const delta = previous - current;
      if (!expandedRef.current || delta < -10) {
        event.preventDefault();
        applyProgress(progressRef.current + delta * 0.006);
        touchY.current = current;
      }
    };
    const onTouchEnd = () => { touchY.current = null; };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (window.scrollY > 8) return;
      const forward = event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ";
      const backward = event.key === "ArrowUp" || event.key === "PageUp";
      if (!forward && !backward) return;
      if (!expandedRef.current || backward) {
        event.preventDefault();
        applyProgress(progressRef.current + (forward ? 0.25 : -0.25));
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [applyProgress, reduceMotion]);

  const words = title.trim().split(/\s+/);
  const firstWord = words.shift() ?? "";
  const remainingTitle = words.join(" ");
  const visibleProgress = reduceMotion ? 1 : progress;
  const visibleExpanded = Boolean(reduceMotion) || expanded;
  const startScale = mobile ? 0.58 : 0.34;
  const scale = startScale + visibleProgress * (1 - startScale);
  const titleShift = visibleProgress * (mobile ? 62 : 48);

  return (
    <section className="relative overflow-x-clip bg-base" aria-label={title}>
      <div className="relative min-h-[100dvh] overflow-hidden">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-backdrop"
          animate={{ opacity: 0.82 - visibleProgress * 0.64, scale: 1 + visibleProgress * 0.08 }}
          transition={{ duration: 0.12, ease: "linear" }}
        >
          <Image src={bgImageSrc} alt={backgroundAlt} fill priority sizes="100vw" className="object-cover opacity-75" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.86),rgba(232,240,255,.48)_52%,rgba(255,255,255,.86))]" />
        </motion.div>

        <div className="absolute inset-0 z-content">
          <motion.div
            className="absolute start-1/2 top-1/2 h-[min(72vh,720px)] w-[min(92vw,1180px)] overflow-hidden rounded-[2rem] border border-black/15 bg-white/85 shadow-[0_30px_100px_rgba(20,68,130,.24)]"
            style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
          >
            <Image src={mediaSrc} alt={mediaAlt} fill priority sizes="(max-width: 768px) 92vw, 1180px" className="object-contain p-3 sm:p-8" />
            <motion.div className="absolute inset-0 bg-black" animate={{ opacity: 0.12 - visibleProgress * 0.1 }} transition={{ duration: 0.12 }} />
          </motion.div>

          <div className="pointer-events-none absolute inset-0 grid place-items-center px-5 text-center">
            <div className="w-full">
              {eyebrow ? (
                <motion.p
                  className="mb-5 text-xs font-black uppercase tracking-[.22em] text-black/70 sm:text-sm"
                  animate={{ opacity: 1 - visibleProgress * 1.4 }}
                >
                  {eyebrow}
                </motion.p>
              ) : null}
              <div className="space-y-2 text-[clamp(2.4rem,7vw,7.4rem)] font-black leading-[.92] tracking-[-.055em] text-black">
                <motion.h1 style={{ transform: `translateX(${-titleShift}vw)` }}>{firstWord}</motion.h1>
                <motion.p style={{ transform: `translateX(${titleShift}vw)` }}>{remainingTitle}</motion.p>
              </div>
            </div>
          </div>

          <motion.div
            className="absolute inset-x-0 bottom-7 flex justify-center px-5"
            animate={{ opacity: 1 - visibleProgress * 1.5, y: visibleProgress * 28 }}
          >
            <p className="rounded-full border border-black/15 bg-white/80 px-5 py-2.5 text-xs font-bold text-black shadow-lg backdrop-blur-sm sm:text-sm">
              {scrollToExpand} ↓
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        aria-hidden={!visibleExpanded}
        inert={!visibleExpanded ? true : undefined}
        className="container-x relative z-content py-14 sm:py-20"
        animate={{ opacity: visibleExpanded ? 1 : 0, y: visibleExpanded ? 0 : 28 }}
        transition={{ duration: reduceMotion ? 0 : 0.55 }}
      >
        {children}
      </motion.div>
    </section>
  );
}
