"use client";

import { useReducedMotion } from "framer-motion";

/**
 * LineForms — huge concentric line rings on the hero stage, in the spirit of
 * "abstract black / white ring" poster art: dozens of hairline strokes that
 * read as one glowing sculptural form.
 *
 * Two clusters sit off-frame left and right, plus one behind the headline.
 * Each cluster is a static stack of borders (rasterised once — zero runtime
 * cost); the only animation is a slow lighting phase (opacity) per cluster,
 * so the rings appear to glow in turns. Frozen entirely for reduced motion.
 */

/** One concentric stack: N hairline rings with an even spacing gap. */
function RingStack({ rings, gap, className }: { rings: number; gap: number; className?: string }) {
  return (
    <div aria-hidden className={`absolute ${className ?? ""}`}>
      {Array.from({ length: rings }, (_, i) => (
        <span
          key={i}
          className="absolute rounded-full border border-white/[0.14]"
          style={{ inset: `${i * gap}%` }}
        />
      ))}
    </div>
  );
}

export function LineForms() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Left cluster — tall ring tower bleeding off-frame. */}
      <div
        className={reduced ? "" : "animate-[form-breathe-a_14s_ease-in-out_infinite]"}
        style={reduced ? undefined : { willChange: "opacity" }}
      >
        <RingStack
          rings={22}
          gap={1.6}
          className="-start-[24%] top-[2%] h-[96vh] w-[64vh] aspect-auto"
        />
      </div>

      {/* Right cluster — slightly tighter, phase-shifted lighting. */}
      <div
        className={reduced ? "" : "animate-[form-breathe-b_18s_ease-in-out_infinite]"}
        style={reduced ? undefined : { willChange: "opacity" }}
      >
        <RingStack
          rings={26}
          gap={1.4}
          className="-end-[26%] -top-[8%] h-[110vh] w-[74vh] aspect-auto"
        />
      </div>

      {/* Centre echo — a single wide ring crown behind the headline area. */}
      <div
        className={reduced ? "" : "animate-[form-breathe-c_22s_ease-in-out_infinite]"}
        style={reduced ? undefined : { willChange: "opacity" }}
      >
        <RingStack
          rings={16}
          gap={2.4}
          className="start-1/2 top-[-30%] h-[80vh] w-[120vh] -translate-x-1/2 aspect-auto"
        />
      </div>
    </div>
  );
}
