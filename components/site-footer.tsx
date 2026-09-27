"use client";

import Link from "next/link";
import { ArrowUpLeft, Mail, Phone } from "lucide-react";
import { useI18n } from "@/components/providers";
import { BrandLogo } from "@/components/brand-logo";

const copy = {
  ar: { pages: "صفحات الموقع", about: "من نحن", services: "الخدمات", work: "أعمالنا", contact: "اتصل بنا", start: "ابدأ مشروعك" },
  en: { pages: "Pages", about: "About", services: "Services", work: "Work", contact: "Contact", start: "Start a project" },
  nl: { pages: "Pagina’s", about: "Over ons", services: "Diensten", work: "Werk", contact: "Contact", start: "Start een project" },
  de: { pages: "Seiten", about: "Über uns", services: "Leistungen", work: "Projekte", contact: "Kontakt", start: "Projekt starten" },
  tr: { pages: "Sayfalar", about: "Hakkımızda", services: "Hizmetler", work: "Projeler", contact: "İletişim", start: "Proje başlat" },
  fr: { pages: "Pages", about: "À propos", services: "Services", work: "Projets", contact: "Contact", start: "Démarrer" },
  es: { pages: "Páginas", about: "Nosotros", services: "Servicios", work: "Proyectos", contact: "Contacto", start: "Empezar" },
} as const;

export function SiteFooter() {
  const { locale, t } = useI18n();
  const c = copy[locale];
  const base = `/${locale}`;
  return <footer className="border-t border-white/10 bg-black text-white"><div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_.7fr_.7fr] lg:py-20">
    <div><BrandLogo className="[&>span]:!text-white"/><p className="mt-5 max-w-md text-base leading-8 text-white/60">{t.hero.subtitle}</p><Link href={`${base}/create-project`} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 font-bold text-black">{c.start}<ArrowUpLeft className="size-4 flip-x"/></Link></div>
    <div><h3 className="text-lg font-bold text-white">{c.pages}</h3><ul className="mt-5 space-y-3 text-sm text-white/60"><li><Link href={`${base}/about`} className="hover:text-neon-cyan">{c.about}</Link></li><li><Link href={`${base}/services`} className="hover:text-neon-cyan">{c.services}</Link></li><li><Link href={`${base}/projects`} className="hover:text-neon-cyan">{c.work}</Link></li><li><Link href={`${base}/contact`} className="hover:text-neon-cyan">{c.contact}</Link></li></ul></div>
    <div><h3 className="text-lg font-bold text-white">{c.contact}</h3><ul className="mt-5 space-y-4 text-sm text-white/60"><li><a href="mailto:help@bluesass.nl" className="flex items-center gap-2 hover:text-neon-cyan"><Mail className="size-4"/>help@bluesass.nl</a></li><li><a href="tel:+31634543374" dir="ltr" className="flex items-center gap-2 hover:text-neon-cyan"><Phone className="size-4"/>+31 6 3454 3374</a></li></ul></div>
  </div><div className="border-t border-white/10 py-5"><div className="container-x flex flex-col justify-between gap-3 text-xs text-white/45 sm:flex-row"><span>© {new Date().getFullYear()} Blue Sass. {t.footer.rights}</span><div className="flex gap-5"><Link href={`${base}/privacy`}>Privacy</Link><Link href={`${base}/terms`}>Terms</Link></div></div></div></footer>;
}
