"use client";

import Link from "next/link";
import { FileText, Monitor, Smartphone, MessageCircle, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/providers";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

const copy = {
  ar: ["فكرتك واضحة. مشروعك في مكان واحد.", "اختر الخدمة التي تحتاجها، راجع تفاصيل طلبك، وتواصل معنا من حسابك.", "تفاصيل قبل الالتزام", "راجع الميزات والتقدير قبل حفظ الطلب. يمكنك إرسال طلبك دون الدفع.", "مكان واحد لمشروعك", "تابع الطلب والملفات وملاحظات المشروع من حسابك.", "تواصل مباشر", "لديك سؤال عن الفكرة أو نطاق العمل؟ تواصل مع Blue Sass.", "ابدأ مشروعك"],
  en: ["Your idea. Your project. One place.", "Choose a service, review your request and contact us from your account.", "Details before commitment", "Review features and estimates before saving. Submit without paying.", "One project workspace", "Follow your request, files and feedback from your account.", "Direct contact", "Questions about your idea or scope? Contact Blue Sass.", "Start your project"],
  nl: ["Uw idee en project op één plek.", "Kies een dienst, controleer uw aanvraag en neem contact op via uw account.", "Details vooraf", "Bekijk functies en ramingen voordat u opslaat. Aanvragen kan zonder betaling.", "Eén projectomgeving", "Volg uw aanvraag, bestanden en feedback vanuit uw account.", "Direct contact", "Vragen over uw idee of omvang? Neem contact op met Blue Sass.", "Start uw project"],
  de: ["Ihre Idee. Ihr Projekt. Ein Ort.", "Wählen Sie eine Leistung, prüfen Sie Ihre Anfrage und kontaktieren Sie uns.", "Details vor der Zusage", "Prüfen Sie Funktionen und Schätzungen. Speichern ist ohne Zahlung möglich.", "Ein Projektbereich", "Verfolgen Sie Anfrage, Dateien und Feedback in Ihrem Konto.", "Direkter Kontakt", "Fragen zur Idee oder zum Umfang? Kontaktieren Sie Blue Sass.", "Projekt starten"],
  tr: ["Fikriniz ve projeniz tek yerde.", "Hizmet seçin, talebinizi inceleyin ve hesabınızdan bize ulaşın.", "Karardan önce ayrıntılar", "Kaydetmeden önce özellikleri ve tahminleri inceleyin. Ödemeden talep gönderin.", "Tek proje alanı", "Talebinizi, dosyalarınızı ve geri bildirimleri hesabınızdan takip edin.", "Doğrudan iletişim", "Fikriniz veya kapsam hakkında sorunuz mu var? Blue Sass ile iletişime geçin.", "Projenizi başlatın"],
  fr: ["Votre idée et votre projet au même endroit.", "Choisissez un service, vérifiez votre demande et contactez-nous.", "Les détails avant de décider", "Vérifiez les options et estimations. Enregistrez sans payer.", "Un espace pour votre projet", "Suivez votre demande, vos fichiers et vos retours depuis votre compte.", "Contact direct", "Une question sur votre idée ou le périmètre ? Contactez Blue Sass.", "Démarrer votre projet"],
  es: ["Su idea y su proyecto en un solo lugar.", "Elija un servicio, revise su solicitud y contacte con nosotros.", "Detalles antes de decidir", "Revise opciones y estimaciones. Guarde sin pagar.", "Un espacio para su proyecto", "Siga su solicitud, archivos y comentarios desde su cuenta.", "Contacto directo", "¿Preguntas sobre su idea o alcance? Contacte con Blue Sass.", "Iniciar proyecto"],
};

export function CompanySection() {
  const { locale, t } = useI18n();
  const c = copy[locale];
  const reduced = useReducedMotion();
  return <section className="container-x py-16 sm:py-24">
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
      <div><BrandLogo /><h2 className="mt-6 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">{c[0]}</h2><p className="mt-5 max-w-xl leading-8 text-ink-low">{c[1]}</p><Button asChild variant="neon" className="mt-7"><Link href={`/${locale}/create-project`}>{c[8]}<ArrowRight className="size-4 flip-x" /></Link></Button></div>
      <motion.div initial={reduced ? false : { opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative rounded-3xl border border-line bg-elevated p-5 sm:p-8">
        <div className="flex items-center justify-between border-b border-line pb-4"><BrandLogo showName={false} /><span className="text-sm font-semibold">{t.auth.myProjects}</span></div>
        <div aria-hidden="true" className="mt-7 grid grid-cols-[1fr_auto] items-end gap-4"><div className="rounded-xl border border-line bg-base p-4"><Monitor className="size-9" /><div className="mt-5 h-2 w-3/4 rounded bg-white/30" /><div className="mt-3 h-2 w-1/2 rounded bg-white/15" /><div className="mt-6 grid grid-cols-3 gap-2">{[1,2,3].map(n => <span key={n} className="h-10 rounded bg-white/5" />)}</div></div><Smartphone className="h-36 w-16 text-ink-low" /></div>
        <p className="mt-5 text-sm text-ink-low">{c[5]}</p>
      </motion.div>
    </div>
    <div className="mt-12 grid gap-6 md:grid-cols-3">{[FileText, Monitor, MessageCircle].map((Icon, i) => <article key={i} className="border-t border-line pt-6"><Icon className="size-7 text-ink-hi" /><h3 className="mt-4 text-lg font-semibold">{c[2+i*2]}</h3><p className="mt-3 text-sm leading-7 text-ink-low">{c[3+i*2]}</p></article>)}</div>
    <div className="mt-8 flex flex-wrap gap-6 text-sm"><Link href={`/${locale}/contact`} className="underline underline-offset-4">{t.nav.contact}</Link><Link href={`/${locale}/portal`} className="underline underline-offset-4">{t.auth.myProjects}</Link></div>
  </section>;
}
