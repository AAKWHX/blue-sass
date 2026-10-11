"use client";
import { useRef } from "react";
import { useMotionActive } from "@/hooks/use-motion-active";
export type AtmosphereVariant = "hero" | "services" | "work" | "about" | "contact" | "footer";
export function StudioAtmosphere({ variant = "services" }: { variant?: AtmosphereVariant }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useMotionActive(ref);
  return <div ref={ref} aria-hidden="true" data-active={active} className={`studio-atmosphere studio-atmosphere-${variant}`}><span className="studio-light studio-light-a"/><span className="studio-light studio-light-b"/><span className="studio-orbit"/><span className="studio-grid"/></div>;
}
