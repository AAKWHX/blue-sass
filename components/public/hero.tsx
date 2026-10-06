"use client";
import { withExtraLocales } from "@/lib/i18n/extra-locales";

import { useI18n } from "@/components/providers";
import { AnimatedShaderHero } from "@/components/ui/animated-shader-hero";
import { solutionCopy } from "@/lib/i18n/solution-copy";

const heroLabels = withExtraLocales({
  ar: { line1: "نحوّل فكرتك", line2: "إلى منتج رقمي", secondary: "استكشف أعمالنا", trustLine: "فريق واحد يرافقك من التخطيط حتى الإطلاق." },
  en: { line1: "We turn your idea", line2: "into a digital product", secondary: "Explore our work", trustLine: "One team with you from first plan to launch." },
  nl: { line1: "Wij maken van uw idee", line2: "een digitaal product", secondary: "Bekijk ons werk", trustLine: "Eén team van eerste plan tot lancering." },
  de: { line1: "Wir machen aus Ihrer Idee", line2: "ein digitales Produkt", secondary: "Unsere Arbeit ansehen", trustLine: "Ein Team vom ersten Plan bis zum Start." },
  tr: { line1: "Fikrinizi dönüştürüyoruz", line2: "dijital bir ürüne", secondary: "Çalışmalarımız", trustLine: "İlk plandan lansmana kadar yanınızda tek ekip." },
  fr: { line1: "Nous transformons votre idée", line2: "en produit numérique", secondary: "Voir nos réalisations", trustLine: "Une équipe à vos côtés du plan au lancement." },
  es: { line1: "Convertimos su idea", line2: "en un producto digital", secondary: "Ver nuestro trabajo", trustLine: "Un equipo desde el primer plan hasta el lanzamiento." },
} as const);

export function Hero() {
  const { locale, t } = useI18n();
  const labels = heroLabels[locale];
  return <AnimatedShaderHero locale={locale} headline={{ line1: labels.line1, line2: labels.line2 }} subtitle={solutionCopy(locale).audience} primary={t.hero.ctaPrimary} secondary={labels.secondary} trustLine={labels.trustLine}/>;
}
