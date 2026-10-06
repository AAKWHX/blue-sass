"use client";
import { withExtraLocales } from "@/lib/i18n/extra-locales";

import { useI18n } from "@/components/providers";
import { Reveal } from "@/components/ui/motion";
import { SqueezeCarousel, type SqueezeSlide } from "@/components/ui/carousel-squeeze";
import { serviceCatalog } from "@/lib/service-catalog";
import { translated } from "@/lib/i18n/project-builder";
import { solutionGroups, type SolutionKey } from "@/lib/solutions";
import { solutionCopy } from "@/lib/i18n/solution-copy";
import { serviceTemplates } from "@/lib/service-templates";
import { TemplateLivePreview } from "@/components/public/template-live-preview";

const pause = translated("إيقاف الحركة", "Pause carousel", "Carrousel pauzeren", "Karussell pausieren", "Kaydırmayı durdur", "Suspendre le défilement", "Pausar carrusel");
const play = translated("تشغيل الحركة", "Play carousel", "Carrousel afspelen", "Karussell abspielen", "Kaydırmayı başlat", "Reprendre le défilement", "Reanudar carrusel");

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
const actions = withExtraLocales({
  ar: { start: "ابدأ مشروعًا", previous: "الخدمة السابقة", next: "الخدمة التالية" },
  en: { start: "Start project", previous: "Previous service", next: "Next service" },
  nl: { start: "Start project", previous: "Vorige dienst", next: "Volgende dienst" },
  de: { start: "Projekt starten", previous: "Vorheriger Service", next: "Nächster Service" },
  tr: { start: "Proje başlat", previous: "Önceki hizmet", next: "Sonraki hizmet" },
  fr: { start: "Démarrer", previous: "Service précédent", next: "Service suivant" },
  es: { start: "Empezar", previous: "Servicio anterior", next: "Servicio siguiente" },
} as const);

const headings = withExtraLocales({
  ar: "اختر ما تريد بناءه",
  en: "Choose what you want to build",
  nl: "Kies wat u wilt bouwen",
  de: "Wählen Sie, was Sie bauen möchten",
  tr: "Ne inşa etmek istediğinizi seçin",
  fr: "Choisissez ce que vous voulez créer",
  es: "Elija lo que quiere crear",
} as const);

export function Services({ solutionsOnly = false }: { solutionsOnly?: boolean }) {
  const { locale, t } = useI18n();
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
    detailHref: `/${locale}/services/${item.slug}`,
  }));
  const groups = solutionCopy(locale);
  const homeSlides: SqueezeSlide[] = (Object.keys(solutionGroups) as SolutionKey[]).map(key => {
    const group = solutionGroups[key]; const example = serviceTemplates(locale, group.preview)[0]; const base = slides.find(slide => slide.id === group.preview)!;
    return { ...base, id: key, title: groups[key], detailHref: `/${locale}/services/${key}`, preview: <TemplateLivePreview item={example} showLabels={false}/> };
  });
  return (
    <section id="services" className="section-y scroll-mt-24 bg-black text-white">
      <div className="container-x">
        <Reveal className="text-center"><h2 className="mx-auto max-w-3xl text-4xl font-bold text-white sm:text-6xl">{headings[locale]}</h2></Reveal>

        {solutionsOnly && <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-7 text-white/60">{t.experience.templateNote}</p>}
        <Reveal className="mt-8"><SqueezeCarousel slides={solutionsOnly ? homeSlides : slides} label={t.services.title} previousLabel={action.previous} nextLabel={action.next} pauseLabel={pause[locale]} playLabel={play[locale]} /></Reveal>
      </div>
    </section>
  );
}
