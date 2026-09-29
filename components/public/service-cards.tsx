"use client";

import { useI18n } from "@/components/providers";
import { Reveal } from "@/components/ui/motion";
import { SqueezeCarousel, type SqueezeSlide } from "@/components/ui/carousel-squeeze";
import { serviceCatalog } from "@/lib/service-catalog";

const serviceImages = [
  "/media/service-web-3d.webp",
  "/media/service-android-3d.webp",
  "/media/service-ios-3d.webp",
  "/media/service-windows-3d.webp",
  "/media/service-store-3d.webp",
  "/media/service-erp-3d.webp",
  "/media/service-ai-3d.webp",
  "/media/service-design-3d.webp",
] as const;
const actions = {
  ar: { start: "ابدأ مشروعًا", previous: "الخدمة السابقة", next: "الخدمة التالية" },
  en: { start: "Start project", previous: "Previous service", next: "Next service" },
  nl: { start: "Start project", previous: "Vorige dienst", next: "Volgende dienst" },
  de: { start: "Projekt starten", previous: "Vorheriger Service", next: "Nächster Service" },
  tr: { start: "Proje başlat", previous: "Önceki hizmet", next: "Sonraki hizmet" },
  fr: { start: "Démarrer", previous: "Service précédent", next: "Service suivant" },
  es: { start: "Empezar", previous: "Servicio anterior", next: "Servicio siguiente" },
} as const;

export function Services() {
  const { locale, t } = useI18n();
  const ar = locale === "ar";
  const services = serviceCatalog(locale);
  const action = actions[locale];
  const slides: SqueezeSlide[] = services.map((item, index) => ({
    id: item.slug,
    title: item.title,
    description: item.description,
    image: serviceImages[index],
    imageAlt: `${item.title} — Blue Sass`,
    features: item.features,
    primaryAction: action.start,
    primaryHref: `/${locale}/quote?type=${item.quoteType}&service=${item.slug}`,
    secondaryAction: t.experience.templates,
    secondaryHref: `/${locale}/services/${item.slug}#templates`,
  }));
  return (
    <section id="services" className="section-y bg-white">
      <div className="container-x">
        <Reveal className="text-center"><span className="text-sm font-bold text-neon-magenta">✦ {ar ? "الخدمات" : t.services.title}</span><h2 className="mx-auto mt-3 max-w-3xl text-4xl font-bold text-black sm:text-6xl">{ar ? "كل ما يحتاجه مشروعك الرقمي" : t.services.subtitle}</h2><p className="mx-auto mt-5 max-w-2xl leading-8 text-ink-low">{t.hero.subtitle}</p></Reveal>

        <Reveal className="mt-12"><SqueezeCarousel slides={slides} label={t.services.title} previousLabel={action.previous} nextLabel={action.next} /></Reveal>
      </div>
    </section>
  );
}
