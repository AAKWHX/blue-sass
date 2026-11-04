"use client";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { useI18n } from "@/components/providers";
import { studioCopy } from "@/lib/i18n/studio";
import { localizedContactMailto, PRIMARY_CONTACT_EMAIL } from "@/lib/validation/inquiry";
import { Button } from "@/components/ui/button";
import { StudioAtmosphere } from "@/components/ui/studio-atmosphere";

const emailCardCopy = {
 ar: {
  badge: "التواصل المباشر عبر البريد الإلكتروني",
  title: "أرسل تفاصيل مشروعك عبر البريد الإلكتروني",
  lead: "تواصل معنا مباشرة عبر البريد الرسمي دون الحاجة إلى إنشاء حساب. اذكر في رسالتك نوع الخدمة المطلوبة، اللغات المستهدفة، الوظائف الأساسية، والموعد أو الميزانية التقديرية إن وجدت.",
  cta: "مراسلة help@bluesass.nl",
  checklistTitle: "ماذا تذكر في رسالتك؟",
  checklist: [
   "فكرة المشروع أو النشاط التجاري والجمهور المستهدف",
   "الخدمة المطلوبة (موقع ويب، تطبيق، متجر، نظام أعمال، ذكاء اصطناعي، أو تصميم)",
   "اللغات المطلوبة (العربية، الإنجليزية، الهولندية) وأي متطلبات خاصة",
   "الموعد المستهدف للإطلاق والميزانية التقديرية (اختياري)",
  ],
 },
 en: {
  badge: "Direct Email Contact",
  title: "Send your project details by email",
  lead: "Contact our team directly at our official email address without creating an account. Share the service you need, target languages, core features, and any timeline or budget preferences.",
  cta: "Email help@bluesass.nl",
  checklistTitle: "What to include in your email",
  checklist: [
   "Your business goals, project idea, and target audience",
   "Selected service (website, mobile/desktop app, online store, ERP system, AI, or design)",
   "Required languages (Arabic, English, Dutch) and key functional requirements",
   "Target timeline and estimated budget range (optional)",
  ],
 },
 nl: {
  badge: "Direct contact per e-mail",
  title: "Stuur uw projectgegevens per e-mail",
  lead: "Neem rechtstreeks contact op met ons team via ons officiële e-mailadres zonder een account aan te maken. Vermeld de gewenste dienst, talen, belangrijkste functies en eventuele planning of budget.",
  cta: "E-mail help@bluesass.nl",
  checklistTitle: "Wat u in uw e-mail kunt vermelden",
  checklist: [
   "Uw bedrijfsdoel, projectidee en doelgroep",
   "Gewenste dienst (website, mobiele/desktop-app, webwinkel, bedrijfssysteem, AI of ontwerp)",
   "Gewenste talen (Arabisch, Engels, Nederlands) en belangrijke functies",
   "Gewenste planning en indicatief budget (optioneel)",
  ],
 },
} as const;

export function StudioInquiry() {
 const {locale,t}=useI18n();const c=studioCopy(locale);
 const activeLocale = locale === "ar" || locale === "nl" ? locale : "en";
 const card = emailCardCopy[activeLocale];
 const mailtoHref = localizedContactMailto(activeLocale);
 return <section id="inquiry" className="studio-section"><StudioAtmosphere variant="contact"/><div className="container-x grid items-start gap-10 lg:grid-cols-[.9fr_1.1fr]">
  <div><h2 className="studio-heading">{c.inquiry}</h2><p className="studio-deck mt-6">{t.quote.disclaimer}</p><a href={mailtoHref} className="mt-8 inline-block text-lg text-white underline underline-offset-8" dir="ltr">{PRIMARY_CONTACT_EMAIL}</a><p className="mt-5"><a href="tel:+31634543374" dir="ltr" className="text-white/75">+31 6 3454 3374</a></p></div>
  <div className="studio-contact-form studio-card space-y-6">
   <p className="text-xs font-semibold uppercase tracking-widest text-neon-cyan">{card.badge}</p>
   <h3 className="text-2xl font-bold text-white sm:text-3xl">{card.title}</h3>
   <p className="text-sm leading-7 text-white/75">{card.lead}</p>
   <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
    <h4 className="text-sm font-semibold text-white">{card.checklistTitle}</h4>
    <ul className="mt-3 space-y-2 text-sm leading-7 text-white/70">
     {card.checklist.map(item=><li key={item}>• {item}</li>)}
    </ul>
   </div>
   <div className="pt-2">
    <Button asChild variant="neon" size="lg" className="w-full">
     <a href={mailtoHref}>
      <Mail className="size-4"/>
      <span>{card.cta}</span>
      <ArrowUpRight className="size-4 flip-x"/>
     </a>
    </Button>
   </div>
   <p className="text-xs leading-6 text-white/70"><Link href={`/${locale}/privacy`}>{c.privacy}</Link></p>
  </div>
 </div></section>;
}
