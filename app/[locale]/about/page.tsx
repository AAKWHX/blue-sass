import Image from "next/image";
import { notFound } from "next/navigation";
import { CompanySection } from "@/components/public/company-section";
import { DeliveryJourney } from "@/components/public/delivery-journey";
import { CallToAction } from "@/components/public/process";
import { isLocale } from "@/lib/i18n";

const copy = {
  ar: ["من نحن", "نحوّل الأفكار الجيدة إلى منتجات رقمية يحب الناس استخدامها.", "بلو ساس استوديو رقمي يجمع الاستراتيجية والتصميم والتطوير في فريق واحد. نعمل معك من أول جلسة وحتى الإطلاق وما بعده."],
  en: ["About us", "We turn good ideas into digital products people love to use.", "Blue Sass brings strategy, design and development together in one team, from the first workshop to launch and beyond."],
  nl: ["Over ons", "Wij maken van goede ideeën digitale producten die mensen graag gebruiken.", "Blue Sass combineert strategie, ontwerp en ontwikkeling in één team, van eerste sessie tot na de lancering."],
  de: ["Über uns", "Wir verwandeln gute Ideen in digitale Produkte, die Menschen gerne nutzen.", "Blue Sass vereint Strategie, Design und Entwicklung in einem Team – vom ersten Gespräch bis nach dem Launch."],
  tr: ["Hakkımızda", "İyi fikirleri insanların kullanmayı sevdiği dijital ürünlere dönüştürüyoruz.", "Blue Sass strateji, tasarım ve geliştirmeyi ilk görüşmeden lansman sonrasına kadar tek ekipte birleştirir."],
  fr: ["À propos", "Nous transformons les bonnes idées en produits numériques agréables à utiliser.", "Blue Sass réunit stratégie, design et développement au sein d’une même équipe, du premier atelier à l’après-lancement."],
  es: ["Nosotros", "Convertimos buenas ideas en productos digitales que la gente disfruta usando.", "Blue Sass reúne estrategia, diseño y desarrollo en un solo equipo, desde la primera sesión hasta después del lanzamiento."],
} as const;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = copy[locale];
  return <>
    <section className="bg-base"><div className="container-x grid min-h-[620px] items-center gap-10 py-16 lg:grid-cols-2"><div><span className="text-sm font-bold text-neon-magenta">✦ BLUE SASS</span><h1 className="mt-4 text-5xl font-bold leading-tight text-black sm:text-7xl">{c[1]}</h1><p className="mt-6 max-w-xl text-lg leading-9 text-ink-low">{c[2]}</p></div><div className="relative"><span className="absolute -start-6 -top-6 size-48 rounded-full bg-neon-cyan"/><div className="relative overflow-hidden rounded-[2rem] border-2 border-black"><Image src="/media/teamwork-3d.webp" alt={c[0]} width={1536} height={1024} className="h-auto w-full" priority/></div></div></div></section>
    <CompanySection />
    <DeliveryJourney />
    <CallToAction />
  </>;
}
