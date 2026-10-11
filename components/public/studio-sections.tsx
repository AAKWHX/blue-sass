"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Code2, MessagesSquare, ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/providers";
import { StudioAtmosphere } from "@/components/ui/studio-atmosphere";
import { Reveal } from "@/components/ui/motion";
import { serviceCatalog } from "@/lib/service-catalog";
import { studioCopy } from "@/lib/i18n/studio";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { motion,useScroll,useReducedMotion } from "framer-motion";
export function StudioServices({all=false}:{all?:boolean}) {
 const {locale,t}=useI18n();
 const Heading=all?"h1":"h2";
 const items=serviceCatalog(locale).filter(item=>all||["web","store","erp","ai","design","android"].includes(item.slug));
 return <section id="studio-services" className="studio-section"><StudioAtmosphere variant="services"/><div className="container-x"><div className="flex flex-wrap items-end justify-between gap-6"><Heading className="studio-heading">{t.nav.services}</Heading>{!all&&<Button asChild variant="ghostNeon"><Link href={`/${locale}/services`}>{t.experience.allServices}<ArrowUpRight className="size-4 flip-x"/></Link></Button>}</div><div className="studio-services">{items.map((item,i)=><Reveal key={item.slug} delay={Math.min(i*.04,.2)}><article className="studio-service studio-card h-full"><Link href={`/${locale}/services/${item.slug}`} aria-label={item.title} className="studio-service-image"><Image src={`/media/service-${item.slug}-3d.webp`} alt={item.title} fill sizes="(min-width:768px) 33vw, 100vw"/></Link><h3>{item.title}</h3><p>{item.description}</p><Link href={`/${locale}/services/${item.slug}`}><span>{t.experience.details}</span><ArrowUpRight className="size-5 flip-x"/></Link></article></Reveal>)}</div></div></section>;
}
export function StudioWhy() {
 const {locale,t}=useI18n(); const c=studioCopy(locale);const icons=[Code2,MessagesSquare,ShieldCheck];
 const descriptions=[t.process.steps[1].desc,t.process.steps[0].desc,t.process.steps[3].desc];
 return <section className="studio-section"><StudioAtmosphere variant="about"/><div className="container-x"><h2 className="studio-heading">{c.why}</h2><div className="studio-value-grid mt-10">{c.values.map((title,i)=>{const Icon=icons[i];return <Reveal key={title} delay={i*.06}><article className="studio-card h-full"><Icon className="size-7 text-neon-cyan"/><h3>{title}</h3><p>{descriptions[i]}</p></article></Reveal>;})}</div><Button asChild variant="ghostNeon" className="mt-8"><Link href={`/${locale}/about`}>{t.common.learnMore}<ArrowUpRight className="size-4 flip-x"/></Link></Button></div></section>;
}
export function StudioProcess() {
 const {locale,t}=useI18n();const c=studioCopy(locale);
 const ref=useRef<HTMLDivElement>(null);const reduced=useReducedMotion();const {scrollYProgress}=useScroll({target:ref,offset:["start .85","end .3"]});
 const descriptions=[t.deliveryDetails[0][0],t.process.steps[0].desc,t.process.steps[1].desc,t.process.steps[2].desc,t.process.steps[3].desc,t.deliveryDetails[4][1],t.deliveryDetails[4][2]];
 return <section id="process" className="studio-section"><StudioAtmosphere variant="work"/><div className="container-x"><h2 className="studio-heading">{c.process}</h2><div ref={ref} className="studio-timeline"><motion.div aria-hidden className="studio-process-progress" style={{scaleY:reduced?1:scrollYProgress}}/>{c.steps.map((title,i)=><Reveal key={title} delay={Math.min(i*.035,.15)}><article><span className="studio-number">{String(i+1).padStart(2,"0")}</span><h3>{title}</h3><p>{descriptions[i]}</p>{i===6&&<Button asChild variant="ghostNeon" className="mt-4"><Link href={`/${locale}/subscriptions`}>{t.experience.options}</Link></Button>}</article></Reveal>)}</div></div></section>;
}
