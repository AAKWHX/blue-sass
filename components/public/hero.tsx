"use client";

import { useI18n } from "@/components/providers";
import { AnimatedShaderHero } from "@/components/ui/animated-shader-hero";

const heroLabels = {
  ar: { line1: "أطلق فكرتك", line2: "إلى عالم رقمي أقوى", secondary: "استكشف خدماتنا" },
  en: { line1: "Launch your idea", line2: "into a stronger digital world", secondary: "Explore our services" },
  nl: { line1: "Lanceer uw idee", line2: "in een sterkere digitale wereld", secondary: "Ontdek onze diensten" },
  de: { line1: "Starten Sie Ihre Idee", line2: "in eine stärkere digitale Welt", secondary: "Leistungen entdecken" },
  tr: { line1: "Fikrinizi başlatın", line2: "daha güçlü bir dijital dünyaya", secondary: "Hizmetleri keşfet" },
  fr: { line1: "Lancez votre idée", line2: "dans un monde numérique plus fort", secondary: "Découvrir nos services" },
  es: { line1: "Lance su idea", line2: "a un mundo digital más sólido", secondary: "Explorar servicios" },
} as const;

export function Hero() {
  const { locale, t } = useI18n();
  const labels = heroLabels[locale];
  return <AnimatedShaderHero locale={locale} badge={t.hero.badge} headline={{ line1: labels.line1, line2: labels.line2 }} subtitle={t.hero.subtitle} primary={t.hero.ctaPrimary} secondary={labels.secondary}/>;
}
