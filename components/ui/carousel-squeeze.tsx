"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
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
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-ink-low" aria-live="polite">{active + 1} / {slides.length} · {current.title}</p>
        <div className="flex gap-2" dir="ltr">
          <Button type="button" variant="outline" size="icon" aria-label={previousLabel} onClick={() => move(-1)}><ChevronLeft className="size-4" /></Button>
          <Button type="button" variant="neon" size="icon" aria-label={nextLabel} onClick={() => move(1)}><ChevronRight className="size-4" /></Button>
        </div>
      </div>

      <div role="tablist" aria-label={label} className="hidden h-[clamp(300px,34vw,470px)] gap-2 overflow-hidden md:flex" dir="ltr">
        {slides.map((slide, index) => {
          const selected = index === active;
          return (
            <Button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="service-slide-detail"
              variant="unstyled"
              size="auto"
              onClick={() => setActive(index)}
              onFocus={() => setActive(index)}
              className={cn(
                "group relative h-full min-w-0 basis-0 overflow-hidden rounded-2xl border border-black/15 bg-surface p-0 text-start shadow-sm transition-[flex-grow,border-radius] duration-700 ease-out focus-visible:ring-2 focus-visible:ring-neon-blue",
                selected ? "rounded-[2rem]" : "hover:rounded-3xl",
              )}
              style={{ flexGrow: selected ? 8 : 0.62 }}
            >
              <Image src={slide.image} alt={selected ? slide.imageAlt : ""} fill sizes={selected ? "70vw" : "10vw"} className="object-cover" />
              <span className={cn("absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent transition-opacity", selected ? "opacity-100" : "opacity-55 group-hover:opacity-75")} />
              <span className={cn("absolute inset-x-0 bottom-0 p-5 text-white transition-opacity duration-300", selected ? "opacity-100" : "opacity-0")} dir="auto">
                <span className="block text-2xl font-black sm:text-3xl">{slide.title}</span>
              </span>
              {!selected ? <span aria-hidden className="absolute inset-x-0 bottom-5 flex justify-center"><span className="size-2 rounded-full bg-white shadow" /></span> : null}
            </Button>
          );
        })}
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 md:hidden" dir="ltr">
        {slides.map((slide, index) => (
          <Button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            variant="unstyled"
            size="auto"
            onClick={() => setActive(index)}
            className={cn("relative h-64 w-[82vw] max-w-[420px] shrink-0 snap-center overflow-hidden rounded-3xl border p-0", index === active ? "border-black shadow-xl" : "border-black/15")}
          >
            <Image src={slide.image} alt={slide.imageAlt} fill sizes="82vw" className="object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-5 text-start text-xl font-black text-white" dir="auto">{slide.title}</span>
          </Button>
        ))}
      </div>

      <div id="service-slide-detail" role="tabpanel" className="mt-6 grid gap-6 rounded-3xl border border-black/15 bg-[#fffdfa] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h3 className="text-2xl font-black text-black sm:text-3xl">{current.title}</h3>
          <p className="mt-3 max-w-3xl leading-8 text-ink-low">{current.description}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {current.features.map((feature) => <li key={feature} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold text-black"><Check className="size-3.5 text-neon-blue" />{feature}</li>)}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href={current.secondaryHref}>{current.secondaryAction}</Link></Button>
          <Button asChild variant="neon"><Link href={current.primaryHref}>{current.primaryAction}</Link></Button>
        </div>
      </div>
    </div>
  );
}
