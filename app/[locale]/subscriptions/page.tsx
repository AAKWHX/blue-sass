import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpLeft, Check, Clock3, Headphones, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary, isLocale } from "@/lib/i18n";
import { subscriptionDetails } from "@/lib/subscription-details";
import { subscriptionPlans, subscriptionPurchaseNote } from "@/lib/subscriptions";

const copy = {
  ar: { eyebrow: "اشتراكات بلو ساس", title: "موقعك تحت المتابعة، لا تحت الانتظار.", subtitle: "استضافة وصيانة وتحسينات شهرية بخطة واضحة. اختر مستوى المتابعة الذي يناسب نشاطك.", monthly: "شهريًا", choose: "اشترِ الاشتراك", popular: "الأكثر اختيارًا", response: "زمن الاستجابة", hours: "الوقت المشمول", note: "الاشتراكات تغطي الاستضافة والصيانة والدعم الموضح. تنفيذ مشروع جديد أو تغيير كبير يُسعّر بشكل منفصل بعد مراجعة النطاق.", compare: "كل خطة تشمل شهادة SSL، مراقبة أساسية، وتواصلًا مباشرًا مع فريق بلو ساس.", talk: "تحدث معنا" },
  en: { eyebrow: "Blue Sass subscriptions", title: "Your website stays managed, monitored and moving.", subtitle: "Hosting, maintenance and monthly improvements in one clear plan.", monthly: "per month", choose: "Buy this plan", popular: "Most popular", response: "Response time", hours: "Included time", note: "Plans cover the listed hosting, maintenance and support. New builds or major scope changes are quoted separately.", compare: "Every plan includes SSL, essential monitoring and direct contact with the Blue Sass team.", talk: "Talk to us" },
  nl: { eyebrow: "Blue Sass-abonnementen", title: "Uw website blijft beheerd, bewaakt en in beweging.", subtitle: "Hosting, onderhoud en maandelijkse verbeteringen in één duidelijk plan.", monthly: "per maand", choose: "Dit plan kopen", popular: "Meest gekozen", response: "Reactietijd", hours: "Inbegrepen tijd", note: "De plannen dekken de genoemde hosting, het onderhoud en support. Nieuwe projecten of grote wijzigingen worden apart begroot.", compare: "Elk plan bevat SSL, essentiële monitoring en direct contact met Blue Sass.", talk: "Neem contact op" },
  de: { eyebrow: "Blue Sass Abos", title: "Ihre Website bleibt betreut, überwacht und aktuell.", subtitle: "Hosting, Wartung und monatliche Verbesserungen in einem klaren Plan.", monthly: "pro Monat", choose: "Plan kaufen", popular: "Am beliebtesten", response: "Reaktionszeit", hours: "Enthaltene Zeit", note: "Die Pläne decken die aufgeführten Hosting-, Wartungs- und Supportleistungen ab. Neue Projekte werden separat kalkuliert.", compare: "Jeder Plan enthält SSL, grundlegendes Monitoring und direkten Kontakt zu Blue Sass.", talk: "Kontakt aufnehmen" },
  tr: { eyebrow: "Blue Sass paketleri", title: "Siteniz yönetilir, izlenir ve gelişmeye devam eder.", subtitle: "Hosting, bakım ve aylık iyileştirmeler tek net pakette.", monthly: "aylık", choose: "Bu paketi satın al", popular: "En çok seçilen", response: "Yanıt süresi", hours: "Dahil süre", note: "Paketler belirtilen hosting, bakım ve desteği kapsar. Yeni projeler ve büyük değişiklikler ayrıca fiyatlandırılır.", compare: "Her paket SSL, temel izleme ve Blue Sass ekibiyle doğrudan iletişim içerir.", talk: "Bize ulaşın" },
  fr: { eyebrow: "Abonnements Blue Sass", title: "Votre site reste géré, surveillé et évolutif.", subtitle: "Hébergement, maintenance et améliorations mensuelles dans une formule claire.", monthly: "par mois", choose: "Acheter cette formule", popular: "Le plus choisi", response: "Délai de réponse", hours: "Temps inclus", note: "Les formules couvrent les prestations indiquées. Les nouveaux projets et changements importants sont chiffrés séparément.", compare: "Chaque formule inclut SSL, la surveillance essentielle et un contact direct avec Blue Sass.", talk: "Nous contacter" },
  es: { eyebrow: "Planes Blue Sass", title: "Su sitio permanece gestionado, vigilado y en evolución.", subtitle: "Alojamiento, mantenimiento y mejoras mensuales en un plan claro.", monthly: "al mes", choose: "Comprar este plan", popular: "Más elegido", response: "Tiempo de respuesta", hours: "Tiempo incluido", note: "Los planes cubren los servicios indicados. Los proyectos nuevos o cambios importantes se cotizan por separado.", compare: "Cada plan incluye SSL, monitoreo esencial y contacto directo con Blue Sass.", talk: "Hablar con nosotros" },
} as const;

