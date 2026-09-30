"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
};

export function SqueezeCarousel({
  slides,
  label,
  previousLabel,
  nextLabel,
  className,
}: {
  slides: SqueezeSlide[];
  label: string;
  previousLabel: string;
  nextLabel: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const current = slides[active];
  const move = (amount: number) => setActive((index) => (index + amount + slides.length) % slides.length);

  if (!current) return null;

  return (
    <div className={cn("w-full", className)}>
      <div role="tablist" aria-label={label} className="hidden h-[clamp(300px,34vw,470px)] gap-2 overflow-hidden md:flex" dir="ltr">
        {slides.map((slide, index) => {
          const selected = index === active;
          return (
            <Button asChild key={slide.id} variant="unstyled" size="auto" className={cn("group relative h-full min-w-0 basis-0 overflow-hidden rounded-2xl border border-black/15 bg-surface p-0 text-start shadow-sm transition-[flex-grow,border-radius] duration-700 ease-out focus-visible:ring-2 focus-visible:ring-neon-blue", selected ? "rounded-[2rem]" : "hover:rounded-3xl")} style={{ flexGrow: selected ? 8 : 0.62 }}>
              <Link href={slide.detailHref} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} aria-label={`${slide.title} — ${slide.secondaryAction}`}>
              <Image src={slide.image} alt={selected ? slide.imageAlt : ""} fill sizes={selected ? "70vw" : "10vw"} className="object-cover" />
              <span className={cn("absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent transition-opacity", selected ? "opacity-100" : "opacity-55 group-hover:opacity-75")} />
              <span className={cn("absolute inset-x-0 bottom-0 p-5 text-white transition-opacity duration-300", selected ? "opacity-100" : "opacity-0")} dir="auto">
                <span className="block text-2xl font-black sm:text-3xl">{slide.title}</span>
              </span>
              {!selected ? <span aria-hidden className="absolute inset-x-0 bottom-5 flex justify-center"><span className="size-2 rounded-full bg-white shadow" /></span> : null}
              </Link>
            </Button>
          );
        })}
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 md:hidden" dir="ltr">
        {slides.map((slide, index) => (
          <Button asChild key={slide.id} variant="unstyled" size="auto" className={cn("relative h-64 w-[82vw] max-w-[420px] shrink-0 snap-center overflow-hidden rounded-3xl border p-0", index === active ? "border-black shadow-xl" : "border-black/15")}>
            <Link href={slide.detailHref} onFocus={() => setActive(index)} aria-label={`${slide.title} — ${slide.secondaryAction}`}>
            <Image src={slide.image} alt={slide.imageAlt} fill sizes="82vw" className="object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-5 text-start text-xl font-black text-white" dir="auto">{slide.title}</span>
            </Link>
          </Button>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-center justify-center gap-3">
        <div className="flex gap-2" dir="ltr">
          <Button type="button" variant="outline" size="icon" className="rounded-full" aria-label={previousLabel} onClick={() => move(-1)}><ChevronLeft className="size-4" /></Button>
          <Button type="button" variant="neon" size="icon" className="rounded-full" aria-label={nextLabel} onClick={() => move(1)}><ChevronRight className="size-4" /></Button>
        </div>
        <p className="text-sm font-bold text-ink-low" aria-live="polite">{active + 1} / {slides.length} · {current.title}</p>
      </div>
    </div>
  );
}
