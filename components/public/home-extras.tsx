"use client";
import { homeFaqCopy } from "@/lib/i18n/home-faq";


import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Reveal, motion } from "@/components/ui/motion";

export function HomeFaq() {
  const { locale } = useI18n();
  const c = homeFaqCopy(locale === "ar" || locale === "nl" ? locale : "en");
  const [open, setOpen] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const questions = expanded ? c.qs : c.qs;
  return <section className="home-faq section-y bg-base"><div className="container-x grid gap-10 lg:grid-cols-[.65fr_1fr]">
    <Reveal><span className="grid size-12 place-items-center rounded-full bg-black text-white"><Plus className="size-5"/></span><h2 className="mt-5 text-4xl font-bold text-black sm:text-6xl">{c.title}</h2><p className="mt-4 max-w-sm leading-8 text-ink-low">{c.intro}</p></Reveal>
    <div className="min-w-0 space-y-3">{questions.map((q,i)=><Reveal key={q} delay={i*.04}><article className={`overflow-hidden rounded-2xl border border-black transition-colors ${open===i?"bg-neon-cyan":"bg-white"}`}><Button variant="unstyled" size="auto" type="button" aria-expanded={open===i} aria-controls={`faq-answer-${i}`} onClick={()=>setOpen(open===i?-1:i)} className="flex h-auto w-full items-center justify-between gap-4 p-5 text-start text-lg font-bold text-black hover:bg-black/[.03]"><span className="min-w-0 whitespace-normal leading-7">{q}</span><ChevronDown className={`size-5 shrink-0 transition-transform ${open===i?"rotate-180":""}`}/></Button>{open===i&&<motion.div id={`faq-answer-${i}`} initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} className="px-5 pb-5"><p className="w-full border-t border-black/15 pt-4 text-start leading-8 text-black/65 [overflow-wrap:anywhere]">{c.ans[i]}</p></motion.div>}</article></Reveal>)}<Button variant="unstyled" size="auto" onClick={()=>{setExpanded(!expanded); setOpen(0);}} className="mt-4 rounded-full border border-black bg-black px-6 py-3 font-bold text-white transition-transform hover:-translate-y-1">{expanded?c.less:c.more}</Button></div>
  </div></section>;
}

