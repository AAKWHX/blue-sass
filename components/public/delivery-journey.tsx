"use client";

import { CircleCheck, Code2, Lightbulb, Palette, Rocket } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Reveal, motion } from "@/components/ui/motion";



const icons = [Lightbulb, Palette, Code2, CircleCheck, Rocket];

export function DeliveryJourney() {
  const { t } = useI18n();
  return (
    <section className="bg-black py-20 text-white sm:py-28">
      <div className="container-x">
        <Reveal className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><h2 className="max-w-xl text-4xl font-bold text-white sm:text-6xl">{t.process.title}</h2><p className="max-w-md leading-8 text-white/55">{t.process.subtitle}</p></Reveal>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {t.process.steps.map((step, index) => { const Icon = icons[index]; return <Reveal key={step.title} delay={index * .05}><motion.article whileHover={{ y: -5 }} className="group h-full rounded-2xl border border-white/15 bg-white/5 p-5 transition-colors hover:bg-white/10"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-full bg-white text-black"><Icon className="size-4"/></span><span className="font-mono text-xs text-white/35">0{index + 1}</span></div><h3 className="mt-6 text-lg font-bold text-white">{step.title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{step.desc}</p><ul className="mt-4 flex flex-wrap gap-2">{t.deliveryDetails[index].slice(0,2).map(point => <li key={point} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/70"><CircleCheck className="size-3 shrink-0"/>{point}</li>)}</ul></motion.article></Reveal>; })}
        </div>
      </div>
    </section>
  );
}
