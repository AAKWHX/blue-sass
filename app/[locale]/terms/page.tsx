import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";

export const metadata: Metadata = { title: "Terms of Service — Blue Sass", description: "Terms governing use of the Blue Sass website and client portal." };

const sections = [
  { title: "Using the website", paragraphs: ["You may use this website and its client portal only for lawful purposes. You must not attempt to disrupt the service, access another user's account, bypass security controls, introduce malicious code, or use automated systems in a way that harms the service or other users."] },
  { title: "Accounts", paragraphs: ["You are responsible for activity under your account and for keeping your access credentials secure. Information you provide must be accurate. We may suspend access where reasonably necessary to protect users, investigate misuse, or comply with law."] },
  { title: "Proposals and paid services", paragraphs: ["Website content, quote requests, and preliminary discussions do not create a binding services engagement. Project scope, deliverables, fees, payment terms, intellectual property, and warranties are governed by a separate written proposal or agreement accepted by both parties."] },
  { title: "Intellectual property", paragraphs: ["Unless otherwise stated, the website, brand, design, text, and software are owned by Blue Sass or its licensors. You may not reproduce, distribute, or create derivative works from them without prior written permission, except as permitted by law."] },
  { title: "Availability and liability", paragraphs: ["We work to keep the website secure and available, but it is provided on an “as available” basis. To the maximum extent permitted by law, we are not liable for indirect, incidental, special, or consequential loss arising from use of the public website. Nothing in these terms excludes liability that cannot legally be excluded."] },
  { title: "Changes and contact", paragraphs: ["We may update these terms as the service evolves. Material changes will be reflected by the date above. Questions about these terms can be sent to etskar@bluesass.nl."] },
];

const arabicSections = [
  { title: "استخدام الموقع", paragraphs: ["يمكنك استخدام الموقع وبوابة العميل للأغراض القانونية فقط. يُمنع تعطيل الخدمة أو محاولة دخول حسابات الآخرين أو تجاوز أنظمة الحماية أو إدخال برمجيات ضارة."] },
  { title: "الحسابات", paragraphs: ["أنت مسؤول عن النشاط الذي يتم عبر حسابك وعن حماية بيانات الدخول. يجب أن تكون المعلومات المقدمة صحيحة، وقد نعلّق الوصول عند الحاجة لحماية المستخدمين أو تطبيق القانون."] },
  { title: "العروض والخدمات المدفوعة", paragraphs: ["لا ينشئ محتوى الموقع أو طلب التسعيرة اتفاقًا ملزمًا. يُحدد نطاق المشروع والتسليمات والرسوم وحقوق الملكية في عرض أو عقد منفصل يقبله الطرفان."] },
  { title: "الملكية والمسؤولية", paragraphs: ["الموقع والعلامة والتصميم والبرمجيات مملوكة لـBlue Sass أو مرخّصيها. تُقدّم الخدمة حسب توفرها، ولا تُستبعد أي مسؤولية لا يسمح القانون باستبعادها."] },
  { title: "التغييرات والتواصل", paragraphs: ["قد نحدّث هذه الشروط مع تطور الخدمة. للاستفسارات تواصل معنا عبر etskar@bluesass.nl."] },
];

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale === "ar") return <LegalPage eyebrow="معلومات قانونية" title="شروط الاستخدام" updated="21 سبتمبر 2026" updatedLabel="آخر تحديث" introduction="تنظّم هذه الشروط استخدام موقع bluesass.nl وبوابة عملاء Blue Sass. باستخدام الخدمة فإنك توافق على هذه الشروط." sections={arabicSections} />;
  return <LegalPage eyebrow="Legal" title="Terms of Service" updated="21 September 2026" introduction="These terms govern your access to and use of bluesass.nl and the Blue Sass client portal. By using the service, you agree to these terms." sections={sections} />;
}
