"use client";

import { useSyncExternalStore } from "react";

/**
 * Full-page animated backdrop — 100% CSS, zero WebGL.
 *
 * Mounted ONCE in app/[locale]/layout.tsx as a fixed, viewport-sized layer, so
 * one continuous field sits behind every page instead of restarting at each
 * section boundary.
 *
 * The previous build ran two full-screen GLSL shaders here (AuroraGL +
 * MoltenMetal) which was the main source of jank on phones. The replacement is
 * a hand-layered CSS "aurora field": conic/radial gradient light drifting over
 * a deep mesh, plus a starfield and three blurred colour orbs. Every layer
 * animates on the GPU (transform / opacity / background-position only), costs
 * nothing on the main thread, and looks almost identical to the shader mix.
 *
 * `fixed inset-0` + `z-backdrop` (0) keeps it under all content, which is
 * lifted to `z-content`. `pointer-events-none` means it never eats clicks.
 */

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback, { passive: true });
  return () => window.removeEventListener("resize", callback);
}

/** True when the OS asks for reduced motion — freeze everything animated. */
function subscribeMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function motionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AuroraBackdrop() {
  const reduced = useSyncExternalStore(subscribeMotion, motionSnapshot, () => false);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-backdrop overflow-hidden">
      {/* Deep radial mesh — the always-present base wash. */}
      <div className="absolute inset-0 mesh-deep" />

      {/* The drifting aurora field — replaces both WebGL shaders. */}
      {!reduced && <div className="aurora-field" />}

      {/* Faint starfield drifting over everything. */}
      <div className="starfield" />

      {/* Three slow colour orbs carrying the RGB drift while scrolling. */}
      {!reduced && (
        <>
          <div className="aurora aurora-cyan animate-drift-a absolute -top-32 -start-24 h-96 w-96 blur-[100px]" />
          <div className="aurora aurora-purple animate-drift-b absolute -bottom-40 -end-28 h-[26rem] w-[26rem] blur-[120px]" />
          <div className="aurora aurora-magenta animate-drift-a absolute top-1/3 end-[12%] h-72 w-72 blur-[110px]" />
        </>
      )}
    </div>
  );
}
