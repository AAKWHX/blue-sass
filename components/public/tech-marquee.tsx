"use client";

import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";

/**
 * Tech constellation — an infinite dual-row marquee of the stack we ship on.
 *
 * Two rows drift in opposite directions, pause on hover, and are masked at
 * the edges so chips fade out instead of clipping. Pure CSS animation —
 * zero JS per frame, honours prefers-reduced-motion via the global override.
 */
const ROW_A = [
  "Next.js", "TypeScript", "React", "PostgreSQL", "Tailwind CSS", "Drizzle ORM",
  "Node.js", "Supabase",
];
const ROW_B = [
  "NextAuth", "Neon", "OGL / WebGL", "Framer Motion", "Zod", "Docker",
  "CI / CD", "Edge Runtime",
];

function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  // Double the list so the loop is seamless.
  const doubled = [...items, ...items];
  return (
    <div className="marquee-mask group relative overflow-hidden py-3">
      <div
        dir="ltr"
        className={`flex w-max gap-4 ${reverse ? "marquee-reverse" : "marquee-track"} group-hover:[animation-play-state:paused]`}
      >
        {doubled.map((tech, i) => (
          <span
            key={`${tech}-${i}`}
            className="chip whitespace-nowrap !px-4 !py-2 font-mono text-xs transition-colors duration-300 hover:border-neon-cyan/50 hover:text-neon-cyan"
          >
            <span className="live-dot me-1 !h-1.5 !w-1.5 bg-neon-cyan/70" />
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechMarquee() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden border-y border-line/60 bg-elevated/40 py-16">
      <div className="container-x relative z-content">
        <Reveal>
          <SectionHeading
            title={t.stack.title}
            subtitle={t.stack.subtitle}
          />
        </Reveal>
      </div>

      <Reveal delay={0.1} className="relative z-content mt-10 space-y-1">
        <MarqueeRow items={ROW_A} />
        <MarqueeRow items={ROW_B} reverse />
      </Reveal>
    </section>
  );
}
