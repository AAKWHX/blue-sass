"use client";
import { useEffect, useRef, type RefObject } from 'react';

const chapters = [0.05, 2, 5, 7.98];
const projects = [5, 6.05, 7.1];

/** One reversible timeline owns the prototype. Context revert also removes its pin spacer. */
export function useMotionPreview(root: RefObject<HTMLDivElement | null>, paused: boolean, rtl: boolean, onScene: (scene: number) => void) {
  const trigger = useRef<{ start: number; end: number } | null>(null);
  useEffect(() => {
    const node = root.current;
    if (!node || paused) return;
    let disposed = false;
    let dispose = () => {};
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const compact = innerWidth < 1024;
        const side = rtl ? -1 : 1;
        const stage = node.querySelector<HTMLElement>('.mp-stage')!;
        const panels = Array.from(node.querySelectorAll<HTMLElement>('[data-scene]'));
        const cards = [0, 1, 2].map(i => node.querySelector<HTMLElement>(`[data-service-card="${i}"]`)!);
        const studies = Array.from(node.querySelectorAll<HTMLElement>('[data-study]'));
        const track = node.querySelector<HTMLElement>('.mp-project-track')!;
        const viewport = node.querySelector<HTMLElement>('.mp-project-viewport')!;
        const bar = node.querySelector<HTMLElement>('.mp-progress-fill')!;
        let lastScene = -1;
        const measure = () => {
          const header = document.querySelector('header');
          const offset = (header?.getBoundingClientRect().height || 80) + 64;
          node.style.setProperty('--mp-offset', `${offset}px`);
          return offset;
        };
        measure();
        node.dataset.enhanced = 'true';
        gsap.set(panels.slice(1), { yPercent: 100 });
        cards.forEach((card, i) => gsap.set(card, { x: side * i * (compact ? 18 : 42), y: i * 18, rotation: side * i * 6 }));
        const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
          id: 'blue-sass-motion-preview', trigger: node.querySelector('.mp-story'), pin: stage,
          start: () => `top top+=${measure()}`, end: () => `+=${innerHeight * (innerWidth < 1024 ? 5.5 : 6.5)}`,
          scrub: 0.45, anticipatePin: 1, invalidateOnRefresh: true,
          onRefresh: self => { trigger.current = self; node.dataset.start = String(self.start); node.dataset.end = String(self.end); },
        } });
        timeline.to('.mp-hero-media', { scale: 0.78, yPercent: -10, rotationY: -8 * side, rotation: -3 * side, duration: 1.8 }, 0)
          .to('.mp-hero-copy', { y: -55, scale: 0.92, duration: 1.8 }, 0)
          .to(panels[0], { scale: 0.92, yPercent: -6, duration: 0.9 }, 0.9)
          .to(panels[1], { yPercent: 0, duration: 0.9 }, 0.9)
          .to(cards[0], { y: -170, x: -side * 80, rotation: -side * 12, scale: 0.86, opacity: 0, duration: 0.6 }, 2.35)
          .to(cards[1], { x: 0, y: 0, rotation: 0, duration: 0.6 }, 2.35)
          .to(cards[1], { y: -170, x: -side * 80, rotation: -side * 12, scale: 0.86, opacity: 0, duration: 0.6 }, 3.4)
          .to(cards[2], { x: 0, y: 0, rotation: 0, duration: 0.6 }, 3.4)
          .to(panels[1], { scale: 0.94, yPercent: -8, duration: 0.75 }, 4.25)
          .to(panels[2], { yPercent: 0, duration: 0.75 }, 4.25)
          .to(track, { x: () => (rtl ? 1 : -1) * Math.max(0, track.scrollWidth - viewport.clientWidth), duration: 2.1 }, 5)
          .to(panels[2], { scale: 0.95, yPercent: -10, duration: 0.8 }, 7.2)
          .to(panels[3], { yPercent: 0, duration: 0.8 }, 7.2);
        studies.forEach((study, i) => timeline.fromTo(study.querySelector('.mp-project-media'), { scale: 0.87 }, { scale: 1, duration: 0.7 }, 4.95 + i * 0.8));
        timeline.fromTo('.mp-light', { opacity: 0.2, scale: 0.8, xPercent: -20 }, { opacity: 0.8, scale: 1.3, xPercent: 20, duration: 4 }, 0);
        const sync = () => {
          const time = timeline.time();
          const scene = time < 1.75 ? 0 : time < 4.95 ? 1 : time < 7.65 ? 2 : 3;
          const service = time < 2.95 ? 0 : time < 4 ? 1 : 2;
          const project = time < 5.65 ? 0 : time < 6.55 ? 1 : 2;
          node.dataset.progress = (time / 8).toFixed(3);
          node.dataset.scene = String(scene);
          node.dataset.service = String(service);
          node.dataset.project = String(project);
          bar.style.transform = `scaleX(${time / 8})`;
          panels.forEach((panel, i) => { panel.inert = i !== scene; panel.setAttribute('aria-hidden', String(i !== scene)); panel.dataset.sceneActive = String(i === scene); });
          cards.forEach((card, i) => { card.inert = i !== service; });
          studies.forEach((study, i) => { study.inert = i !== project; });
          if (scene !== lastScene) { lastScene = scene; onScene(scene); }
        };
        timeline.eventCallback('onUpdate', sync);
        sync();
        node.dataset.triggerCount = String(ScrollTrigger.getAll().filter(t => t.vars.id === 'blue-sass-motion-preview').length);
        return () => {
          trigger.current = null;
          delete node.dataset.enhanced;
          delete node.dataset.triggerCount;
          delete node.dataset.progress;
          [...panels, ...cards, ...studies].forEach(el => { el.inert = false; el.removeAttribute('aria-hidden'); });
          bar.style.removeProperty('transform');
        };
      }, node);
      dispose = () => media.revert();
    }).catch(() => { node.dataset.fallback = 'true'; });
    return () => { disposed = true; dispose(); };
  }, [root, paused, rtl, onScene]);
  const seek = (time: number, selector: string) => {
    const current = trigger.current;
    if (current) window.scrollTo({ top: current.start + time / 8 * (current.end - current.start), behavior: 'instant' });
    else root.current?.querySelector(selector)?.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  return { jumpTo: (i: number) => seek(chapters[i], `[data-scene="${i}"]`), jumpProject: (i: number) => seek(projects[i], `[data-study="${i}"]`) };
}
