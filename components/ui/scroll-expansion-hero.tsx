"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollExpandMediaProps {
  mediaSrc: string;
  mediaAlt: string;
  title: string;
  eyebrow?: string;
  scrollToExpand: string;
  titleClassName?: string;
  children?: ReactNode;
}

export function ScrollExpandMedia({
  mediaSrc,
  mediaAlt,
  title,
  scrollToExpand,
  titleClassName,
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

  const characters = Array.from(title);
  const visibleProgress = reduceMotion ? 1 : progress;
  const visibleExpanded = Boolean(reduceMotion) || expanded;
  const startScale = mobile ? 0.76 : 0.64;
  const scale = startScale + visibleProgress * (1 - startScale);
  const reveal = Math.min(1, Math.max(0, (visibleProgress - 0.08) / 0.82));

  return (
    <section className="relative overflow-x-clip bg-base" aria-label={title}>
      <div className="relative min-h-[100dvh] overflow-hidden bg-[#050608]">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-backdrop"
          animate={{ opacity: reveal, scale: 1.18 - reveal * 0.18 }}
          transition={{ duration: 0.12, ease: "linear" }}
        >
          <Image src={mediaSrc} alt="" fill priority quality={92} sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,8,.12),rgba(5,6,8,.34))]" />
          <motion.div className="absolute -inset-[20%] bg-[radial-gradient(circle_at_30%_35%,rgba(255,255,255,.12),transparent_28%),linear-gradient(120deg,transparent_35%,rgba(255,255,255,.08),transparent_65%)]" animate={reduceMotion ? undefined : { x: ["-4%", "4%", "-4%"], y: ["2%", "-2%", "2%"], rotate: [-1, 1, -1] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>

        <div className="absolute inset-0 z-content">
          <motion.div
            className="absolute left-1/2 top-1/2 h-[100dvh] w-screen overflow-hidden bg-[#050608] shadow-[0_30px_100px_rgba(20,68,130,.24)]"
            style={{ transform: `translate(-50%, -50%) scale(${scale})`, opacity: reveal }}
          >
            <Image src={mediaSrc} alt={mediaAlt} fill priority quality={92} sizes="100vw" className="object-contain object-center md:object-cover" />
            <motion.div className="absolute inset-0 bg-black" animate={{ opacity: 0.72 - reveal * 0.54 }} transition={{ duration: 0.12 }} />
          </motion.div>

          <motion.span aria-hidden className="absolute left-[10%] top-[22%] size-20 rounded-full border border-neon-blue/35" animate={reduceMotion ? undefined : { rotate: [0, 180, 360], scale: [1, 1.12, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} />
          <motion.span aria-hidden className="absolute bottom-[18%] right-[12%] size-12 rounded-[1rem] bg-neon-cyan/55" animate={reduceMotion ? undefined : { rotate: [0, -18, 0], y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
          <motion.span aria-hidden className="absolute right-[20%] top-[19%] size-3 rounded-full bg-neon-blue shadow-[0_0_28px_rgba(36,115,255,.7)]" animate={reduceMotion ? undefined : { scale: [1, 1.8, 1], opacity: [0.55, 1, 0.55] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />

          <div className="pointer-events-none absolute inset-0 grid place-items-center px-5 text-center">
            <div className="w-full">
              <div className="relative mx-auto max-w-6xl">
              <motion.h1 className={cn("absolute inset-0 text-[clamp(2.4rem,7vw,7.4rem)] font-black leading-[1.02] tracking-[-.055em] text-white [text-shadow:0_18px_60px_rgba(0,0,0,.65)]", titleClassName)} animate={{ opacity: Math.max(0, 1 - visibleProgress * 10), scale: 1 - visibleProgress * .035 }}>{title}</motion.h1>
              <h1 className={cn("text-[clamp(2.4rem,7vw,7.4rem)] font-black leading-[1.02] tracking-[-.055em] text-white [text-shadow:0_18px_60px_rgba(0,0,0,.65)]", titleClassName)} aria-label={title}>
                {characters.map((character, index) => {
                  const angle = ((index * 137.5) % 360) * Math.PI / 180;
                  const distance = visibleProgress * (mobile ? 78 : 92);
                  const x = Math.cos(angle) * distance;
                  const y = Math.sin(angle) * distance * (mobile ? 0.9 : 0.76);
                  const rotation = ((index % 7) - 3) * visibleProgress * 18;
                  const depth = ((index * 83) % 440 - 220) * visibleProgress;
                  const tiltX = ((index % 5) - 2) * visibleProgress * 22;
                  const tiltY = ((index % 9) - 4) * visibleProgress * 14;
                  return <motion.span aria-hidden key={`${character}-${index}`} className="inline-block will-change-transform" style={{ transform: `perspective(900px) translate3d(${x}vw, ${y}vh, ${depth}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${rotation}deg)`, opacity: Math.min(1, visibleProgress * 16) * Math.max(0, 1 - visibleProgress * 1.16), transformOrigin: "center" }}>{character === " " ? "\u00a0" : character}</motion.span>;
                })}
              </h1>
              </div>
            </div>
          </div>

          <motion.div
            className="absolute inset-x-0 bottom-7 flex justify-center px-5"
            animate={{ opacity: 1 - visibleProgress * 1.5, y: visibleProgress * 28 }}
          >
            <p className="rounded-full border border-white/20 bg-black/55 px-5 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm sm:text-sm">
              {scrollToExpand} ↓
            </p>
          </motion.div>
        </div>
      </div>

      {children ? <motion.div
        aria-hidden={!visibleExpanded}
        inert={!visibleExpanded ? true : undefined}
        className="container-x relative z-content py-14 sm:py-20"
        animate={{ opacity: visibleExpanded ? 1 : 0, y: visibleExpanded ? 0 : 28 }}
        transition={{ duration: reduceMotion ? 0 : 0.55 }}
      >
        {children}
      </motion.div> : null}
    </section>
  );
}
