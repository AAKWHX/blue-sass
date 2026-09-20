"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

/**
 * Lightweight canvas starfield / particle network.
 * Pauses when off-screen and respects prefers-reduced-motion.
 */
export function ParticleField({ className, density = 60 }: { className?: string; density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let running = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const particles: { x: number; y: number; vx: number; vy: number; r: number; hue: number }[] = [];

    function resize() {
      const parent = canvas!.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles.length = 0;
      const count = Math.min(density, Math.round((width * height) / 16000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.6 + 0.4,
          hue: Math.random() > 0.5 ? 186 : 262,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 95%, 65%, 0.7)`;
        ctx!.fill();
      }

      // constellation links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 130) {
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.strokeStyle = `hsla(190, 95%, 65%, ${(1 - dist / 130) * 0.14})`;
            ctx!.lineWidth = 0.6;
            ctx!.stroke();
          }
        }
      }

      if (running && !reduced) raf = requestAnimationFrame(draw);
    }

    resize();
    seed();
    draw();

    const onResize = () => {
      resize();
      seed();
    };
    window.addEventListener("resize", onResize);

    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !reduced) raf = requestAnimationFrame(draw);
    });
    observer.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [density]);

  return <canvas ref={canvasRef} aria-hidden className={clsx("pointer-events-none absolute inset-0", className)} />;
}
