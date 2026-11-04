import type { ActiveLocale } from './config';

const copy = {
 ar: {
  eyebrow: 'Blue Sass · تصميم وتطوير', title: 'فكرتك تستحق تجربة استثنائية.',
  intro: 'نصمّم ونطوّر مواقع الويب والتطبيقات والمتاجر وأنظمة الأعمال. نبدأ بفهم احتياجك، ثم نحدد النطاق والسعر والمراحل معك قبل التنفيذ.',
  start: 'ابدأ مشروعك', contact: 'ناقش فكرتك معنا', services: 'اختر الخدمة التي تحتاجها',
  servicesIntro: 'ثماني خدمات، وتفاصيل واضحة لكل مسار. اطّلع على المزايا والأسعار الحالية، ثم أرسل متطلبات مشروعك.', details: 'التفاصيل والأسعار',
  focus: 'من الفكرة إلى التسليم', assurances: ['نطاق وسعر يُعتمدان كتابيًا قبل التنفيذ', 'تسليم مرحلي موثّق ومراجعة لكل مرحلة', 'ملكية واضحة للمخرجات والشفرة المصدرية حسب الاتفاق'],
  process: 'كيف نبدأ العمل معك؟', steps: [
   { title: 'اختر الخدمة وشارك احتياجك', text: 'حدّد نوع المشروع والوظائف واللغات المطلوبة، وأرسل متطلباتك أو استفسارك المباشر عبر صفحة التواصل.' },
   { title: 'راجع النطاق والسعر والمراحل', text: 'تُراجع المتطلبات الفنية والزمنية ويُعتمد عرض النطاق وخطة المراحل كتابيًا قبل بدء التنفيذ.' },
   { title: 'تابع التنفيذ وراجع التسليم', text: 'تُسلّم المراحل وفق الجدول المتفق عليه مع مراجعة المخرجات واعتماد كل مرحلة قبل الانتقال للتالية.' },
  ],
  closing: 'لديك فكرة أو سؤال؟', closingText: 'ابدأ بطلب مشروع، أو تواصل معنا لتوضيح ما تحتاجه. لا حاجة إلى معرفة تقنية لشرح فكرتك.',
 },
 en: {
  eyebrow: 'Blue Sass · Design & development', title: 'Your idea deserves an extraordinary experience.',
  intro: 'We design and develop websites, apps, online stores and business systems. We start with your needs, then agree the scope, price and stages before development.',
  start: 'Start a project', contact: 'Discuss your idea', services: 'Choose the service you need',
  servicesIntro: 'Eight services with a clear path for each. Explore the features and current prices, then share your project requirements.', details: 'Details & pricing',
  focus: 'From idea to handover', assurances: ['Written scope and price approved before development', 'Documented milestone reviews at every delivery stage', 'Clear source-code and asset handover terms'],
  process: 'How do we get started?', steps: [
   { title: 'Choose a service and share your needs', text: 'Describe the project type, features and target languages through our direct inquiry form.' },
   { title: 'Review the scope, price and stages', text: 'Technical requirements, timeline and milestone deliverables are reviewed and approved in writing before development begins.' },
   { title: 'Follow progress and review delivery', text: 'Each milestone is delivered for structured review and sign-off within the agreed project scope.' },
  ],
  closing: 'Have an idea or a question?', closingText: 'Start a project request or contact us to clarify your needs. You do not need technical knowledge to describe your idea.',
 },
 nl: {
  eyebrow: 'Blue Sass · Ontwerp & ontwikkeling', title: 'Uw idee verdient een bijzondere ervaring.',
  intro: 'We ontwerpen en ontwikkelen websites, apps, webwinkels en bedrijfssystemen. We beginnen bij uw wensen en spreken scope, prijs en fasen af vóór de uitvoering.',
  start: 'Start een project', contact: 'Bespreek uw idee', services: 'Kies de dienst die u nodig heeft',
  servicesIntro: 'Acht diensten met een duidelijke route. Bekijk de mogelijkheden en huidige prijzen en deel daarna uw projectwensen.', details: 'Details & prijzen',
  focus: 'Van idee tot overdracht', assurances: ['Scope en prijs vooraf schriftelijk goedgekeurd', 'Gedocumenteerde mijlpaalbeoordelingen per fase', 'Duidelijke afspraken over broncode en overdracht'],
  process: 'Hoe beginnen we samen?', steps: [
   { title: 'Kies een dienst en deel uw wensen', text: 'Beschrijf het projecttype, de gewenste functies en talen rechtstreeks via ons aanvraagformulier.' },
   { title: 'Beoordeel scope, prijs en fasen', text: 'Technische vereisten, planning en mijlpalen worden vóór de uitvoering schriftelijk beoordeeld en vastgelegd.' },
   { title: 'Volg de voortgang en beoordeel de oplevering', text: 'Elke fase wordt opgeleverd voor gestructureerde controle en goedkeuring binnen de afgesproken scope.' },
  ],
  closing: 'Heeft u een idee of een vraag?', closingText: 'Start een projectaanvraag of neem contact op om uw wensen te verduidelijken. Technische kennis is niet nodig om uw idee te beschrijven.',
 },
};

export const companyHomeCopy = (locale: ActiveLocale) => copy[locale];
