"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Reveal, motion } from "@/components/ui/motion";

const copy = {
  ar: ["عن بلو ساس", "نحن لا نبني صفحات فقط، بل نصنع تجربة رقمية كاملة تخدم هدف مشروعك وتحوّل الزائر إلى عميل.", "فريق واحد للتصميم والتطوير", "تجربة واضحة على كل شاشة", "دعم مستمر بعد الإطلاق"],
  en: ["About Blue Sass", "We do not just build pages. We create complete digital experiences that serve your business and turn visitors into customers.", "One design and development team", "A clear experience on every screen", "Ongoing support after launch"],
  nl: ["Over Blue Sass", "Wij bouwen complete digitale ervaringen die uw bedrijf ondersteunen en bezoekers omzetten in klanten.", "Eén ontwerp- en ontwikkelteam", "Helder op ieder scherm", "Doorlopende ondersteuning"],
  de: ["Über Blue Sass", "Wir schaffen vollständige digitale Erlebnisse, die Ihr Unternehmen unterstützen und Besucher in Kunden verwandeln.", "Ein Team für Design und Entwicklung", "Klar auf jedem Bildschirm", "Support nach dem Launch"],
  tr: ["Blue Sass hakkında", "İşinizi destekleyen ve ziyaretçileri müşterilere dönüştüren eksiksiz dijital deneyimler oluşturuyoruz.", "Tek tasarım ve geliştirme ekibi", "Her ekranda net deneyim", "Lansman sonrası destek"],
  fr: ["À propos de Blue Sass", "Nous créons des expériences numériques complètes qui servent votre activité et transforment les visiteurs en clients.", "Une seule équipe design et développement", "Clair sur chaque écran", "Support continu"],
  es: ["Sobre Blue Sass", "Creamos experiencias digitales completas que impulsan su negocio y convierten visitantes en clientes.", "Un equipo de diseño y desarrollo", "Claridad en cada pantalla", "Soporte continuo"],
} as const;

export function CompanySection() {
  const { locale } = useI18n();
  const c = copy[locale];
  return <section className="section-y bg-black text-white"><div className="container-x grid items-center gap-12 lg:grid-cols-2">
    <Reveal><span className="text-sm font-bold text-neon-cyan">✦ {c[0]}</span><h2 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-6xl">{c[1]}</h2><ul className="mt-8 space-y-4">{c.slice(2).map(item => <li key={item} className="flex items-center gap-3 text-white/80"><CheckCircle2 className="size-5 text-neon-cyan"/>{item}</li>)}</ul><div className="mt-9 flex flex-wrap gap-3"><Button asChild variant="neon" size="lg"><Link href={`/${locale}/about`}>{c[0]}<ArrowUpLeft className="size-4 flip-x"/></Link></Button><Button asChild variant="unstyled" size="auto" className="rounded-xl border border-white px-6 py-3 font-bold text-white hover:bg-white hover:text-black"><Link href={`/${locale}/contact`}>{locale === "ar" ? "تواصل معنا" : "Contact us"}</Link></Button></div></Reveal>
    <Reveal delay={.1} className="relative"><span className="absolute -end-5 -top-5 size-40 rounded-full bg-neon-cyan"/><motion.div whileHover={{ rotate: -1, scale: 1.01 }} className="relative overflow-hidden rounded-[2rem] border-2 border-white"><Image src="/media/teamwork-3d.webp" alt={locale === "ar" ? "فريق بلو ساس يعمل على تجربة رقمية" : "Blue Sass team creating a digital experience"} width={1536} height={1024} className="h-auto w-full"/></motion.div></Reveal>
  </div></section>;
}
