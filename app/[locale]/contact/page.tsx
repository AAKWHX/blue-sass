import Link from "next/link";
import { ArrowUpLeft, BriefcaseBusiness, Mail, MessageCircle, Phone, ShieldCheck, Sparkles, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isLocale } from "@/lib/i18n";

const copy = {
  ar: ["تواصل معنا", "أخبرنا عن فكرتك، وسنساعدك في تحويلها إلى خطة واضحة ومنتج جاهز للنمو.", "ابدأ طلب مشروع", "الهاتف وواتساب", "البريد الإلكتروني", "نرد عادة خلال يوم عمل واحد.", "فريق Blue Sass", "فريق متعدد التخصصات يتغير توزيع مهامه حسب احتياج كل مشروع. يمكننا إضافة موظفين جدد مع نمو الفريق.", "المهام الموضحة هي المسؤوليات الأساسية وقد تختلف حسب المشروع."],
  en: ["Contact us", "Tell us about your idea and we will turn it into a clear plan and a product ready to grow.", "Start a project request", "Phone & WhatsApp", "Email", "We usually reply within one business day.", "The Blue Sass team", "A multidisciplinary team whose responsibilities adapt to each project. New members can be added as the team grows.", "Listed responsibilities are primary roles and may vary by project."],
  nl: ["Neem contact op", "Vertel ons uw idee en wij maken er een helder plan van.", "Start een projectaanvraag", "Telefoon & WhatsApp", "E-mail", "We reageren meestal binnen één werkdag.", "Het Blue Sass-team", "Een multidisciplinair team waarvan de taken per project worden verdeeld.", "De genoemde taken zijn hoofdrollen en kunnen per project verschillen."],
  de: ["Kontakt", "Erzählen Sie uns von Ihrer Idee und wir entwickeln einen klaren Plan.", "Projektanfrage starten", "Telefon & WhatsApp", "E-Mail", "Wir antworten meist innerhalb eines Werktags.", "Das Blue Sass-Team", "Ein multidisziplinäres Team mit projektabhängigen Aufgaben.", "Die Aufgaben sind Hauptrollen und können je Projekt variieren."],
  tr: ["İletişim", "Fikrinizi anlatın, onu net bir plana ve büyümeye hazır ürüne dönüştürelim.", "Proje talebi başlat", "Telefon & WhatsApp", "E-posta", "Genellikle bir iş günü içinde yanıt veririz.", "Blue Sass ekibi", "Görevleri projeye göre uyarlanan çok disiplinli bir ekip.", "Belirtilen sorumluluklar ana rollerdir ve projeye göre değişebilir."],
  fr: ["Contactez-nous", "Parlez-nous de votre idée et nous la transformerons en plan clair.", "Démarrer une demande", "Téléphone & WhatsApp", "E-mail", "Nous répondons généralement sous un jour ouvré.", "L’équipe Blue Sass", "Une équipe multidisciplinaire dont les responsabilités s’adaptent au projet.", "Les responsabilités indiquées sont principales et peuvent varier."],
  es: ["Contacto", "Cuéntenos su idea y la convertiremos en un plan claro.", "Iniciar solicitud", "Teléfono y WhatsApp", "Correo electrónico", "Respondemos normalmente en un día laborable.", "El equipo Blue Sass", "Un equipo multidisciplinar cuyas funciones se adaptan a cada proyecto.", "Las responsabilidades indicadas son principales y pueden variar."],
} as const;

const team = [
  { name: "ETSKAR", email: "etskar@bluesass.nl", role: { ar: "مدير الشركة · استلام المشاريع وتقسيم المهام", en: "Company director · Project intake and task allocation" }, icon: BriefcaseBusiness },
  { name: "Moayad", email: "mvx@bluesass.nl", role: { ar: "مدير المشروع", en: "Project manager" }, icon: Users },
  { name: "Mustafa", email: "mustafa@bluesass.nl", role: { ar: "استلام تفاصيل المشروع", en: "Project requirements and details" }, icon: MessageCircle },
  { name: "George", email: "george@bluesass.nl", role: { ar: "فحص أمن المشاريع", en: "Project security review" }, icon: ShieldCheck },
  { name: "Omar", email: "omar@bluesass.nl", role: { ar: "تصميم الواجهات والهوية البصرية", en: "Interface and visual identity design" }, icon: Sparkles },
] as const;

export const metadata = { title: "تواصل مع بلو ساس — تصميم وتطوير المواقع والتطبيقات" };

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = copy[locale];
  return <>
    <section id="contact" className="bg-base scroll-mt-24"><div className="container-x grid min-h-[650px] items-center gap-10 py-16 lg:grid-cols-[.9fr_1.1fr]">
      <div><h1 className="mt-4 text-6xl font-bold text-black sm:text-8xl">{c[0]}</h1><p className="mt-6 max-w-xl text-lg leading-9 text-ink-low">{c[1]}</p><Button asChild variant="neon" size="lg" className="mt-8"><Link href={`/${locale}/create-project`}>{c[2]}<ArrowUpLeft className="size-4 flip-x"/></Link></Button><p className="mt-5 text-sm text-ink-faint">{c[5]}</p></div>
      <div className="relative rounded-[2rem] border-2 border-black bg-black p-6 text-white sm:p-10"><span className="absolute -start-5 -top-5 size-20 rounded-full bg-neon-cyan"/><MessageCircle className="size-12 text-neon-cyan"/><div className="mt-10 grid gap-4 sm:grid-cols-2"><a href="tel:+31634543374" className="rounded-2xl border border-white/20 bg-white/5 p-6 transition hover:bg-neon-cyan hover:text-black"><Phone className="size-7"/><h2 className="mt-8 text-xl font-bold text-inherit">{c[3]}</h2><p dir="ltr" className="mt-2 text-sm opacity-70">+31 6 3454 3374</p></a><a href="mailto:help@bluesass.nl" className="rounded-2xl border border-white/20 bg-white/5 p-6 transition hover:bg-neon-cyan hover:text-black"><Mail className="size-7"/><h2 className="mt-8 text-xl font-bold text-inherit">{c[4]}</h2><p dir="ltr" className="mt-2 text-sm opacity-70">help@bluesass.nl</p></a></div></div>
    </div></section>
    <section id="team" className="scroll-mt-24 bg-black py-16 text-white"><div className="container-x"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[.05]"><Users className="size-5"/></span><div><h2 className="text-2xl font-bold text-white">{c[6]}</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-white/65">{c[7]}</p><p className="mt-2 text-xs text-white/40">{c[8]}</p></div></div><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{team.map(({name,email,role,icon:Icon}, index) => <a key={email} href={`mailto:${email}`} className="group flex min-h-56 flex-col rounded-3xl border border-white/10 bg-white/[.035] p-6 text-white transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[.06]"><span className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/[.05]"><Icon className="size-5"/></span><span className="font-mono text-[10px] text-white/40">{String(index + 1).padStart(2, "0")}</span></span><strong className="mt-6 text-xl">{name}</strong><span className="mt-2 text-sm leading-6 text-white/55">{locale === "ar" ? role.ar : role.en}</span><span dir="ltr" className="mt-auto flex items-center gap-2 break-all pt-6 text-sm font-semibold"><Mail className="size-4"/>{email}</span></a>)}</div><a href="mailto:help@bluesass.nl" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/[.06] p-5"><span><strong className="block">{c[4]}</strong><span className="mt-1 block text-xs text-white/50">Blue Sass support</span></span><span dir="ltr" className="font-semibold">help@bluesass.nl</span></a></div></section>
  </>;
}
