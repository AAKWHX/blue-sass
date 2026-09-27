import Link from "next/link";
import { ArrowUpLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

const copy = {
  ar: ["تواصل معنا", "أخبرنا عن فكرتك، وسنساعدك في تحويلها إلى خطة واضحة ومنتج جاهز للنمو.", "ابدأ طلب مشروع", "الهاتف وواتساب", "البريد الإلكتروني", "نرد عادة خلال يوم عمل واحد."],
  en: ["Contact us", "Tell us about your idea and we will turn it into a clear plan and a product ready to grow.", "Start a project request", "Phone & WhatsApp", "Email", "We usually reply within one business day."],
  nl: ["Neem contact op", "Vertel ons uw idee en wij maken er een helder plan van.", "Start een projectaanvraag", "Telefoon & WhatsApp", "E-mail", "We reageren meestal binnen één werkdag."],
  de: ["Kontakt", "Erzählen Sie uns von Ihrer Idee und wir entwickeln einen klaren Plan.", "Projektanfrage starten", "Telefon & WhatsApp", "E-Mail", "Wir antworten meist innerhalb eines Werktags."],
  tr: ["İletişim", "Fikrinizi anlatın, onu net bir plana ve büyümeye hazır ürüne dönüştürelim.", "Proje talebi başlat", "Telefon & WhatsApp", "E-posta", "Genellikle bir iş günü içinde yanıt veririz."],
  fr: ["Contactez-nous", "Parlez-nous de votre idée et nous la transformerons en plan clair.", "Démarrer une demande", "Téléphone & WhatsApp", "E-mail", "Nous répondons généralement sous un jour ouvré."],
  es: ["Contacto", "Cuéntenos su idea y la convertiremos en un plan claro.", "Iniciar solicitud", "Teléfono y WhatsApp", "Correo electrónico", "Respondemos normalmente en un día laborable."],
} as const;

export const metadata = { title: "تواصل مع بلو ساس — تصميم وتطوير المواقع والتطبيقات" };

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = copy[locale];
  return <>
    <section className="bg-base"><div className="container-x grid min-h-[650px] items-center gap-10 py-16 lg:grid-cols-[.9fr_1.1fr]">
      <div><span className="text-sm font-bold text-neon-magenta">✦ BLUE SASS / CONTACT</span><h1 className="mt-4 text-6xl font-bold text-black sm:text-8xl">{c[0]}</h1><p className="mt-6 max-w-xl text-lg leading-9 text-ink-low">{c[1]}</p><Link href={`/${locale}/create-project`} className="mt-8 inline-flex items-center gap-2 rounded-xl border border-black bg-neon-cyan px-6 py-4 font-bold text-black">{c[2]}<ArrowUpLeft className="size-4 flip-x"/></Link><p className="mt-5 text-sm text-ink-faint">{c[5]}</p></div>
      <div className="relative rounded-[2rem] border-2 border-black bg-black p-6 text-white sm:p-10"><span className="absolute -start-5 -top-5 size-20 rounded-full bg-neon-cyan"/><MessageCircle className="size-12 text-neon-cyan"/><div className="mt-10 grid gap-4 sm:grid-cols-2"><a href="tel:+31634543374" className="rounded-2xl border border-white/20 bg-white/5 p-6 transition hover:bg-neon-cyan hover:text-black"><Phone className="size-7"/><h2 className="mt-8 text-xl font-bold text-inherit">{c[3]}</h2><p dir="ltr" className="mt-2 text-sm opacity-70">+31 6 3454 3374</p></a><a href="mailto:help@bluesass.nl" className="rounded-2xl border border-white/20 bg-white/5 p-6 transition hover:bg-neon-cyan hover:text-black"><Mail className="size-7"/><h2 className="mt-8 text-xl font-bold text-inherit">{c[4]}</h2><p dir="ltr" className="mt-2 text-sm opacity-70">help@bluesass.nl</p></a></div></div>
    </div></section>
  </>;
}
