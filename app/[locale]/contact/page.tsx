import Link from "next/link";
import { ArrowUpLeft, Mail, MessageCircle, Phone, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isLocale } from "@/lib/i18n";

const copy = {
  ar: ["تواصل معنا", "أخبرنا عن فكرتك، وسنساعدك في تحويلها إلى خطة واضحة ومنتج جاهز للنمو.", "ابدأ طلب مشروع", "الهاتف وواتساب", "البريد الإلكتروني", "نرد عادة خلال يوم عمل واحد.", "فريق الشركة", "عناوين التواصل المباشر للموظفين. ستُضاف الأسماء والمهام لاحقًا."],
  en: ["Contact us", "Tell us about your idea and we will turn it into a clear plan and a product ready to grow.", "Start a project request", "Phone & WhatsApp", "Email", "We usually reply within one business day.", "Company team", "Direct employee contacts. Names and roles will be added later."],
  nl: ["Neem contact op", "Vertel ons uw idee en wij maken er een helder plan van.", "Start een projectaanvraag", "Telefoon & WhatsApp", "E-mail", "We reageren meestal binnen één werkdag.", "Bedrijfsteam", "Directe contactadressen van medewerkers. Namen en functies volgen later."],
  de: ["Kontakt", "Erzählen Sie uns von Ihrer Idee und wir entwickeln einen klaren Plan.", "Projektanfrage starten", "Telefon & WhatsApp", "E-Mail", "Wir antworten meist innerhalb eines Werktags.", "Unser Team", "Direkte E-Mail-Adressen der Mitarbeiter. Namen und Aufgaben folgen später."],
  tr: ["İletişim", "Fikrinizi anlatın, onu net bir plana ve büyümeye hazır ürüne dönüştürelim.", "Proje talebi başlat", "Telefon & WhatsApp", "E-posta", "Genellikle bir iş günü içinde yanıt veririz.", "Şirket ekibi", "Çalışanların doğrudan iletişim adresleri. İsim ve görevler sonra eklenecek."],
  fr: ["Contactez-nous", "Parlez-nous de votre idée et nous la transformerons en plan clair.", "Démarrer une demande", "Téléphone & WhatsApp", "E-mail", "Nous répondons généralement sous un jour ouvré.", "Équipe", "Adresses directes des employés. Les noms et fonctions seront ajoutés ultérieurement."],
  es: ["Contacto", "Cuéntenos su idea y la convertiremos en un plan claro.", "Iniciar solicitud", "Teléfono y WhatsApp", "Correo electrónico", "Respondemos normalmente en un día laborable.", "Equipo", "Contactos directos de los empleados. Los nombres y funciones se añadirán después."],
} as const;

const employeeEmails = ["etskar@bluesass.nl", "mvx@bluesass.nl", "al3rab@bluesass.nl", "george@bluesass.nl"];

export const metadata = { title: "تواصل مع بلو ساس — تصميم وتطوير المواقع والتطبيقات" };

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = copy[locale];
  return <>
    <section className="bg-base"><div className="container-x grid min-h-[650px] items-center gap-10 py-16 lg:grid-cols-[.9fr_1.1fr]">
      <div><span className="text-sm font-bold text-neon-magenta">✦ BLUE SASS / CONTACT</span><h1 className="mt-4 text-6xl font-bold text-black sm:text-8xl">{c[0]}</h1><p className="mt-6 max-w-xl text-lg leading-9 text-ink-low">{c[1]}</p><Button asChild variant="neon" size="lg" className="mt-8"><Link href={`/${locale}/create-project`}>{c[2]}<ArrowUpLeft className="size-4 flip-x"/></Link></Button><p className="mt-5 text-sm text-ink-faint">{c[5]}</p></div>
      <div className="relative rounded-[2rem] border-2 border-black bg-black p-6 text-white sm:p-10"><span className="absolute -start-5 -top-5 size-20 rounded-full bg-neon-cyan"/><MessageCircle className="size-12 text-neon-cyan"/><div className="mt-10 grid gap-4 sm:grid-cols-2"><a href="tel:+31634543374" className="rounded-2xl border border-white/20 bg-white/5 p-6 transition hover:bg-neon-cyan hover:text-black"><Phone className="size-7"/><h2 className="mt-8 text-xl font-bold text-inherit">{c[3]}</h2><p dir="ltr" className="mt-2 text-sm opacity-70">+31 6 3454 3374</p></a><a href="mailto:help@bluesass.nl" className="rounded-2xl border border-white/20 bg-white/5 p-6 transition hover:bg-neon-cyan hover:text-black"><Mail className="size-7"/><h2 className="mt-8 text-xl font-bold text-inherit">{c[4]}</h2><p dir="ltr" className="mt-2 text-sm opacity-70">help@bluesass.nl</p></a></div></div>
    </div></section>
    <section className="bg-black py-16 text-white"><div className="container-x"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[.05]"><Users className="size-5"/></span><div><h2 className="text-2xl font-bold text-white">{c[6]}</h2><p className="mt-2 text-sm leading-7 text-white/65">{c[7]}</p></div></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{employeeEmails.map((email, index) => <a key={email} href={`mailto:${email}`} className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 text-white transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[.06]"><span className="flex items-center justify-between"><Mail className="size-5 text-white/70 transition group-hover:text-white"/><span className="font-mono text-[10px] text-white/40">{String(index + 1).padStart(2, "0")}</span></span><span dir="ltr" className="mt-8 block break-all text-sm font-semibold text-white">{email}</span></a>)}</div></div></section>
  </>;
}
