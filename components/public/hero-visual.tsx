"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 1, 0.55]);

  return (
    <motion.div
      ref={sectionRef}
      aria-hidden
      style={reduce ? undefined : { y, rotate, opacity }}
      className="pointer-events-none relative mx-auto h-[min(78vw,420px)] w-[min(78vw,420px)] select-none"
    >
      {/* ---------- Breathing white glow ---------- */}
      <div className="hero-glow absolute inset-[10%]" />

      {/* ---------- Ghost rings ---------- */}
      <span className="hero-ring hero-ring-a" />
      <span className="hero-ring hero-ring-b" />
      <span className="hero-ring hero-ring-c" />

      {/* ---------- Orbiting embers ---------- */}
      <span className="hero-spark hero-spark-1" />
      <span className="hero-spark hero-spark-2" />
      <span className="hero-spark hero-spark-3" />
      <span className="hero-spark hero-spark-4" />
    </motion.div>
  );
}
