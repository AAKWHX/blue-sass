"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * Global page chrome — ported from the uploaded design pass.
 *
 * Both pieces are fixed, decorative and pointer-events:none, so they sit
 * outside the page's own layering entirely.
 */

/** Thin neon bar across the top showing scroll depth. RTL-aware. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 170, damping: 34, mass: 0.22 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden />;
}

/**
 * Soft light that trails the cursor. Skipped entirely for reduced-motion and
 * for coarse pointers (phones/tablets), where there is no cursor to follow.
 */
export function CursorGlow() {
  const reduced = useReducedMotion();
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, { stiffness: 120, damping: 28, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 120, damping: 28, mass: 0.35 });

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const update = (event: PointerEvent) => {
      x.set(event.clientX - 180);
      y.set(event.clientY - 180);
    };
    window.addEventListener("pointermove", update, { passive: true });
    return () => window.removeEventListener("pointermove", update);
  }, [reduced, x, y]);

  if (reduced) return null;
  return <motion.div className="cursor-glow" style={{ x: springX, y: springY }} aria-hidden />;
}
