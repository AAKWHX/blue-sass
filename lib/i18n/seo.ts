import { isLocale, type Locale } from "./config";
import { pageMetadata } from "../page-metadata";

export const publicPageKeys = ["home", "about", "services", "projects", "reviews", "contact", "subscriptions", "hosting", "create-project", "privacy", "terms", "company", "apps", "systems"] as const;
export type PublicPageKey = typeof publicPageKeys[number];

// Explicit copy for all fifteen locales, independent of runtime translation.
const titles: Record<Locale, readonly string[]> = {
 ar: ["تصميم مواقع وتطبيقات ومنتجات رقمية", "من نحن", "خدمات التصميم والتطوير", "أعمال ومشاريع بلو ساس", "آراء العملاء", "تواصل معنا", "اشتراكات فحص المواقع والتقارير", "استضافة المواقع", "ابدأ مشروعك", "سياسة الخصوصية", "شروط الاستخدام", "تصميم مواقع الشركات", "تطوير التطبيقات", "أنظمة الأعمال المخصصة"],
 en: ["Websites, apps and digital products", "About us", "Design and development services", "Our work and projects", "Client reviews", "Contact us", "Website review and report subscriptions", "Website hosting", "Start your project", "Privacy policy", "Terms of service", "Company website design", "Application development", "Custom business systems"],
 nl: ["Websites, apps en digitale producten", "Over ons", "Ontwerp en ontwikkeling", "Ons werk en projecten", "Klantbeoordelingen", "Neem contact op", "Abonnementen voor websitecontroles en rapporten", "Websitehosting", "Start uw project", "Privacybeleid", "Gebruiksvoorwaarden", "Bedrijfswebsites laten maken", "Applicatieontwikkeling", "Bedrijfssystemen op maat"],
 de: ["Websites, Apps und digitale Produkte", "Über uns", "Design und Entwicklung", "Unsere Arbeiten und Projekte", "Kundenbewertungen", "Kontakt", "Abonnements für Websiteprüfungen und Berichte", "Websitehosting", "Projekt starten", "Datenschutzerklärung", "Nutzungsbedingungen", "Unternehmenswebsites", "Anwendungsentwicklung", "Individuelle Unternehmenssysteme"],
 tr: ["Web siteleri, uygulamalar ve dijital ürünler", "Hakkımızda", "Tasarım ve geliştirme hizmetleri", "Çalışmalarımız ve projeler", "Müşteri yorumları", "İletişim", "Site denetimi ve rapor abonelikleri", "Web sitesi barındırma", "Projenizi başlatın", "Gizlilik politikası", "Kullanım koşulları", "Şirket sitesi tasarımı", "Uygulama geliştirme", "Özel iş sistemleri"],
 fr: ["Sites web, applications et produits numériques", "À propos", "Services de design et développement", "Réalisations et projets", "Avis clients", "Contactez-nous", "Abonnements aux audits et rapports web", "Hébergement web", "Démarrer votre projet", "Politique de confidentialité", "Conditions d’utilisation", "Sites web d’entreprise", "Développement d’applications", "Systèmes métier sur mesure"],
 es: ["Sitios web, aplicaciones y productos digitales", "Sobre nosotros", "Diseño y desarrollo", "Trabajos y proyectos", "Opiniones de clientes", "Contacto", "Suscripciones de auditorías e informes web", "Alojamiento web", "Inicie su proyecto", "Política de privacidad", "Condiciones de uso", "Sitios web de empresa", "Desarrollo de aplicaciones", "Sistemas empresariales a medida"],
 it: ["Siti web, app e prodotti digitali", "Chi siamo", "Design e sviluppo", "Lavori e progetti", "Recensioni dei clienti", "Contattaci", "Abbonamenti per analisi e rapporti web", "Hosting web", "Avvia il tuo progetto", "Informativa sulla privacy", "Condizioni d’uso", "Siti web aziendali", "Sviluppo di applicazioni", "Sistemi aziendali su misura"],
 pt: ["Sites, aplicações e produtos digitais", "Sobre nós", "Design e desenvolvimento", "Trabalhos e projetos", "Avaliações de clientes", "Contacte-nos", "Subscrições de análises e relatórios web", "Alojamento web", "Inicie o seu projeto", "Política de privacidade", "Termos de utilização", "Sites empresariais", "Desenvolvimento de aplicações", "Sistemas empresariais personalizados"],
 pl: ["Strony, aplikacje i produkty cyfrowe", "O nas", "Projektowanie i rozwój", "Realizacje i projekty", "Opinie klientów", "Kontakt", "Subskrypcje audytów i raportów stron", "Hosting stron", "Rozpocznij projekt", "Polityka prywatności", "Warunki korzystania", "Strony firmowe", "Tworzenie aplikacji", "Indywidualne systemy biznesowe"],
 uk: ["Сайти, застосунки та цифрові продукти", "Про нас", "Дизайн і розробка", "Наші роботи та проєкти", "Відгуки клієнтів", "Зв’яжіться з нами", "Підписки на перевірки сайтів і звіти", "Хостинг сайтів", "Розпочніть проєкт", "Політика конфіденційності", "Умови використання", "Корпоративні сайти", "Розробка застосунків", "Індивідуальні бізнес-системи"],
 ru: ["Сайты, приложения и цифровые продукты", "О нас", "Дизайн и разработка", "Наши работы и проекты", "Отзывы клиентов", "Свяжитесь с нами", "Подписки на проверки сайтов и отчёты", "Хостинг сайтов", "Начните проект", "Политика конфиденциальности", "Условия использования", "Корпоративные сайты", "Разработка приложений", "Индивидуальные бизнес-системы"],
 zh: ["网站、应用和数字产品", "关于我们", "设计与开发服务", "作品与项目", "客户评价", "联系我们", "网站检查与报告订阅", "网站托管", "开始您的项目", "隐私政策", "使用条款", "企业网站设计", "应用开发", "定制业务系统"],
 ja: ["ウェブサイト、アプリ、デジタル製品", "私たちについて", "デザインと開発サービス", "制作実績とプロジェクト", "お客様の声", "お問い合わせ", "サイト診断とレポートのサブスクリプション", "ウェブホスティング", "プロジェクトを始める", "プライバシーポリシー", "利用規約", "企業サイト制作", "アプリ開発", "業務システムの開発"],
 ko: ["웹사이트, 앱 및 디지털 제품", "회사 소개", "디자인 및 개발 서비스", "작업 및 프로젝트", "고객 후기", "문의하기", "사이트 점검 및 보고서 구독", "웹사이트 호스팅", "프로젝트 시작", "개인정보 처리방침", "이용약관", "기업 웹사이트 제작", "앱 개발", "맞춤형 업무 시스템"],
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
 ar: [introductions.ar, "تعرف على استوديو بلو ساس في هولندا وطريقة عمل فريق التصميم والتطوير.", "مواقع ومتاجر وتطبيقات وأنظمة أعمال مخصصة، مع تخطيط واضح وتصميم متجاوب وتنفيذ واختبار قبل الإطلاق.", "استعرض المشاريع المنشورة علنًا من مواقع وتطبيقات ومنتجات رقمية طورتها بلو ساس.", "اقرأ مراجعات العملاء المنشورة حول العمل مع بلو ساس.", "تواصل مع بلو ساس لمناقشة موقع أو تطبيق أو نظام رقمي، وأرسل استفسارك للفريق.", "قارن اشتراكات فحص المواقع والملفات والتقارير الخاصة وحدود الاستخدام.", "تعرف على استضافة مواقع Static ومشاريع Next.js وإدارة النشر من حسابك.", "حدد احتياجات مشروعك ونطاقه وقدّم طلبك لمراجعة الفريق.", "اقرأ كيفية جمع بلو ساس للبيانات الشخصية واستخدامها وحمايتها وخيارات الخصوصية.", "اقرأ شروط استخدام موقع بلو ساس وخدماته وبوابة العملاء.", "مواقع شركات تعرض خدماتك ومحتواك وتتيح للعملاء التواصل معك.", "استكشف تطوير تطبيقات أندرويد وآيفون وخيارات التصميم والتنفيذ.", "استكشف أنظمة الأعمال المخصصة وإدارة العمليات والتكاملات المناسبة لفريقك."],
 en: [introductions.en, "Meet the Netherlands-based Blue Sass studio and learn how its design and development team works.", "Custom websites, online stores, applications and business systems, with clear planning, responsive design and testing before launch.", "Explore publicly published websites, applications and digital products developed by Blue Sass.", "Read published client reviews about working with Blue Sass.", "Contact Blue Sass to discuss a website, application or digital system and send your enquiry to the team.", "Compare website and source review subscriptions, private reports and usage limits.", "Explore hosting for Static websites and Next.js projects, managed from your account.", "Define your project needs and scope, then submit your request for team review.", "Learn how Blue Sass collects, uses and protects personal data and review your privacy choices.", "Read the terms for using the Blue Sass website, services and client portal.", "Company websites that present your services and content and help customers contact you.", "Explore Android and iPhone application design and development options.", "Explore custom business systems, operational workflows and integrations for your team."],
 nl: [introductions.nl, "Maak kennis met de Nederlandse studio Blue Sass en de werkwijze van het ontwerp- en ontwikkelteam.", "Websites, webwinkels, apps en bedrijfssystemen op maat, met heldere planning, responsief ontwerp en tests vóór de lancering.", "Bekijk openbaar gepubliceerde websites, applicaties en digitale producten ontwikkeld door Blue Sass.", "Lees gepubliceerde klantbeoordelingen over samenwerken met Blue Sass.", "Bespreek uw website, applicatie of digitale systeem met Blue Sass en stuur uw vraag naar het team.", "Vergelijk abonnementen voor website- en broncodecontroles, privérapporten en gebruikslimieten.", "Bekijk hosting voor statische websites en Next.js-projecten, beheerd vanuit uw account.", "Beschrijf uw project en de gewenste omvang en stuur uw aanvraag ter beoordeling.", "Lees hoe Blue Sass persoonsgegevens verzamelt, gebruikt en beschermt en bekijk uw privacykeuzes.", "Lees de voorwaarden voor het gebruik van de website, diensten en het klantenportaal van Blue Sass.", "Bedrijfswebsites die uw diensten en inhoud presenteren en contact met klanten ondersteunen.", "Bekijk de mogelijkheden voor het ontwerpen en ontwikkelen van Android- en iPhone-apps.", "Bekijk bedrijfssystemen op maat, werkprocessen en koppelingen voor uw team."],
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
