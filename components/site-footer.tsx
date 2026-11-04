"use client";
import { withExtraLocales } from "@/lib/i18n/extra-locales";
import { localizeForLocale } from "@/lib/i18n/extra-locales";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { useI18n } from "@/components/providers";
import { BlueSassSeal } from "@/components/blue-sass-seal";
import { publishedWork, validWork } from "@/lib/public-work";
import { immersiveCopy } from "@/lib/i18n/immersive";
import { StudioAtmosphere } from "@/components/ui/studio-atmosphere";
import { FooterRibbon } from "@/components/footer-ribbon";
import { openCertifiedConsentManager } from "@/components/adsense";
import { Button } from "@/components/ui/button";

const copy = withExtraLocales({
  ar: { pages: "صفحات الموقع",  services: "الخدمات",   work: "أعمالنا",  contact: "اتصل بنا", start: "ابدأ مشروعك" },
  en: { pages: "Pages",  services: "Services",   work: "Work",  contact: "Contact", start: "Start a project" },
  nl: { pages: "Pagina’s",  services: "Diensten",   work: "Werk",  contact: "Contact", start: "Start een project" },
  de: { pages: "Seiten",  services: "Leistungen",   work: "Projekte",  contact: "Kontakt", start: "Projekt starten" },
  tr: { pages: "Sayfalar",  services: "Hizmetler",   work: "Projeler",  contact: "İletişim", start: "Proje başlat" },
  fr: { pages: "Pages",  services: "Services",   work: "Projets",  contact: "Contact", start: "Démarrer" },
  es: { pages: "Páginas",  services: "Servicios",   work: "Proyectos",  contact: "Contacto", start: "Empezar" },
} as const);

export function SiteFooter() {
  const { locale, t } = useI18n();
  const c = copy[locale];
  const base = `/${locale}`;
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === base || pathname === `${base}/`;
  return <footer className={`studio-footer border-t border-white/10 text-white ${isHome ? 'cinema-footer' : ''}`}><StudioAtmosphere variant="footer"/><FooterRibbon locale={locale === 'ar' || locale === 'nl' ? locale : 'en'}/><div className="container-x grid gap-12 pb-16 md:grid-cols-2 lg:grid-cols-[1.3fr_.7fr_.7fr] lg:pb-20">
    <div><BlueSassSeal href={base} caption={immersiveCopy(locale).seal}/><p className="mt-5 max-w-md text-base leading-8 text-white/60">{t.hero.subtitle}</p></div>
    <div><h3 className="text-lg font-bold text-white">{c.pages}</h3><ul className="mt-5 space-y-3 text-sm text-white/60"><li><Link href={`${base}/services`} className="hover:text-neon-cyan">{c.services}</Link></li>{publishedWork.some(validWork) && <li><Link href={`${base}/work`} className="hover:text-neon-cyan">{c.work}</Link></li>}<li><Link href={`${base}/contact`} className="hover:text-neon-cyan">{c.contact}</Link></li></ul></div>
    <div><h3 className="text-lg font-bold text-white">{c.contact}</h3><ul className="mt-5 space-y-4 text-sm text-white/60"><li><a href="mailto:help@bluesass.nl" className="flex items-center gap-2 hover:text-neon-cyan"><Mail className="size-4"/>help@bluesass.nl</a></li><li><a href="tel:+31634543374" dir="ltr" className="flex items-center gap-2 hover:text-neon-cyan"><Phone className="size-4"/>+31 6 3454 3374</a></li><li><Link href={`${base}/contact#inquiry`} className="hover:text-neon-cyan">{c.start}</Link></li></ul></div>
  </div><div className="container-x footer-glitch-wrap"><p className="footer-glitch" data-text="Blue Sass" dir="ltr">Blue Sass</p></div><div className="border-t border-white/10 py-5"><div className="container-x flex flex-col justify-between gap-3 text-xs text-white/65 sm:flex-row"><span>© {new Date().getFullYear()} Blue Sass. {t.footer.rights}</span><div className="flex flex-wrap gap-5"><Link href={`${base}/privacy`}>{locale === "ar" ? "الخصوصية" : locale === "nl" ? "Privacybeleid" : localizeForLocale("Privacy Policy", locale)}</Link><Link href={`${base}/terms`}>{locale === "ar" ? "شروط الاستخدام" : locale === "nl" ? "Gebruiksvoorwaarden" : localizeForLocale("Terms of Service", locale)}</Link><Button variant="unstyled" size="auto" type="button" onClick={() => { if (!openCertifiedConsentManager()) router.push(`${base}/privacy`); }} className="text-xs text-white/65 hover:text-neon-cyan">{locale === "ar" ? "إعدادات الخصوصية والإعلانات" : locale === "nl" ? "Privacy- en advertentie-instellingen" : "Privacy & ad settings"}</Button></div></div></div></footer>;
}

