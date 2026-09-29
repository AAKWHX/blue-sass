"use client";

import Link from "next/link";
import { ArrowUpLeft, Check } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { ScrollExpandMedia } from "@/components/ui/scroll-expansion-hero";

const heroLabels = {
  ar: { studio: "استوديو منتجات رقمية", scroll: "مرّر لتوسيع التجربة", about: "من نحن", consultation: "استشارة أولية مجانية لمشروعك", team: "تصميم وتطوير وتسليم من فريق واحد", media: "أجهزة ومنتجات رقمية ثلاثية الأبعاد من Blue Sass" },
  en: { studio: "Digital product studio", scroll: "Scroll to expand the experience", about: "About us", consultation: "Free initial project consultation", team: "Design, development and delivery by one team", media: "Blue Sass 3D digital products and devices" },
  nl: { studio: "Digitale productstudio", scroll: "Scroll om de ervaring te vergroten", about: "Over ons", consultation: "Gratis eerste projectadvies", team: "Ontwerp, ontwikkeling en oplevering door één team", media: "3D digitale producten en apparaten van Blue Sass" },
  de: { studio: "Studio für digitale Produkte", scroll: "Scrollen, um die Ansicht zu erweitern", about: "Über uns", consultation: "Kostenlose Erstberatung", team: "Design, Entwicklung und Übergabe aus einer Hand", media: "3D-Digitalprodukte und Geräte von Blue Sass" },
  tr: { studio: "Dijital ürün stüdyosu", scroll: "Deneyimi genişletmek için kaydırın", about: "Hakkımızda", consultation: "Ücretsiz ilk proje görüşmesi", team: "Tek ekipten tasarım, geliştirme ve teslim", media: "Blue Sass 3D dijital ürünleri ve cihazları" },
  fr: { studio: "Studio de produits numériques", scroll: "Faites défiler pour agrandir l’expérience", about: "À propos", consultation: "Première consultation gratuite", team: "Conception, développement et livraison par une seule équipe", media: "Produits et appareils numériques 3D Blue Sass" },
  es: { studio: "Estudio de productos digitales", scroll: "Desplácese para ampliar la experiencia", about: "Nosotros", consultation: "Primera consulta gratuita", team: "Diseño, desarrollo y entrega con un solo equipo", media: "Productos y dispositivos digitales 3D de Blue Sass" },
} as const;

export function Hero() {
  const { locale, t } = useI18n();
  const labels = heroLabels[locale];
  const points = [t.process.steps[0].title, t.process.steps[1].title, t.process.steps[2].title];

  return (
    <ScrollExpandMedia
      mediaSrc="/media/blue-sass-hero-3d.webp"
      bgImageSrc="/media/teamwork-3d.webp"
      mediaAlt={labels.media}
      title={t.hero.title}
      eyebrow={`Blue Sass · ${labels.studio}`}
      scrollToExpand={labels.scroll}
      titleClassName={locale === "ar" ? "text-[clamp(2.15rem,5.35vw,5.9rem)] leading-[1.06] tracking-[-.035em]" : undefined}
    >
      <div className="grid items-center gap-8 rounded-[2rem] border border-black/15 bg-white/90 p-6 shadow-xl shadow-blue-950/10 sm:p-10 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <span className="text-sm font-black text-neon-blue">Blue Sass · {labels.studio}</span>
          <h2 className="mt-4 text-3xl font-black leading-tight text-black sm:text-5xl">{t.hero.title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-ink-low sm:text-lg">{t.hero.subtitle}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="neon" size="lg"><Link href={`/${locale}/create-project`}>{t.hero.ctaPrimary}<ArrowUpLeft className="size-4 flip-x" /></Link></Button>
            <Button asChild variant="ghostNeon" size="lg"><Link href={`/${locale}/about`}>{labels.about}</Link></Button>
          </div>
        </div>
        <div className="space-y-3">
          {points.map((point) => <div key={point} className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-bold text-black"><Check className="size-4 shrink-0 text-neon-blue" />{point}</div>)}
          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-1">
            <p className="rounded-xl bg-neon-cyan px-4 py-3 text-sm font-bold text-black">{labels.consultation}</p>
            <p className="rounded-xl bg-neon-cyan px-4 py-3 text-sm font-bold text-black">{labels.team}</p>
          </div>
        </div>
      </div>
    </ScrollExpandMedia>
  );
}
