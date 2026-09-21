"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Code2, Globe2, Smartphone, Sparkles } from "lucide-react";
import { useI18n } from "@/components/providers";

/**
 * HeroVisual — the hero lights, WITHOUT WebGL and without a core object.
 *
 * Vercel-style treatment: clean neutral light on a grey/black stage. The old
 * ogl shaders AND the later reactor/lens rig are gone — what remains is pure
 * light: a breathing white glow, ghost rings, ember sparks, and a distant sun
 * arc clipped by the horizon (mounted inside the floor band in StageBackdrop).
 *
 * Everything animates on transform/opacity only; blurs are static; honours
 * prefers-reduced-motion by freezing the parallax.
 */
export function HeroVisual() {
  const reduce = useReducedMotion();
  const { locale } = useI18n();
  const ar = locale === "ar";

  return (
    <div aria-label={ar ? "تصميم مواقع وتطبيقات وأنظمة ذكية" : "Websites, apps and intelligent systems"} className="relative mx-auto h-[min(88vw,430px)] w-[min(88vw,500px)] select-none">
      <div className="hero-glow absolute inset-[10%]" />
      <motion.div animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-x-[5%] top-[12%] overflow-hidden rounded-2xl border border-white/20 bg-[#101216]/95 shadow-2xl [transform:perspective(900px)_rotateY(-8deg)_rotateX(4deg)]">
        <div className="flex h-9 items-center gap-1.5 border-b border-line px-4"><i className="size-2 rounded-full bg-white/30"/><i className="size-2 rounded-full bg-white/20"/><i className="size-2 rounded-full bg-white/10"/><span className="ms-3 text-[9px] text-ink-low">bluesass.nl</span></div>
        <div className="grid grid-cols-[1.2fr_.8fr] gap-4 p-5"><div><span className="text-[9px] font-semibold uppercase tracking-widest text-neon-cyan">Blue Sass Studio</span><p className="mt-2 text-xl font-black leading-tight">{ar ? "نحوّل فكرتك إلى منتج رقمي جاهز للنمو" : "We turn your idea into a digital product built to grow"}</p><div className="mt-4 h-7 w-24 rounded-lg bg-white text-center text-[9px] font-bold leading-7 text-black">{ar ? "ابدأ مشروعك" : "Start a project"}</div></div><div className="grid place-items-center rounded-xl border border-line bg-white/[0.03]"><Globe2 className="size-14 text-white/80"/></div></div>
      </motion.div>
      <motion.div animate={reduce ? undefined : { y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[5%] end-[5%] h-48 w-24 rounded-[1.5rem] border-4 border-[#252932] bg-[#0b0d10] p-2 shadow-2xl [transform:perspective(800px)_rotateY(-12deg)]"><div className="h-full rounded-[1rem] bg-gradient-to-b from-white/15 to-transparent p-2"><Smartphone className="mx-auto mt-4 size-7"/><div className="mt-5 space-y-2"><i className="block h-2 rounded bg-white/20"/><i className="block h-2 w-3/4 rounded bg-white/10"/><i className="mt-4 block h-8 rounded-lg bg-white/90"/></div></div></motion.div>
      <div className="absolute bottom-[13%] start-[3%] space-y-2"><div className="flex items-center gap-2 rounded-xl border border-line bg-[#101216]/95 px-3 py-2 text-[10px] shadow-xl"><Code2 className="size-4 text-neon-cyan"/>{ar ? "تطوير آمن وسريع" : "Fast, secure build"}</div><div className="flex items-center gap-2 rounded-xl border border-line bg-[#101216]/95 px-3 py-2 text-[10px] shadow-xl"><Sparkles className="size-4 text-neon-cyan"/>{ar ? "تصميم وتجربة مستخدم" : "Design & user experience"}</div></div>
    </div>
  );
}
