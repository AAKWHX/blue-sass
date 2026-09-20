"use client";

import type { CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * StageBackdrop — the hero's cinematic light rig. Pure CSS, zero WebGL.
 *
 * Layers, back to front:
 *   1. mesh-deep        — the site-wide base wash
 *   2. light-shaft      — one column of light falling from above the fold
 *   3. aurora ribbons   — two silk curtains swaying under a heavy static blur
 *   4. horizon + floor  — a neon horizon line and a perspective grid floor,
 *                         with a light pulse racing toward the viewer
 *   5. dust             — a handful of slow luminous motes
 *   6. vignette         — darkened corners so copy stays readable
 *
 * Every animated piece moves on transform/opacity only; all blurs are static.
 * Dust offsets are deterministic (no Math.random in render), phase-shifted by
 * negative animation delays so each mote follows its own path.
 */

/** Deterministic dust field — [top%, left%, duration s, delay s]. */
const DUST: ReadonlyArray<readonly [number, number, number, number]> = [
  [14, 12, 21, -2],
  [22, 84, 17, -9],
  [38, 7, 24, -14],
  [47, 91, 19, -5],
  [58, 19, 26, -11],
  [63, 74, 16, -1],
  [72, 37, 23, -17],
  [81, 60, 20, -7],
  [87, 27, 25, -12],
  [31, 52, 18, -4],
];

export function StageBackdrop() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="mesh-deep absolute inset-0" />

      {!reduced && <div className="light-shaft" />}

      {!reduced && (
        <>
          <div className="aurora-ribbon aurora-ribbon-a" />
          <div className="aurora-ribbon aurora-ribbon-b" />
        </>
      )}

      {/* Large monolithic geometry — huge faint shapes anchoring the stage.
          Static (never animated), rasterised once, pure atmosphere. */}
      <div
        aria-hidden
        className="absolute -top-[22%] start-[52%] h-[70vh] w-[70vh] -translate-x-1/2 rounded-full border border-white/[0.045]"
        style={{ maskImage: "radial-gradient(circle, black 30%, transparent 72%)", WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 72%)" }}
      />
      <div
        aria-hidden
        className="absolute top-[6%] -start-[14%] h-[58vh] w-[58vh] rotate-12 rounded-[18%] border border-white/[0.035]"
        style={{ maskImage: "radial-gradient(circle, black 25%, transparent 70%)", WebkitMaskImage: "radial-gradient(circle, black 25%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute -end-[10%] top-[24%] h-[46vh] w-[46vh] -rotate-6 border border-white/[0.03]"
        style={{ maskImage: "radial-gradient(circle, black 20%, transparent 68%)", WebkitMaskImage: "radial-gradient(circle, black 20%, transparent 68%)" }}
      />

      {/* Floor band — horizon sits at its top edge, the grid tips away below. */}
      <div className="absolute inset-x-0 bottom-0 top-[62%]">
        {/* Distant sun arc — only its top sliver rises over the horizon. */}
        <div className="horizon-glow" />
        <div className="horizon-line" />
        <div className="floor-grid" />
        {!reduced && <div className="floor-sheen" />}
        {/* Fade the floor into the base so the band edge is invisible. */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-base" />
      </div>

      {!reduced &&
        DUST.map(([top, left, duration, delay], i) => (
          <span
            key={i}
            className="dust"
            style={
              {
                top: `${top}%`,
                left: `${left}%`,
                "--dust-t": `${duration}s`,
                "--dust-d": `${delay}s`,
              } as CSSProperties
            }
          />
        ))}

      <div className="stage-vignette" />
    </div>
  );
}
