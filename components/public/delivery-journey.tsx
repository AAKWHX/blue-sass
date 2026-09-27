"use client";

import { ArrowDown, CircleCheck, Code2, Lightbulb, Palette, Rocket } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Reveal, motion } from "@/components/ui/motion";



const icons = [Lightbulb, Palette, Code2, CircleCheck, Rocket];

export function DeliveryJourney() {
  const { t } = useI18n();
  return (
    <section className="section-y bg-base">
      <div className="container-x">
        <Reveal className="text-center"><span className="text-sm font-bold text-neon-magenta">✦ {t.nav.process}</span><h2 className="mt-3 text-4xl font-bold text-black sm:text-6xl">{t.process.title}</h2><p className="mx-auto mt-5 max-w-2xl leading-8 text-ink-low">{t.process.subtitle}</p></Reveal>
        <div className="relative mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {t.process.steps.map((step, index) => { const Icon = icons[index]; return <Reveal key={step.title} delay={index * .06}><motion.article whileHover={{ y: -7, rotate: index % 2 ? .6 : -.6 }} className={`relative h-full min-h-72 rounded-2xl border border-black p-5 ${index === 4 ? "bg-neon-cyan" : "bg-white"}`}><span className="grid size-12 place-items-center rounded-full bg-black text-white"><Icon className="size-5"/></span><span className="absolute end-5 top-5 font-mono text-xs font-black">0{index + 1}</span><h3 className="mt-12 text-xl font-bold text-black">{step.title}</h3><p className="mt-3 text-sm leading-7 text-black/65">{step.desc}</p><ul className="mt-5 space-y-3 border-t border-black/10 pt-5">{t.deliveryDetails[index].map(point => <li key={point} className="flex gap-2 text-xs leading-6 text-black/80"><CircleCheck className="mt-1 size-3.5 shrink-0"/>{point}</li>)}</ul>{index < 4 && <ArrowDown className="absolute -bottom-3 end-6 z-10 size-6 rounded-full border border-black bg-neon-cyan p-1 text-black xl:-end-3 xl:bottom-6 xl:-rotate-90"/>}</motion.article></Reveal>; })}
        </div>
      </div>
    </section>
  );
}
