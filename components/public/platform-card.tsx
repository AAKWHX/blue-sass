"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function PlatformCard({ children, index }: { children: ReactNode; index: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 160, damping: 24 });
  const rotateY = useSpring(y, { stiffness: 160, damping: 24 });
  function move(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(-((event.clientY - rect.top) / rect.height - .5) * 5);
    y.set(((event.clientX - rect.left) / rect.width - .5) * 5);
  }
  return <motion.div ref={ref} className="platform-card-stage" onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }} initial={false} whileInView={reduced ? undefined : { opacity: [0.75, 1], y: [16, 0] }} viewport={{ once: true, amount: .15 }} transition={{ delay: index * .045, duration: .4 }} whileTap={reduced ? undefined : { scale: .99 }} style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}>{children}</motion.div>;
}
