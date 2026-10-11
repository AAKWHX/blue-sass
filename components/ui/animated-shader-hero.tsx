"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMotionActive } from "@/hooks/use-motion-active";
import { StudioAtmosphere } from "@/components/ui/studio-atmosphere";
export interface AnimatedShaderHeroProps { locale:string; headline:{line1:string;line2:string}; subtitle:string; primary:string; secondary:string; trustLine:string; scrollLabel?:string; }
export function AnimatedShaderHero({locale,headline,subtitle,primary,secondary,trustLine,scrollLabel}:AnimatedShaderHeroProps) {
  const ref=useRef<HTMLElement>(null);
  const active=useMotionActive(ref);
  const reduced=useReducedMotion();
  const entrance=reduced?false:{opacity:0,y:18};
  return <section ref={ref} data-motion-active={active} className="studio-hero">
    <StudioAtmosphere variant="hero"/>
    <div className="studio-hero-film" aria-hidden="true">
      <Image src="/media/hero-chrome-ribbon-v1.webp" alt="" fill preload sizes="(max-width:767px) 900px, 100vw" quality={75}/>
      <div className="studio-hero-film-shade"/>
      <span className="studio-hero-horizon"/>
    </div>
    <div className="container-x">
      <div className="studio-hero-grid">
        <div className="studio-hero-copy">
          <motion.h1 initial={entrance} animate={{opacity:1,y:0}} transition={{duration:.7}}>{headline.line1}<span>{headline.line2}</span></motion.h1>
          <motion.p className="studio-deck" initial={entrance} animate={{opacity:1,y:0}} transition={{duration:.6,delay:.12}}>{subtitle}</motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" initial={entrance} animate={{opacity:1,y:0}} transition={{duration:.6,delay:.2}}>
            <Button asChild variant="neon" size="lg"><Link href={`/${locale}/create-project`}>{primary}<ArrowUpRight className="size-4 flip-x"/></Link></Button>
            <Button asChild variant="ghostNeon" size="lg"><Link href={`/${locale}/projects`}>{secondary}</Link></Button>
          </motion.div>
        </div>
      </div>
      <div className="studio-hero-bottom"><p>{trustLine}</p><a className="studio-scroll" href="#studio-services"><span aria-hidden/>{scrollLabel??primary}<ArrowUpRight className="size-4 flip-x"/></a></div>
    </div>
  </section>;
}
