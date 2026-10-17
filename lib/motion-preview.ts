import type { ActiveLocale } from './i18n/config';

const copy = {
  ar: {
    lab: 'معاينة الحركة — نسخة محلية', chapters: ['المقدمة', 'الخدمات', 'المشاهد', 'الانتقال'], pause: 'اعرض المحتوى دون حركة', resume: 'شغّل تجربة التمرير', skip: 'تجاوز التجربة',
    title: ['من فكرة.', 'إلى تجربة تعيش.'], intro: 'نصمّم ونطوّر المواقع والتطبيقات والأنظمة الذكية. مرّر لتكتشف كيف تتصل الفكرة والتصميم والتنفيذ.', explore: 'ابدأ الرحلة',
    services: 'خدمات تتصل. تجربة تتكامل.', serviceIntro: 'موقعك، نظام عملك، وأدواتك الذكية؛ نختار ما يخدم المشروع ونبنيه معًا.', details: 'تفاصيل الخدمة', all: 'كل الخدمات',
    projects: 'من التصوّر إلى الاستخدام.', studyNote: 'دراسات تصميم داخلية لـBlue Sass لاختبار الحركة؛ ليست مشاريع عملاء أو منتجات معروضة للبيع.', open: 'افتح الدراسة',
    finale: ['فكرة واحدة.', 'احتمالات تتّسع.'], finaleText: 'جرّب الانتقال إلى تفاصيل الدراسة، ثم عد إلى المشهد باستخدام زر الرجوع في المتصفح.', navigate: 'جرّب انتقال الصفحة',
    back: 'العودة إلى تجربة الحركة', detail: 'التصميم في سياقه.', detailIntro: 'هذه دراسة داخلية لعرض حركة الوسائط والتنقّل. المحتوى توضيحي، ولا يرتبط بمشروع عميل أو بمعلومات من قاعدة البيانات.',
    detailPoints: ['محتوى مفهوم وواجهة متجاوبة', 'تكوين بصري يتكيف مع الشاشة', 'انتقال يحفظ مسار المتصفح ولوحة المفاتيح'], next: 'الدراسة التالية',
    studies: [
      { slug: 'responsive-experience', name: 'حضور يتكيّف معك.', text: 'دراسة لتقديم موقع متناسق على شاشة كبيرة وهاتف، من التنقّل إلى المحتوى.', image: 'web-showcase' },
      { slug: 'product-system', name: 'من المخطط إلى المنتج.', text: 'رحلة واجهة تتطور من الهيكل الأول إلى صفحة قابلة للاستخدام والتنفيذ.', image: 'workflow' },
      { slug: 'care-dashboard', name: 'وضوح بعد الإطلاق.', text: 'تصوّر لعرض فحوص الموقع والتقارير والمهام في مساحة عمل مترابطة.', image: 'monitoring' },
    ],
  },
  en: {
    lab: 'Motion preview — local prototype', chapters: ['Opening', 'Services', 'Studies', 'Navigation'], pause: 'Read without motion', resume: 'Enable scroll experience', skip: 'Skip the experience',
    title: ['From an idea.', 'To a living experience.'], intro: 'We design and build websites, applications and intelligent systems. Scroll to see how idea, design and delivery connect.', explore: 'Explore the journey',
    services: 'Connected services. One experience.', serviceIntro: 'Your website, business system and intelligent tools, selected around the project and built together.', details: 'Service details', all: 'All services',
    projects: 'From concept to use.', studyNote: 'Internal Blue Sass design studies for motion testing, not client projects or products offered for sale.', open: 'Open the study',
    finale: ['One idea.', 'Room to grow.'], finaleText: 'Open a study, then return to the scene using your browser’s Back button.', navigate: 'Try the page transition',
    back: 'Back to the motion experience', detail: 'Design in context.', detailIntro: 'An internal study of media movement and navigation. This illustrative content is not a client project and does not use project database records.',
    detailPoints: ['Clear content and a responsive interface', 'A composition that adapts to the screen', 'Navigation that preserves history and keyboard use'], next: 'Next study',
    studies: [
      { slug: 'responsive-experience', name: 'A presence that adapts.', text: 'A coherent website across a large screen and a phone, from navigation to content.', image: 'web-showcase' },
      { slug: 'product-system', name: 'From structure to product.', text: 'An interface evolving from the first wireframe to a usable page ready for development.', image: 'workflow' },
      { slug: 'care-dashboard', name: 'Clarity after launch.', text: 'A concept for bringing site checks, reports and tasks into a connected workspace.', image: 'monitoring' },
    ],
  },
  nl: {
    lab: 'Motion-preview — lokaal prototype', chapters: ['Intro', 'Diensten', 'Studies', 'Navigatie'], pause: 'Lees zonder beweging', resume: 'Scrollervaring inschakelen', skip: 'Ervaring overslaan',
    title: ['Van een idee.', 'Naar een levende ervaring.'], intro: 'Wij ontwerpen en bouwen websites, apps en intelligente systemen. Scroll om te zien hoe idee, ontwerp en uitvoering samenkomen.', explore: 'Ontdek de reis',
    services: 'Verbonden diensten. Eén ervaring.', serviceIntro: 'Uw website, bedrijfssysteem en slimme tools, gekozen voor het project en samen gebouwd.', details: 'Dienst bekijken', all: 'Alle diensten',
    projects: 'Van concept naar gebruik.', studyNote: 'Interne ontwerpstudies van Blue Sass voor bewegingstests, geen klantprojecten of producten die te koop zijn.', open: 'Open de studie',
    finale: ['Eén idee.', 'Ruimte om te groeien.'], finaleText: 'Open een studie en keer terug naar de scène met de terugknop van uw browser.', navigate: 'Probeer de paginaovergang',
    back: 'Terug naar de scrollervaring', detail: 'Ontwerp in context.', detailIntro: 'Een interne studie van bewegende media en navigatie. De illustratieve inhoud is geen klantproject en gebruikt geen projectdatabase.',
    detailPoints: ['Heldere inhoud en een responsieve interface', 'Een compositie die zich aan het scherm aanpast', 'Navigatie met behoud van geschiedenis en toetsenbordbediening'], next: 'Volgende studie',
    studies: [
      { slug: 'responsive-experience', name: 'Een presentatie die meebeweegt.', text: 'Een samenhangende website op groot scherm en telefoon, van navigatie tot inhoud.', image: 'web-showcase' },
      { slug: 'product-system', name: 'Van structuur naar product.', text: 'Een interface van eerste wireframe tot bruikbare pagina, klaar voor ontwikkeling.', image: 'workflow' },
      { slug: 'care-dashboard', name: 'Overzicht na de lancering.', text: 'Een concept voor websitecontroles, rapporten en taken in één werkomgeving.', image: 'monitoring' },
    ],
  },
};
export const motionPreviewCopy = (locale: ActiveLocale) => copy[locale];
