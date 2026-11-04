"use client";
import Image from "next/image";
export type AtmosphereVariant = "hero" | "services" | "work" | "about" | "contact" | "footer";
export function StudioAtmosphere({ variant = "services" }: { variant?: AtmosphereVariant }) {
  return <div aria-hidden="true" data-active="false" className={`studio-atmosphere studio-atmosphere-${variant}`}>{variant === 'footer' && <Image src="/media/higgsfield/hero-titanium-v1.webp" alt="" fill sizes="100vw" quality={75} className="studio-footer-art"/>}<span className="studio-light studio-light-a"/><span className="studio-light studio-light-b"/></div>;
}