export const metadata: Metadata = { title: "اشتراكات بلو ساس — الاستضافة والصيانة والدعم", description: "خطط اشتراك شهرية من بلو ساس للاستضافة المُدارة والصيانة والحماية والدعم والتحسينات المستمرة." };

export default async function SubscriptionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = copy[locale];
  const details = getDictionary(locale).experience;
  const plans = subscriptionPlans(locale);
  return <main className="bg-base">
    <section className="container-x py-16 text-center sm:py-24">
      <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold leading-tight text-black sm:text-7xl">{c.title}</h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink-low">{c.subtitle}</p>
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {plans.map((plan, index) => <article key={plan.id} className={`relative flex flex-col rounded-3xl border border-black p-7 text-start ${index === 1 ? "bg-neon-cyan" : "bg-white"}`}>
          <h2 className="text-3xl font-bold text-black">{plan.name}</h2>
          <p className="mt-3 min-h-16 leading-7 text-black/65">{plan.description}</p>
          <p className="mt-7 text-black"><strong className="text-5xl font-black">€{plan.price}</strong> <span className="text-sm">/ {c.monthly}</span></p>
          <h3 className="mt-7 font-bold">{details.receive}</h3><ul className="mt-3 space-y-3">{subscriptionDetails[locale][index].map(point => <li key={point} className="flex gap-2 text-sm leading-7 text-black/75"><Check className="mt-1 size-4 shrink-0"/>{point}</li>)}</ul>
          <ul className="mt-8 space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-2 text-sm font-semibold text-black"><Check className="mt-0.5 size-4 shrink-0" />{feature}</li>)}</ul>
          <dl className="mt-8 grid gap-3 border-t border-black/15 pt-6 text-sm"><div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-black/60"><Clock3 className="size-4" />{c.response}</dt><dd className="font-bold text-black">{plan.response}</dd></div><div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-black/60"><Headphones className="size-4" />{c.hours}</dt><dd className="font-bold text-black">{plan.hours}</dd></div></dl>
          <Button asChild variant={index === 1 ? "unstyled" : "neon"} className={`mt-8 w-full ${index === 1 ? "bg-black text-white hover:bg-black/80" : ""}`}><Link href={`/${locale}/quote?type=web&service=subscription-${plan.id}`}>{c.choose}<ArrowUpLeft className="size-4 flip-x" /></Link></Button>
        </article>)}
      </div>
    </section>
    <section className="container-x pb-12"><h2 className="text-2xl font-bold">{details.limits}</h2><p className="mt-4 max-w-4xl text-sm leading-8 text-ink-low">{details.planLimits}</p><p className="mt-3 font-semibold">{subscriptionPurchaseNote[locale]}</p></section>
    <section className="bg-black py-14 text-white"><div className="container-x flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-start"><div><ShieldCheck className="size-8 text-neon-cyan"/><h2 className="mt-4 text-2xl font-bold text-white">{c.compare}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">{c.note}</p></div><Button asChild variant="unstyled" className="shrink-0 bg-neon-cyan px-6 py-3 font-bold text-black"><Link href={`/${locale}/contact`}>{c.talk}</Link></Button></div></section>
  </main>;
}
