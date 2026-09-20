"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import clsx from "clsx";

/* ------------------------------------------------------------------ */
/* Scroll reveal                                                       */
/* ------------------------------------------------------------------ */

/* Transform + opacity only — animating `filter: blur()` forces a repaint of
   every revealed card on the main thread, which is exactly the kind of jank we
   just removed with the WebGL purge. Same visual idea, zero repaints. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const Component = motion[as] as typeof motion.div;
  /* Re-animates both ways: reveals when the block scrolls in (either
     direction) and folds back when it leaves the viewport. */
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.25 }}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function StaggerGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={staggerParent}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Animated count-up                                                   */
/* ------------------------------------------------------------------ */

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1900,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo — fast, satisfying settle
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setDone(true);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span
      ref={ref}
      /* The NUMBER stays exact — only its light keeps moving. `counter-live`
         re-pans the gradient and pulses the glow forever, so the stat never
         looks frozen once the count-up lands. */
      className={clsx("tabular", done && "counter-live", className)}
    >
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 3D tilt card                                                        */
/* ------------------------------------------------------------------ */

export function TiltCard({
  children,
  className,
  intensity = 10,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springCfg = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), springCfg);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), springCfg);
  const glowX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(y, [-0.5, 0.5], ["0%", "100%"]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="perspective">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY }}
        className={clsx("preserve-3d relative", className)}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 [.group:hover_&]:opacity-100"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([gx, gy]) =>
                `radial-gradient(340px circle at ${gx} ${gy}, rgba(255,255,255,0.09), transparent 65%)`,
            ),
          }}
        />
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Spotlight that follows the cursor across a section                  */
/* ------------------------------------------------------------------ */

/**
 * Spotlight that follows the cursor across a section. Implemented with motion
 * values (no React re-renders on mousemove) and a spring for a silky trail.
 * The gradient itself is static — the light moves via transform on a fixed-
 * sized layer, which stays entirely on the compositor.
 */
export function Spotlight({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(50);
  const y = useMotionValue(20);
  const springX = useSpring(x, { stiffness: 90, damping: 22, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 90, damping: 22, mass: 0.5 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth) * 100);
      y.set((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced, x, y]);

  return (
    <motion.div
      aria-hidden
      className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <motion.div
        className="absolute left-0 top-0 h-[560px] w-[560px] rounded-full"
        style={{
          x: springX,
          y: springY,
          /* Static centring offsets instead of translate — framer-motion owns
             `transform` here (x/y), so the offset must not live in it. */
          marginLeft: -280,
          marginTop: -280,
          background: "radial-gradient(280px circle, rgba(255,255,255,0.06), transparent 62%)",
        }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Pressable — subtle bounce on tap for CTAs                           */
/* ------------------------------------------------------------------ */

export function Pressable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }} className={clsx("inline-flex", className)}>
      {children}
    </motion.div>
  );
}

export { motion };
