"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMotionActive } from "@/hooks/use-motion-active";

export type SqueezeSlide = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  features: string[];
  primaryAction: string;
  primaryHref: string;
  secondaryAction: string;
  secondaryHref: string;
  detailHref: string;
  preview?: ReactNode;
};

export function SqueezeCarousel({
  slides,
  label,
  previousLabel,
  nextLabel,
  pauseLabel,
  playLabel,
  className,
}: {
  slides: SqueezeSlide[];
  label: string;
  previousLabel: string;
  nextLabel: string;
  pauseLabel: string;
  playLabel: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const direction = useRef(1);
  const reducedMotion = useReducedMotion();
  const carouselRef = useRef<HTMLDivElement>(null);
  const motionActive = useMotionActive(carouselRef);
  useEffect(() => {
    if (paused || interacting || reducedMotion || !motionActive || slides.length < 2) return;
    const interval = window.setInterval(() => setActive(index => {
      if (index >= slides.length - 1) direction.current = -1;
      if (index <= 0) direction.current = 1;
      return index + direction.current;
    }), 4500);
    return () => window.clearInterval(interval);
  }, [paused, interacting, reducedMotion, motionActive, slides.length]);
  const current = slides[active];

  if (!current) return null;

  return (
    <div ref={carouselRef} className={cn("service-reel relative w-full", className)} role="region" aria-label={label} onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
      <div className="service-reel-window overflow-hidden rounded-3xl" dir="ltr"><div className="service-reel-track flex gap-4" style={{ transform: `translateX(calc(${active} * (var(--service-card-width) + 1rem) * -1))` }}>
        {slides.map((slide, index) => <Button asChild key={slide.id} variant="unstyled" size="auto" className="service-reel-card group relative shrink-0 overflow-hidden rounded-3xl border border-white/15 bg-[#101216] p-0 text-start"><Link href={slide.detailHref} onFocus={() => setActive(index)} aria-label={`${slide.title}: ${slide.secondaryAction}`}>{slide.preview ? <div aria-hidden inert className="pointer-events-none absolute inset-x-4 bottom-4 top-24 overflow-hidden rounded-2xl [&>div]:h-full">{slide.preview}</div> : <><Image src={slide.image} alt={slide.imageAlt} fill sizes="(max-width: 767px) 82vw, 48vw" className="object-cover transition-transform duration-700 group-hover:scale-105"/><span className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/30"/></>}<span className="absolute inset-x-0 top-0 flex items-start justify-between gap-5 p-6 text-white" dir="auto"><span className="max-w-[80%] whitespace-normal text-2xl font-bold leading-snug sm:text-3xl">{slide.title}</span><ArrowUpRight className="mt-1 size-7 shrink-0 rounded-full border border-white/40 p-1"/></span></Link></Button>)}
      </div></div>
      <div className="absolute end-4 bottom-4 z-content flex gap-2" dir="ltr">
        <Button variant="unstyled" size="icon" className="rounded-full border border-white/30 bg-black/80 text-white" aria-label={previousLabel} onClick={() => { setPaused(true); setActive(index => (index - 1 + slides.length) % slides.length); }}><ChevronLeft className="size-4"/></Button>
        <Button variant="unstyled" size="icon" className="rounded-full border border-white/30 bg-black/80 text-white" aria-label={paused ? playLabel : pauseLabel} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play className="size-4"/> : <Pause className="size-4"/>}</Button>
        <Button variant="unstyled" size="icon" className="rounded-full border border-white/30 bg-black/80 text-white" aria-label={nextLabel} onClick={() => { setPaused(true); setActive(index => (index + 1) % slides.length); }}><ChevronRight className="size-4"/></Button>
      </div>
    </div>
  );
}
