import { isLocale, type Locale } from "./config";
import { pageMetadata } from "../page-metadata";

export const publicPageKeys = ["home", "services", "contact", "create-project", "privacy", "terms", "company", "apps", "systems"] as const;
export type PublicPageKey = typeof publicPageKeys[number];

// Explicit copy for all fifteen locales, independent of runtime translation.
const titles: Record<Locale, readonly string[]> = {
 ar: ["تصميم وتطوير المواقع والتطبيقات وأنظمة الأعمال", "خدمات التصميم والتطوير", "تواصل معنا", "ابدأ مشروعك", "سياسة الخصوصية", "شروط الاستخدام", "تصميم مواقع الشركات", "تطوير التطبيقات", "أنظمة الأعمال المخصصة"],
 en: ["Website, app and business system development", "Design and development services", "Contact us", "Start your project", "Privacy policy", "Terms of service", "Company website design", "Application development", "Custom business systems"],
 nl: ["Websites, apps en bedrijfssystemen", "Ontwerp en ontwikkeling", "Neem contact op", "Start uw project", "Privacybeleid", "Gebruiksvoorwaarden", "Bedrijfswebsites laten maken", "Applicatieontwikkeling", "Bedrijfssystemen op maat"],
 de: ["Websites, Apps und digitale Produkte", "Design und Entwicklung", "Kontakt", "Projekt starten", "Datenschutzerklärung", "Nutzungsbedingungen", "Unternehmenswebsites", "Anwendungsentwicklung", "Individuelle Unternehmenssysteme"],
 tr: ["Web siteleri, uygulamalar ve dijital ürünler", "Tasarım ve geliştirme hizmetleri", "İletişim", "Projenizi başlatın", "Gizlilik politikası", "Kullanım koşulları", "Şirket sitesi tasarımı", "Uygulama geliştirme", "Özel iş sistemleri"],
 fr: ["Sites web, applications et produits numériques", "Services de design et développement", "Contactez-nous", "Démarrer votre projet", "Politique de confidentialité", "Conditions d’utilisation", "Sites web d’entreprise", "Développement d’applications", "Systèmes métier sur mesure"],
 es: ["Sitios web, aplicaciones y productos digitales", "Diseño y desarrollo", "Contacto", "Inicie su proyecto", "Política de privacidad", "Condiciones de uso", "Sitios web de empresa", "Desarrollo de aplicaciones", "Sistemas empresariales a medida"],
 it: ["Siti web, app e prodotti digitali", "Design e sviluppo", "Contattaci", "Avvia il tuo progetto", "Informativa sulla privacy", "Condizioni d’uso", "Siti web aziendali", "Sviluppo di applicazioni", "Sistemi aziendali su misura"],
 pt: ["Sites, aplicações e produtos digitais", "Design e desenvolvimento", "Contacte-nos", "Inicie o seu projeto", "Política de privacidade", "Termos de utilização", "Sites empresariais", "Desenvolvimento de aplicações", "Sistemas empresariais personalizados"],
 pl: ["Strony, aplikacje i produkty cyfrowe", "Projektowanie i rozwój", "Kontakt", "Rozpocznij projekt", "Polityka prywatności", "Warunki korzystania", "Strony firmowe", "Tworzenie aplikacji", "Indywidualne systemy biznesowe"],
 uk: ["Сайти, застосунки та цифрові продукти", "Дизайн і розробка", "Зв’яжіться з нами", "Розпочніть проєкт", "Політика конфіденційності", "Умови використання", "Корпоративні сайти", "Розробка застосунків", "Індивідуальні бізнес-системи"],
 ru: ["Сайты, приложения и цифровые продукты", "Дизайн и разработка", "Свяжитесь с нами", "Начните проект", "Политика конфиденциальности", "Условия использования", "Корпоративные сайты", "Разработка приложений", "Индивидуальные бизнес-системы"],
 zh: ["网站、应用和数字产品", "设计与开发服务", "联系我们", "开始您的项目", "隐私政策", "使用条款", "企业网站设计", "应用开发", "定制业务系统"],
 ja: ["ウェブサイト、アプリ、デジタル製品", "デザインと開発サービス", "お問い合わせ", "プロジェクトを始める", "プライバシーポリシー", "利用規約", "企業サイト制作", "アプリ開発", "業務システムの開発"],
 ko: ["웹사이트, 앱 및 디지털 제품", "디자인 및 개발 서비스", "문의하기", "프로젝트 시작", "개인정보 처리방침", "이용약관", "기업 웹사이트 제작", "앱 개발", "맞춤형 업무 시스템"],
};
const introductions: Record<Locale, string> = {
 ar: "بلو ساس تصمم وتطور المواقع والتطبيقات والأنظمة الرقمية من الفكرة حتى الإطلاق.",
 en: "Blue Sass designs and develops websites, applications and digital systems from idea to launch.",
 nl: "Blue Sass ontwerpt en ontwikkelt websites, applicaties en digitale systemen van idee tot lancering.",
 de: "Blue Sass gestaltet und entwickelt Websites, Anwendungen und digitale Systeme von der Idee bis zum Start.",
 tr: "Blue Sass, fikirden yayına web siteleri, uygulamalar ve dijital sistemler tasarlar ve geliştirir.",
 fr: "Blue Sass conçoit et développe des sites, applications et systèmes numériques, de l’idée au lancement.",
 es: "Blue Sass diseña y desarrolla sitios, aplicaciones y sistemas digitales desde la idea hasta el lanzamiento.",
 it: "Blue Sass progetta e sviluppa siti, applicazioni e sistemi digitali dall’idea al lancio.",
 pt: "A Blue Sass concebe e desenvolve sites, aplicações e sistemas digitais da ideia ao lançamento.",
 pl: "Blue Sass projektuje i tworzy strony, aplikacje oraz systemy cyfrowe od pomysłu do wdrożenia.",
 uk: "Blue Sass проєктує та розробляє сайти, застосунки й цифрові системи від ідеї до запуску.",
 ru: "Blue Sass проектирует и разрабатывает сайты, приложения и цифровые системы от идеи до запуска.",
 zh: "Blue Sass 提供从创意到上线的网站、应用和数字系统设计与开发服务。",
 ja: "Blue Sassは、企画から公開までウェブサイト、アプリ、デジタルシステムを設計・開発します。",
 ko: "Blue Sass는 아이디어부터 출시까지 웹사이트, 앱 및 디지털 시스템을 설계하고 개발합니다.",
};
const descriptions: Partial<Record<Locale, readonly string[]>> = {
 ar: [introductions.ar, "مواقع ومتاجر وتطبيقات وأنظمة أعمال مخصصة، مع تخطيط واضح وتصميم متجاوب وتنفيذ واختبار قبل الإطلاق.", "تواصل مع بلو ساس لمناقشة موقع أو تطبيق أو نظام رقمي، وأرسل استفسارك للفريق.", "حدد احتياجات مشروعك ونطاقه وقدّم طلبك لمراجعة الفريق.", "اقرأ كيفية جمع بلو ساس للبيانات الشخصية واستخدامها وحمايتها وخيارات الخصوصية.", "اقرأ شروط استخدام موقع بلو ساس وخدماته وبوابة العملاء.", "مواقع شركات تعرض خدماتك ومحتواك وتتيح للعملاء التواصل معك.", "استكشف تطوير تطبيقات أندرويد وآيفون وخيارات التصميم والتنفيذ.", "استكشف أنظمة الأعمال المخصصة وإدارة العمليات والتكاملات المناسبة لفريقك."],
 en: [introductions.en, "Custom websites, online stores, applications and business systems, with clear planning, responsive design and testing before launch.", "Contact Blue Sass to discuss a website, application or digital system and send your enquiry to the team.", "Define your project needs and scope, then submit your request for team review.", "Learn how Blue Sass collects, uses and protects personal data and review your privacy choices.", "Read the terms for using the Blue Sass website, services and client portal.", "Company websites that present your services and content and help customers contact you.", "Explore Android and iPhone application design and development options.", "Explore custom business systems, operational workflows and integrations for your team."],
 nl: [introductions.nl, "Websites, webwinkels, apps en bedrijfssystemen op maat, met heldere planning, responsief ontwerp en tests vóór de lancering.", "Bespreek uw website, applicatie of digitale systeem met Blue Sass en stuur uw vraag naar het team.", "Beschrijf uw project en de gewenste omvang en stuur uw aanvraag ter beoordeling.", "Lees hoe Blue Sass persoonsgegevens verzamelt, gebruikt en beschermt en bekijk uw privacykeuzes.", "Lees de voorwaarden voor het gebruik van de website, diensten en het klantenportaal van Blue Sass.", "Bedrijfswebsites die uw diensten en inhoud presenteren en contact met klanten ondersteunen.", "Bekijk de mogelijkheden voor het ontwerpen en ontwikkelen van Android- en iPhone-apps.", "Bekijk bedrijfssystemen op maat, werkprocessen en koppelingen voor uw team."],
};
export function publicPageCopy(locale: Locale, key: PublicPageKey) {
 const index = publicPageKeys.indexOf(key);
 const title = titles[locale][index];
 return { title, description: descriptions[locale]?.[index] ?? `${title}. ${introductions[locale]}` };
}
export function publicPageMetadata(locale: string, key: PublicPageKey, path: string) {
 if (!isLocale(locale)) return {};
 const copy = publicPageCopy(locale, key);
 return pageMetadata(locale, path, `${copy.title} | ${locale === "ar" ? "بلو ساس" : "Blue Sass"}`, copy.description);
}
