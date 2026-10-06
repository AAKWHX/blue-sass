"use client";
import { withExtraLocales } from "@/lib/i18n/extra-locales";
import { useRef } from "react";

import { motion, useReducedMotion } from "framer-motion";
import { Code2, DraftingCompass, SearchCheck, ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/providers";
import { useMotionActive } from "@/hooks/use-motion-active";

const labels = withExtraLocales({
  ar: { title: "خبرات تعمل كفريق واحد", note: "استراتيجية · تجربة مستخدم · تطوير · جودة", items: ["STRATEGY", "UX / UI", "WEB & APPS", "AI AUTOMATION", "QUALITY"] },
  en: { title: "Specialists working as one team", note: "Strategy · user experience · engineering · quality", items: ["STRATEGY", "UX / UI", "WEB & APPS", "AI AUTOMATION", "QUALITY"] },
  nl: { title: "Specialisten als één team", note: "Strategie · gebruikerservaring · ontwikkeling · kwaliteit", items: ["STRATEGIE", "UX / UI", "WEB & APPS", "AI AUTOMATISERING", "KWALITEIT"] },
  de: { title: "Spezialisten in einem Team", note: "Strategie · Nutzererlebnis · Entwicklung · Qualität", items: ["STRATEGIE", "UX / UI", "WEB & APPS", "KI-AUTOMATION", "QUALITÄT"] },
  tr: { title: "Tek ekip olarak çalışan uzmanlar", note: "Strateji · kullanıcı deneyimi · geliştirme · kalite", items: ["STRATEJİ", "UX / UI", "WEB & APPS", "AI OTOMASYON", "KALİTE"] },
  fr: { title: "Des spécialistes réunis en une équipe", note: "Stratégie · expérience utilisateur · développement · qualité", items: ["STRATÉGIE", "UX / UI", "WEB & APPS", "AUTOMATISATION IA", "QUALITÉ"] },
  es: { title: "Especialistas en un solo equipo", note: "Estrategia · experiencia · desarrollo · calidad", items: ["ESTRATEGIA", "UX / UI", "WEB & APPS", "AUTOMATIZACIÓN IA", "CALIDAD"] },
} as const);

const icons = [DraftingCompass, SearchCheck, Code2, ShieldCheck];

export function AgencyProofStrip() {
  const { locale } = useI18n();
  const c = labels[locale];
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const motionActive = useMotionActive(sectionRef);
  const repeated = [...c.items, ...c.items];
  return <section ref={sectionRef} className="overflow-hidden border-y border-white/10 bg-black py-7 text-white"><div className="container-x flex flex-col gap-6 lg:flex-row lg:items-center">
    <div className="flex shrink-0 items-center gap-4 lg:w-80"><div className="flex -space-x-2 rtl:space-x-reverse">{icons.map((Icon,index)=><span key={index} className="grid size-10 place-items-center rounded-full border-2 border-black bg-white text-black"><Icon className="size-4"/></span>)}</div><div><h2 className="text-sm font-bold text-white">{c.title}</h2><p className="mt-1 text-[11px] text-white/45">{c.note}</p></div></div>
    <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"><motion.div className="flex w-max items-center gap-10 py-2" animate={reduceMotion || !motionActive ? { x: 0 } : { x: [0, locale === "ar" ? 520 : -520] }} transition={motionActive && !reduceMotion ? { duration: 18, repeat: Infinity, ease: "linear" } : { duration: 0 }}>{repeated.map((item,index)=><span key={`${item}-${index}`} className="whitespace-nowrap font-mono text-xs font-bold tracking-[.18em] text-white/45">{item}</span>)}</motion.div></div>
  </div></section>;
}
