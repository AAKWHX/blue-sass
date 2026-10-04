"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Reveal, motion } from "@/components/ui/motion";

const copy = {
  ar: ["عن بلو ساس", "من الفكرة إلى منتج يعمل", "نحوّل أهدافك إلى تجربة رقمية سريعة وواضحة وقابلة للنمو، بقرار واحد وفريق واحد.", "فريق واحد للتصميم والتطوير", "تجربة واضحة على كل شاشة", "دعم مستمر بعد الإطلاق"],
  en: ["About Blue Sass", "From idea to a product that works", "We turn your goals into a fast, clear and scalable digital experience with one accountable team.", "One design and development team", "A clear experience on every screen", "Ongoing support after launch"],
  nl: ["Over Blue Sass", "Van idee naar een product dat werkt", "Wij vertalen uw doelen naar een snelle, heldere en schaalbare digitale ervaring met één verantwoordelijk team.", "Eén ontwerp- en ontwikkelteam", "Helder op ieder scherm", "Doorlopende ondersteuning"],
  de: ["Über Blue Sass", "Von der Idee zum funktionierenden Produkt", "Wir verwandeln Ihre Ziele mit einem Team in ein schnelles, klares und skalierbares digitales Erlebnis.", "Ein Team für Design und Entwicklung", "Klar auf jedem Bildschirm", "Support nach dem Launch"],
  tr: ["Blue Sass hakkında", "Fikirden çalışan ürüne", "Hedeflerinizi tek bir sorumlu ekiple hızlı, net ve ölçeklenebilir bir dijital deneyime dönüştürüyoruz.", "Tek tasarım ve geliştirme ekibi", "Her ekranda net deneyim", "Lansman sonrası destek"],
  fr: ["À propos de Blue Sass", "De l’idée au produit qui fonctionne", "Nous transformons vos objectifs en une expérience rapide, claire et évolutive avec une seule équipe responsable.", "Une seule équipe design et développement", "Clair sur chaque écran", "Support continu"],
  es: ["Sobre Blue Sass", "De la idea a un producto que funciona", "Convertimos sus objetivos en una experiencia rápida, clara y escalable con un único equipo responsable.", "Un equipo de diseño y desarrollo", "Claridad en cada pantalla", "Soporte continuo"],
} as const;

export function CompanySection() {
  const { locale } = useI18n();
  const c = copy[locale];
  return <section id="about" className="section-y scroll-mt-24 bg-black text-white"><div className="container-x grid items-center gap-12 lg:grid-cols-2">
    <Reveal><h2 className="max-w-2xl text-4xl font-bold leading-tight text-white sm:text-6xl">{c[1]}</h2><p className="mt-5 max-w-xl leading-8 text-white/60">{c[2]}</p><ul className="mt-8 space-y-4">{c.slice(3).map(item => <li key={item} className="flex items-center gap-3 text-white/80"><CheckCircle2 className="size-5 text-neon-cyan"/>{item}</li>)}</ul><div className="mt-9 flex flex-wrap gap-3"><Button asChild variant="neon" size="lg"><Link href={`/${locale}/about`}>{c[0]}<ArrowUpLeft className="size-4 flip-x"/></Link></Button><Button asChild variant="outline" size="lg" className="border-white/40 bg-black/30 text-white hover:bg-white/15 hover:text-white"><Link href={`/${locale}/contact`}>{locale === "ar" ? "تواصل معنا" : "Contact us"}</Link></Button></div></Reveal>
    <Reveal delay={.1} className="relative"><span className="absolute -end-5 -top-5 size-40 rounded-full bg-neon-cyan"/><motion.div whileHover={{ rotate: -1, scale: 1.01 }} className="relative overflow-hidden rounded-[2rem] border-2 border-white"><Image src="/media/product-journey-v2.png" alt={locale === "ar" ? "مراحل بناء منتج رقمي من الاستراتيجية إلى الإطلاق" : "Digital product journey from strategy to launch"} width={1536} height={1024} className="h-auto w-full"/></motion.div></Reveal>
  </div></section>;
}
