"use client";

import { useI18n } from "@/components/providers";
import { ScrollExpandMedia } from "@/components/ui/scroll-expansion-hero";

const heroLabels = {
  ar: { studio: "استوديو منتجات رقمية", scroll: "مرّر لتفكيك الفكرة وكشف التجربة", media: "منظومة رقمية متكاملة من Blue Sass" },
  en: { studio: "Digital product studio", scroll: "Scroll to reveal the experience", media: "Blue Sass digital product ecosystem" },
  nl: { studio: "Digitale productstudio", scroll: "Scroll om de ervaring te onthullen", media: "Digitaal productecosysteem van Blue Sass" },
  de: { studio: "Studio für digitale Produkte", scroll: "Scrollen, um das Erlebnis zu enthüllen", media: "Digitales Produktökosystem von Blue Sass" },
  tr: { studio: "Dijital ürün stüdyosu", scroll: "Deneyimi ortaya çıkarmak için kaydırın", media: "Blue Sass dijital ürün ekosistemi" },
  fr: { studio: "Studio de produits numériques", scroll: "Faites défiler pour révéler l’expérience", media: "Écosystème de produits numériques Blue Sass" },
  es: { studio: "Estudio de productos digitales", scroll: "Desplácese para revelar la experiencia", media: "Ecosistema de productos digitales Blue Sass" },
} as const;

export function Hero() {
  const { locale, t } = useI18n();
  const labels = heroLabels[locale];
  return (
    <ScrollExpandMedia
      mediaSrc="/media/hero-ecosystem-v2.png"
      mediaAlt={labels.media}
      title={t.hero.title}
      eyebrow={`Blue Sass · ${labels.studio}`}
      scrollToExpand={labels.scroll}
      titleClassName={locale === "ar" ? "text-[clamp(2.15rem,5.35vw,5.9rem)] leading-[1.06] tracking-[-.035em]" : undefined}
    />
  );
}
