import { withExtraLocales } from "@/lib/i18n/extra-locales";
import type { Locale } from "@/lib/i18n";
import type { ServiceSlug } from "@/lib/service-catalog";

export type ServiceDetail = { idealFor: string; timeline: string; outcome: string };

const rows: Record<Locale, string[]> = withExtraLocales({
  ar: [
    "الشركات والخدمات التي تحتاج حضورًا رقميًا واضحًا وجلب طلبات جديدة.|4–8 أسابيع|موقع سريع ومتجاوب، قابل للإدارة ومهيأ للبحث والتحويل.",
    "الخدمات والمنصات التي تريد الوصول إلى مستخدمي أندرويد.|10–16 أسبوعًا|تطبيق أندرويد جاهز للاختبار والنشر مع لوحة وخدمات خلفية عند الحاجة.",
    "العلامات التي تستهدف مستخدمي iPhone وتحتاج تجربة أصلية دقيقة.|10–16 أسبوعًا|تطبيق iOS متوافق مع إرشادات Apple ومجهز لعملية App Store.",
    "الفرق التي تحتاج أداة داخلية قوية تعمل على أجهزة ويندوز.|8–16 أسبوعًا|برنامج مكتبي بصلاحيات وتقارير وتحديثات ونشر منظم.",
    "العلامات التي تريد بيع المنتجات وإدارة الطلبات والدفع والشحن.|8–14 أسبوعًا|متجر متكامل سريع وسهل الإدارة مع رحلة شراء واضحة.",
    "الشركات التي تريد جمع العملاء والمهام والعمليات في نظام واحد.|12–24 أسبوعًا|نظام أعمال بصلاحيات ولوحات وتقارير ومسارات عمل قابلة للتوسع.",
    "الفرق التي تهدر وقتًا في المهام المتكررة أو معالجة البيانات.|6–14 أسبوعًا|حل أتمتة أو مساعد ذكي موصول بأدواتك مع قياس واضح للنتائج.",
    "المشاريع الجديدة أو المنتجات التي تحتاج واجهات وهوية متماسكة.|3–7 أسابيع|نظام بصري، ملفات هوية، ونموذج واجهات جاهز للتطوير.",
  ],
  en: [
    "Businesses that need a clear digital presence and more qualified enquiries.|4–8 weeks|A fast, responsive, manageable website built for search and conversion.",
    "Services and platforms that need to reach Android users.|10–16 weeks|A testable, release-ready Android app with backend services when needed.",
    "Brands targeting iPhone users with a refined native experience.|10–16 weeks|An iOS app aligned with Apple guidance and prepared for App Store delivery.",
    "Teams that need a capable internal tool on Windows devices.|8–16 weeks|A desktop application with permissions, reporting, updates and controlled deployment.",
    "Brands ready to sell products and manage orders, payments and shipping.|8–14 weeks|A manageable high-speed store with a clear purchase journey.",
    "Companies that want clients, tasks and operations in one system.|12–24 weeks|A scalable business system with roles, dashboards, reports and workflows.",
    "Teams losing time to repetitive work or data processing.|6–14 weeks|An automation or AI assistant connected to your tools with measurable outcomes.",
    "New ventures and products that need a consistent identity and interface.|3–7 weeks|A visual system, identity files and an interface prototype ready for development.",
  ],
  nl: [
    "Bedrijven die een heldere digitale aanwezigheid en meer aanvragen nodig hebben.|4–8 weken|Een snelle, responsieve en beheerbare website voor vindbaarheid en conversie.",
    "Diensten en platforms die Android-gebruikers willen bereiken.|10–16 weken|Een testbare Android-app, gereed voor publicatie en backendkoppelingen.",
    "Merken die iPhone-gebruikers een verfijnde ervaring willen bieden.|10–16 weken|Een iOS-app volgens Apple-richtlijnen, voorbereid voor de App Store.",
    "Teams die een krachtige interne Windows-tool nodig hebben.|8–16 weken|Desktopsoftware met rechten, rapporten, updates en gecontroleerde uitrol.",
    "Merken die producten, bestellingen, betalingen en verzending beheren.|8–14 weken|Een snelle, beheerbare winkel met een duidelijke kooproute.",
    "Bedrijven die klanten, taken en processen willen centraliseren.|12–24 weken|Een schaalbaar systeem met rollen, dashboards, rapporten en workflows.",
    "Teams die tijd verliezen aan herhaalwerk of gegevensverwerking.|6–14 weken|Automatisering of AI gekoppeld aan uw tools met meetbare resultaten.",
    "Nieuwe merken en producten die identiteit en interfaces nodig hebben.|3–7 weken|Een visueel systeem, huisstijlbestanden en een ontwikkelklaar prototype.",
  ],
  de: [
    "Unternehmen, die einen klaren Auftritt und mehr qualifizierte Anfragen benötigen.|4–8 Wochen|Eine schnelle, responsive und pflegbare Website für Suche und Konversion.",
    "Dienste und Plattformen für Android-Nutzer.|10–16 Wochen|Eine test- und veröffentlichungsbereite Android-App mit Backend bei Bedarf.",
    "Marken mit Fokus auf eine hochwertige native iPhone-Erfahrung.|10–16 Wochen|Eine iOS-App nach Apple-Richtlinien, bereit für den App Store.",
    "Teams, die ein leistungsfähiges internes Windows-Werkzeug benötigen.|8–16 Wochen|Desktopsoftware mit Rechten, Berichten, Updates und geregelter Bereitstellung.",
    "Marken, die Produkte, Bestellungen, Zahlung und Versand verwalten.|8–14 Wochen|Ein schneller, pflegbarer Shop mit klarer Kaufstrecke.",
    "Unternehmen, die Kunden, Aufgaben und Prozesse zentralisieren möchten.|12–24 Wochen|Ein skalierbares System mit Rollen, Dashboards, Berichten und Workflows.",
    "Teams mit zeitaufwendigen Routine- oder Datenaufgaben.|6–14 Wochen|Automatisierung oder KI, verbunden mit Ihren Werkzeugen und messbaren Ergebnissen.",
    "Neue Marken und Produkte mit Bedarf an Identität und Oberflächen.|3–7 Wochen|Visuelles System, Markendateien und entwicklungsbereiter Prototyp.",
  ],
  tr: [
    "Net dijital görünürlük ve daha nitelikli talep isteyen işletmeler.|4–8 hafta|Arama ve dönüşüm için hızlı, duyarlı ve yönetilebilir bir site.",
    "Android kullanıcılarına ulaşmak isteyen hizmet ve platformlar.|10–16 hafta|Test ve yayın için hazır, gerektiğinde backend bağlı Android uygulaması.",
    "iPhone kullanıcılarına rafine yerel deneyim sunan markalar.|10–16 hafta|Apple kurallarına uygun, App Store sürecine hazır iOS uygulaması.",
    "Windows üzerinde güçlü bir iç araca ihtiyaç duyan ekipler.|8–16 hafta|Yetki, rapor, güncelleme ve kontrollü dağıtım içeren masaüstü yazılımı.",
    "Ürün, sipariş, ödeme ve kargoyu yönetmek isteyen markalar.|8–14 hafta|Net satın alma yoluna sahip hızlı ve yönetilebilir mağaza.",
    "Müşteri, görev ve süreçleri tek yerde toplamak isteyen şirketler.|12–24 hafta|Rol, panel, rapor ve iş akışları içeren ölçeklenebilir sistem.",
    "Tekrarlı işlere veya veri işlemeye zaman kaybeden ekipler.|6–14 hafta|Araçlarınıza bağlı, ölçülebilir sonuç üreten otomasyon veya yapay zekâ.",
    "Tutarlı kimlik ve arayüz isteyen yeni girişim ve ürünler.|3–7 hafta|Görsel sistem, marka dosyaları ve geliştirmeye hazır arayüz prototipi.",
  ],
  fr: [
    "Entreprises recherchant une présence claire et davantage de demandes qualifiées.|4–8 semaines|Un site rapide, adaptatif, administrable et pensé pour la conversion.",
    "Services et plateformes souhaitant atteindre les utilisateurs Android.|10–16 semaines|Une application Android testable et prête à publier, avec backend si nécessaire.",
    "Marques visant une expérience iPhone native et soignée.|10–16 semaines|Une application iOS conforme aux recommandations Apple et prête pour l’App Store.",
    "Équipes ayant besoin d’un outil interne performant sous Windows.|8–16 semaines|Un logiciel avec droits, rapports, mises à jour et déploiement contrôlé.",
    "Marques gérant produits, commandes, paiements et livraison.|8–14 semaines|Une boutique rapide et administrable au parcours d’achat clair.",
    "Entreprises centralisant clients, tâches et opérations.|12–24 semaines|Un système évolutif avec rôles, tableaux de bord, rapports et workflows.",
    "Équipes perdant du temps dans les tâches répétitives ou les données.|6–14 semaines|Une automatisation ou IA connectée à vos outils avec résultats mesurables.",
    "Nouvelles marques et produits nécessitant identité et interfaces cohérentes.|3–7 semaines|Un système visuel, des fichiers d’identité et un prototype prêt à développer.",
  ],
  es: [
    "Empresas que necesitan presencia clara y más solicitudes cualificadas.|4–8 semanas|Un sitio rápido, adaptable, administrable y orientado a conversión.",
    "Servicios y plataformas que quieren llegar a usuarios Android.|10–16 semanas|Una app Android lista para pruebas y publicación, con backend si se necesita.",
    "Marcas enfocadas en una experiencia nativa refinada para iPhone.|10–16 semanas|Una app iOS alineada con Apple y preparada para App Store.",
    "Equipos que necesitan una herramienta interna potente para Windows.|8–16 semanas|Software de escritorio con permisos, informes, actualizaciones y despliegue controlado.",
    "Marcas que venden productos y gestionan pedidos, pagos y envíos.|8–14 semanas|Una tienda rápida y administrable con un recorrido de compra claro.",
    "Empresas que quieren centralizar clientes, tareas y operaciones.|12–24 semanas|Un sistema escalable con roles, paneles, informes y flujos de trabajo.",
    "Equipos que pierden tiempo en tareas repetitivas o datos.|6–14 semanas|Automatización o IA conectada a sus herramientas con resultados medibles.",
    "Nuevas marcas y productos que necesitan identidad e interfaces coherentes.|3–7 semanas|Sistema visual, archivos de identidad y prototipo listo para desarrollo.",
  ],
});

export function serviceDetails(locale: Locale): Record<ServiceSlug, ServiceDetail> {
  const slugs: ServiceSlug[] = ["web", "android", "ios", "windows", "store", "erp", "ai", "design"];
  return Object.fromEntries(rows[locale].map((row, index) => {
    const [idealFor, timeline, outcome] = row.split("|");
    return [slugs[index], { idealFor, timeline, outcome }];
  })) as Record<ServiceSlug, ServiceDetail>;
}

export const serviceQuotePresets = {
  web: { type: "web", features: ["cms", "i18n", "api"], options: ["auth", "dashboard", "i18n", "cms", "api", "realtime"] },
  android: { type: "mobile", features: ["auth", "api", "realtime"], options: ["auth", "payments", "api", "realtime", "appstore", "offline"] },
  ios: { type: "mobile", features: ["auth", "payments", "appstore"], options: ["auth", "payments", "api", "realtime", "appstore", "offline"] },
  windows: { type: "erp", features: ["auth", "dashboard", "offline"], options: ["auth", "dashboard", "api", "offline", "automation"] },
  store: { type: "ecommerce", features: ["auth", "payments", "catalog"], options: ["auth", "payments", "catalog", "cms", "i18n", "dashboard"] },
  erp: { type: "erp", features: ["auth", "dashboard", "automation"], options: ["auth", "dashboard", "api", "realtime", "automation", "ai"] },
  ai: { type: "ai", features: ["dashboard", "api", "ai"], options: ["ai", "automation", "api", "dashboard", "realtime"] },
  design: { type: "brand", features: ["identity", "prototype"], options: ["identity", "prototype", "i18n"] },
} as const;

export interface ServiceExtendedInfo {
  overview: string;
  audienceItems: readonly string[];
  technologies: readonly string[];
  processDetails: readonly string[];
  faqs: readonly { q: string; a: string }[];
}

type ActiveKey = "ar" | "en" | "nl";
const activeKey = (locale: Locale): ActiveKey => (locale === "ar" || locale === "nl" ? locale : "en");

export const serviceSectionLabels = (locale: Locale) => ({
  ar: {
    overviewTitle: "نظرة عامة ونطاق التنفيذ الهندسي",
    suitableTitle: "لمن صُممت هذه الخدمة؟",
    timelineTitle: "المدة المتوقعة للتنفيذ",
    techTitle: "التقنيات والمعايير المعتمدة",
    pricingTitle: "التكلفة المرجعية والوحدات الاختيارية",
    pricingNote: "الأسعار الموضحة هي تقديرات تنفيذ أولية باليورو (EUR) وفق جدول الأسعار المعتمد في Blue Sass. يتم تحديد النطاق النهائي والجدول الزمني والعقد المكتوب قبل بدء أي تنفيذ.",
    baseLabel: "تقدير التنفيذ الأساسي يبدأ من",
    depositLabel: "دفعة حجز المرحلة بعد الاتفاق المكتوب",
    optionsLabel: "إضافات ووحدات اختيارية حسب احتياج المشروع",
    weeksUnit: "أسابيع",
    faqTitle: "الأسئلة الشائعة حول هذه الخدمة",
  },
  en: {
    overviewTitle: "Architectural overview & delivery scope",
    suitableTitle: "Who this service is designed for",
    timelineTitle: "Typical delivery timeline",
    techTitle: "Technologies & engineering standards",
    pricingTitle: "Approved implementation pricing & optional modules",
    pricingNote: "Prices shown are initial implementation estimates in EUR based on our approved service catalog. Final scope, milestone schedule, and written agreement are confirmed before development begins.",
    baseLabel: "Starting implementation estimate",
    depositLabel: "Stage reservation after written agreement",
    optionsLabel: "Optional modules & capabilities",
    weeksUnit: "weeks",
    faqTitle: "Frequently asked questions",
  },
  nl: {
    overviewTitle: "Architectuuroverzicht & opleveringsscope",
    suitableTitle: "Voor wie deze dienst is bedoeld",
    timelineTitle: "Gebruikelijke doorlooptijd",
    techTitle: "Technologieën & ontwikkelstandaarden",
    pricingTitle: "Richtprijzen voor implementatie & optionele modules",
    pricingNote: "De getoonde bedragen zijn initiële implementatieschattingen in EUR op basis van onze goedgekeurde catalogus. De definitieve scope, planning en schriftelijke overeenkomst worden vóór aanvang vastgelegd.",
    baseLabel: "Vanafprijs voor basisimplementatie",
    depositLabel: "Reserveringsbedrag na schriftelijk akkoord",
    optionsLabel: "Optionele modules & uitbreidingen",
    weeksUnit: "weken",
    faqTitle: "Veelgestelde vragen over deze dienst",
  },
}[activeKey(locale)]);

const extendedData: Record<ActiveKey, Record<ServiceSlug, ServiceExtendedInfo>> = {
  en: {
    web: {
      overview: "We design and engineer fast, accessible websites built around clear information architecture, structured metadata, and maintainable content workflows. Every project is planned from actual page hierarchy and user journeys rather than generic templates, ensuring stable layout rendering on mobile and desktop, clean semantic HTML, and straightforward content updates after launch.",
      audienceItems: [
        "Service companies and consultancies that need a trustworthy multilingual presence and structured inquiry capture.",
        "Growing organizations replacing slow or fragmented legacy websites with a maintainable modern web architecture.",
        "Product teams launching a dedicated marketing and documentation site with RTL/LTR language parity.",
      ],
      technologies: ["Next.js & React Server Components", "TypeScript & strict schema validation", "Responsive CSS Grid & Tailwind CSS", "Technical SEO (canonical, hreflang, JSON-LD)", "Accessible WCAG-aligned HTML semantics"],
      processDetails: [
        "Define the homepage narrative, core value proposition, and primary visitor conversion paths.",
        "Structure dedicated service pages with clear deliverables, pricing context, and scannable headings.",
        "Organize portfolio, case documentation, or resource sections around verified business materials.",
        "Implement validated contact and inquiry flows with spam protection and direct routing to your team.",
      ],
      faqs: [
        { q: "Can we update text and images ourselves after launch?", a: "Yes. When content management is included in your scope, we provide a structured editing workflow so your team can update copy, media, and pages without editing source code." },
        { q: "Does the website support Arabic (RTL) and European languages (LTR) simultaneously?", a: "Yes. We build native server-rendered RTL and LTR layouts with proper typography, canonical URLs, and reciprocal hreflang tags for Arabic, English, Dutch, and additional languages." },
        { q: "Are hosting and domain registration included in the implementation estimate?", a: "The implementation estimate covers design, development, testing, and deployment preparation. Domain registration and third-party hosting subscriptions remain directly in your company's name so you retain full ownership." },
      ],
    },
    android: {
      overview: "We build Android applications focused on responsive touch interactions, reliable API communication, and disciplined device permission handling. From authentication and push notifications to offline caching and Google Play release packaging, each screen is tested across form factors before store submission.",
      audienceItems: [
        "Businesses extending an existing web platform or booking service to customers on Android phones and tablets.",
        "Field operations and delivery teams requiring reliable mobile workflows, camera/QR scanning, or offline state.",
        "Startups building a focused MVP for Google Play with a clean backend API contract.",
      ],
      technologies: ["Android SDK & modern declarative UI", "REST / JSON API integration with token auth", "Push notifications (FCM) & background sync", "Local encrypted storage & offline queueing", "Signed AAB release packaging for Google Play"],
      processDetails: [
        "Design onboarding, account sign-in, and session persistence with minimal friction.",
        "Implement the core service screens, validation states, and backend API synchronization.",
        "Configure opt-in push notifications and device permissions strictly where required by features.",
        "Provide account management, privacy controls, and signed release bundles for Google Play review.",
      ],
      faqs: [
        { q: "Do you publish the app to our own Google Play Console account?", a: "Yes. We prepare the signed Android App Bundle (AAB), store listing specifications, and privacy disclosures for your organization's Google Play Console account. Final publication is subject to Google Play review." },
        { q: "Can the Android app connect to our existing database or ERP?", a: "Yes, through a documented HTTPS API layer. We design or integrate secure API endpoints so the mobile app never exposes database credentials on the device." },
        { q: "What happens if users lose network connectivity?", a: "If offline support is selected in your project scope, key read views and queued actions are cached locally and synchronized once connectivity returns." },
      ],
    },
    ios: {
      overview: "We develop iPhone applications aligned with Apple's Human Interface Guidelines, focusing on smooth navigation, clear typography, and strict privacy compliance. Every build goes through structured TestFlight validation and App Store privacy nutrition label preparation before submission.",
      audienceItems: [
        "Consumer and professional brands serving iPhone audiences who expect native iOS polish and accessibility.",
        "Platforms launching companion iOS apps alongside their existing web or Android services.",
        "Organizations requiring secure sign-in, account deletion compliance, and clean App Store Connect handover.",
      ],
      technologies: ["iOS native interface patterns & Swift/SwiftUI architecture", "Secure Keychain session & token storage", "Apple Human Interface Guidelines & Dynamic Type", "TestFlight beta distribution & crash diagnostics", "App Store Connect privacy disclosures & review prep"],
      processDetails: [
        "Shape core iPhone navigation, gestures, and screen layouts around iOS conventions.",
        "Deliver staged builds through TestFlight so stakeholders can test on physical iPhones early.",
        "Document all permission prompts, data collection disclosures, and in-app account deletion flows.",
        "Package final release binaries, screenshots, and review notes for Apple App Store submission.",
      ],
      faqs: [
        { q: "What is required from us for Apple App Store submission?", a: "You will need an active Apple Developer Program account in your individual or company name. We assist with configuring certificates, provisioning profiles, TestFlight, and App Store Connect metadata." },
        { q: "Does Apple guarantee approval on the first submission?", a: "App Store acceptance is always decided by Apple's review team. We engineer the app around Apple's current review guidelines—including privacy prompts and account deletion rules—and address technical review feedback within the agreed scope." },
        { q: "Can we build both Android and iPhone apps together?", a: "Yes. When both platforms are required, we align the backend API, data models, and visual design system so both apps move forward on a coordinated schedule." },
      ],
    },
    windows: {
      overview: "We engineer desktop software for Windows environments where teams work with local files, structured operational records, hardware peripherals, or internal networks. Applications are built with role-based permissions, predictable keyboard-driven interfaces, exportable reports, and documented installer packages.",
      audienceItems: [
        "Operations, logistics, and administrative teams managing daily workflows on Windows workstations.",
        "Organizations that require controlled local file processing, PDF/CSV reporting, or offline capability.",
        "Businesses replacing fragile spreadsheet macros or outdated legacy desktop utilities.",
      ],
      technologies: ["Windows desktop application architecture", "Local & networked data storage with backup routines", "Role-based access control & audit logging", "PDF, Excel/CSV, and print-ready report generation", "Versioned installer packages & deployment documentation"],
      processDetails: [
        "Map the file formats, folder structures, and data imports your team uses every day.",
        "Build streamlined desktop screens for daily data entry, search, validation, and processing.",
        "Implement structured summaries, printable documents, and exportable operational reports.",
        "Deliver a documented installer, update workflow, and administrator guide for your IT environment.",
      ],
      faqs: [
        { q: "Can the Windows software work without an internet connection?", a: "Yes. Desktop tools can be architected for purely local operation, local network databases, or hybrid offline work with scheduled synchronization." },
        { q: "How is the software installed across multiple office computers?", a: "We provide a standard installer package along with clear setup documentation so your team or IT administrator can deploy and update the application predictably." },
        { q: "Can different staff members have different permissions?", a: "Yes. When authentication and role permissions are included, administrators can restrict sensitive actions, exports, or configuration screens by role." },
      ],
    },
    store: {
      overview: "We build online stores designed around fast product discovery, structured variant and inventory management, and verified checkout integrations. Before writing checkout code, we align on your target markets, currency, tax rules, shipping zones, and payment provider requirements.",
      audienceItems: [
        "Retailers and product brands launching a dedicated direct-to-consumer online storefront.",
        "Merchants outgrowing rigid store templates who need custom catalog rules, multilingual pages, or B2B pricing.",
        "Businesses requiring clean order status tracking and verified payment webhook reconciliation.",
      ],
      technologies: ["Structured product, category & SKU variant schemas", "Server-side cart & order state validation", "Verified payment gateway checkout & webhooks (Stripe / PayPal)", "Automated order confirmation & status notifications", "Search-friendly product metadata & Open Graph tags"],
      processDetails: [
        "Organize categories, filters, product media, and specification tables for fast browsing.",
        "Build a clear cart summary with transparent shipping, tax, and variant selection.",
        "Integrate approved payment providers with server-side amount verification and idempotency.",
        "Provide an order management workspace and customer status updates from purchase to delivery.",
      ],
      faqs: [
        { q: "Which payment providers can be integrated?", a: "We support established providers such as Stripe and PayPal using hosted checkout sessions and cryptographically verified webhooks, subject to merchant account approval by the payment provider." },
        { q: "Can we manage products, prices, and stock levels ourselves?", a: "Yes. Your store includes catalog and order management capabilities so your team can update products, variants, pricing, and order fulfillment states." },
        { q: "How are taxes, shipping, and returns handled?", a: "Before development starts, we document your shipping regions, VAT/tax rates, and return policy so they are accurately reflected in the checkout flow and legal pages." },
      ],
    },
    erp: {
      overview: "We design and build custom business systems that consolidate customer records, quotations, task assignments, approvals, and operational reporting into one secure web application. Instead of forcing your company into rigid off-the-shelf software, each module is shaped around your actual workflow and permission model.",
      audienceItems: [
        "Service companies managing client intake, quotations, project stages, and team allocation across departments.",
        "Growing businesses replacing disconnected spreadsheets, chat threads, and manual status tracking.",
        "Organizations that require strict role-based data boundaries and traceable change histories.",
      ],
      technologies: ["PostgreSQL relational schema & Drizzle ORM", "Role-based access control (RBAC) & row-level boundaries", "Server-validated mutations & audit logs", "Real-time status dashboards & filtered data tables", "REST API connectors for external business tools"],
      processDetails: [
        "Capture incoming leads, client profiles, and structured requirements in a central registry.",
        "Generate, review, and approve project scopes, quotes, or internal work orders with clear status transitions.",
        "Assign tasks to team members with role-specific views, deadlines, and progress checkpoints.",
        "Monitor operational KPIs, financial summaries, and exportable activity reports from a unified dashboard.",
      ],
      faqs: [
        { q: "How do you prevent employees from seeing data outside their role?", a: "Permissions are enforced server-side on every query and mutation. Each staff account is granted explicit capabilities—such as reading assigned projects vs. managing billing or staff." },
        { q: "Can we start with a core system and add modules later?", a: "Yes. We recommend launching with your highest-impact operational workflow first, using a clean relational database schema that can be extended in future phases." },
        { q: "Can the system integrate with our existing accounting or email tools?", a: "Yes. Within the agreed project scope, we can connect external services that provide documented REST APIs or webhooks." },
      ],
    },
    ai: {
      overview: "We build practical AI assistants and workflow automations that connect your approved business documents, forms, or operational tools to repeatable processing steps. Every automation is engineered with explicit input validation, human-in-the-loop review where accuracy is critical, usage/cost ceilings, and clear fallback behavior.",
      audienceItems: [
        "Support and operations teams handling high volumes of repetitive inquiries, intake forms, or document classification.",
        "Companies wanting an internal knowledge assistant grounded strictly in their own approved manuals and policies.",
        "Teams automating multi-step data transfer and validation between internal systems.",
      ],
      technologies: ["AI SDK orchestration & structured JSON schema outputs", "Retrieval and grounding over approved document sets", "Server-side rate limiting, token budgets & cost guards", "Human-in-the-loop approval queues & audit trails", "Secure API credential isolation & provider fallbacks"],
      processDetails: [
        "Select and sanitize the approved documents, templates, or database records the assistant may reference.",
        "Define the exact extraction, classification, drafting, or routing steps with strict schema validation.",
        "Place human review checkpoints before any external customer message or critical record mutation is finalized.",
        "Log outcomes, latency, and token usage so your team can audit performance and control monthly spend.",
      ],
      faqs: [
        { q: "Do you guarantee 100% accuracy from AI models?", a: "No—language models can produce inaccurate or incomplete outputs. That is why we design automations with structured schema validation, restricted source grounding, human review steps for critical actions, and clear fallbacks." },
        { q: "Are our private business documents used to train public AI models?", a: "We connect via commercial API endpoints and never expose API keys to the browser. We also help you review the data retention policies of your chosen AI provider before deployment." },
        { q: "How are recurring AI API costs controlled?", a: "We implement request rate limits, input size bounds, and configurable usage caps so API consumption stays predictable." },
      ],
    },
    design: {
      overview: "We create cohesive brand identities, design systems, and interactive UI/UX prototypes that clarify how your product looks and works before engineering begins. By resolving user journeys, empty/error states, and RTL/LTR typography upfront, your development phase moves faster with fewer costly revisions.",
      audienceItems: [
        "New ventures establishing a distinctive visual identity, logo mark, color palette, and typography system.",
        "Product teams validating complex web or mobile workflows through an interactive prototype before coding.",
        "Organizations redesigning an existing interface to improve clarity, accessibility, and mobile usability.",
      ],
      technologies: ["Figma component systems & design tokens", "Bilingual RTL (Arabic) & LTR (Latin) typography scales", "Interactive user-flow prototypes (hover, loading & error states)", "WCAG contrast & tap-target accessibility verification", "Developer handoff specifications & SVG/WebP asset kits"],
      processDetails: [
        "Establish the visual direction, mood, layout grid, and brand character tailored to your audience.",
        "Define the logo mark, color tokens, contrast rules, and multilingual typography hierarchy.",
        "Design reusable UI components, forms, navigation patterns, and responsive screen states.",
        "Deliver an interactive clickable prototype and organized asset specifications ready for engineering.",
      ],
      faqs: [
        { q: "Can we order interface and brand design before committing to full development?", a: "Yes. Many clients start with the design and interactive prototype track to validate their product concept and user flows before scheduling software development." },
        { q: "What files do we receive upon completion?", a: "You receive organized vector brand assets (SVG/PNG), color and typography documentation, complete screen designs including mobile/desktop breakpoints, and developer handoff specifications." },
        { q: "Do you design for both Arabic (RTL) and English/Dutch (LTR)?", a: "Yes. We design layouts, spacing, directional icons, and font pairings so the interface feels native in both right-to-left and left-to-right languages." },
      ],
    },
  },
  ar: {
    web: {
      overview: "نصمّم ونطوّر مواقع ويب سريعة ومتجاوبة تعتمد على هيكلة معلومات واضحة، وبيانات وصفية منظمة لمحركات البحث، وتجربة قراءة مريحة على الهاتف وسطح المكتب. يُبنى كل موقع وفق تسلسل صفحاتك الفعلي ورحلة العميل المستهدف، مع دعم أصلي للعربية (RTL) واللغات الأوروبية (LTR) وسهولة تحديث المحتوى بعد الإطلاق.",
      audienceItems: [
        "الشركات والمكاتب المهنية التي تحتاج حضورًا رقميًا موثوقًا متعدد اللغات لاستقبال طلبات العملاء.",
        "المؤسسات التي ترغب في استبدال موقع قديم أو بطيء ببنية ويب حديثة وسريعة التحميل.",
        "الفرق التي تطلق خدمة أو منتجًا جديدًا وتحتاج صفحات تعريفية وتوثيقية واضحة.",
      ],
      technologies: ["Next.js ومكونات React الخادمية", "TypeScript والتحقق الصارم من البيانات", "تصميم متجاوب عبر CSS Grid وTailwind CSS", "تهيئة محركات البحث (Canonical، hreflang، JSON-LD)", "معايير الوصول الدلالية المتوافقة مع WCAG"],
      processDetails: [
        "صياغة الرسالة الأساسية للصفحة الرئيسية وتوضيح القيمة التي تقدمها شركتك ومسار التواصل المباشر.",
        "بناء صفحات خدمات تفصيلية توضح المخرجات والمدة والتكلفة المرجعية بعناوين واضحة.",
        "تنظيم قسم الأعمال أو النماذج التعريفية بالاعتماد على مواد شركتك الحقيقية والمعتمدة.",
        "تنفيذ نماذج تواصل واستفسار محمية ومرتبطة مباشرة بفرق العمل لديك.",
      ],
      faqs: [
        { q: "هل يمكننا تعديل النصوص والصور بأنفسنا بعد استلام الموقع؟", a: "نعم. عند تضمين إدارة المحتوى في نطاق المشروع، نوفر آلية منظمة تتيح لفريقك تحديث النصوص والصور والصفحات دون الحاجة لتعديل الكود البرمجي." },
        { q: "هل يدعم الموقع اللغة العربية (RTL) والإنجليزية أو الهولندية (LTR) معًا؟", a: "نعم. نبني الموقع بدعم خادمي أصلي لاتجاه الكتابة من اليمين إلى اليسار ومن اليسار إلى اليمين، مع خطوط مخصصة وروابط hreflang متبادلة لكل لغة." },
        { q: "هل يشمل التقدير تكلفة الدومين والاستضافة الخارجية؟", a: "يشمل تقدير التنفيذ التصميم والبرمجة والاختبار والتجهيز للإطلاق. أما حجز النطاق (Domain) واشتراكات الاستضافة فتكون باسم شركتك مباشرة لضمان ملكيتك الكاملة لها." },
      ],
    },
    android: {
      overview: "نطوّر تطبيقات أندرويد تركز على سلاسة الاستخدام اليومي، والربط الآمن مع قواعد البيانات عبر واجهات API، وإدارة صلاحيات الجهاز بشفافية. نختبر الشاشات على أحجام الأجهزة المختلفة ونجهز حزمة النشر المعتمدة لمتجر Google Play.",
      audienceItems: [
        "الشركات والمنصات التي تريد إتاحة خدماتها أو حجوزاتها لمستخدمي هواتف وأجهزة أندرويد.",
        "فرق العمل الميدانية والتوصيل التي تحتاج تطبيقًا عمليًا لتسجيل العمليات أو المسح الضوئي أو العمل دون اتصال.",
        "المشاريع الناشئة التي تبني إصدارها الأول على Google Play بربط برمجي منظم.",
      ],
      technologies: ["بيئة تطوير أندرويد وواجهات حديثة متجاوبة", "ربط واجهات REST / JSON مع توثيق الجلسات", "إشعارات فورية (FCM) ومزامنة خلفية", "تخزين محلي آمن ودعم العمل دون اتصال عند الحاجة", "تجهيز حزم AAB الموقعة لمتجر Google Play"],
      processDetails: [
        "تصميم تجربة الترحيب وتسجيل الدخول وحفظ الجلسة بخطوات واضحة وسريعة.",
        "تنفيذ شاشات الخدمة الأساسية والتحقق من المدخلات ومزامنة البيانات مع الخادم.",
        "إعداد التنبيهات وصلاحيات الكاميرا أو الموقع عند الحاجة الفعلية فقط وبموافقة المستخدم.",
        "توفير شاشات إدارة الحساب والخصوصية وتجهيز حزمة الإطلاق لمراجعة Google Play.",
      ],
      faqs: [
        { q: "هل يُرفع التطبيق على حساب شركتنا في Google Play Console؟", a: "نعم. نجهز حزمة الإطلاق الموقعة (AAB) وبيانات المتجر وإفصاحات الخصوصية لرفعها على حساب شركتك الرسمي في Google Play، مع بقاء القرار النهائي للنشر خاضعًا لمراجعة المتجر." },
        { q: "هل يمكن ربط تطبيق أندرويد بنظامنا الحالي أو موقعنا؟", a: "نعم، يتم الربط عبر طبقة واجهات برمجية (HTTPS API) آمنة بحيث لا يتم تخزين أي مفاتيح سرية لقاعدة البيانات داخل التطبيق." },
        { q: "ماذا يحدث عند انقطاع اتصال الإنترنت لدى المستخدم؟", a: "في حال اختيار ميزة العمل دون اتصال ضمن نطاق المشروع، يتم حفظ البيانات الأساسية والعمليات المعلقة محليًا ومزامنتها تلقائيًا عند عودة الاتصال." },
      ],
    },
    ios: {
      overview: "نطوّر تطبيقات آيفون متوافقة مع إرشادات Apple (Human Interface Guidelines)، مع عناية خاصة بتفاصيل الحركة، ووضوح الخطوط، وإفصاحات الخصوصية. يمر التطبيق بمراحل اختبار عبر TestFlight وتجهيز متطلبات المراجعة قبل التقديم إلى App Store.",
      audienceItems: [
        "العلامات التجارية والخدمات التي تستهدف مستخدمي iPhone وتبحث عن تجربة iOS أصلية ومتقنة.",
        "المنصات التي تطلق تطبيق iOS مكملًا لموقعها الإلكتروني أو تطبيق أندرويد.",
        "الشركات التي تحتاج تطبيقًا يلتزم بمتطلبات Apple للخصوصية وإدارة الحساب.",
      ],
      technologies: ["معمارية واجهات iOS الحديثة وSwift / SwiftUI", "حفظ آمن لبيانات الجلسة عبر Keychain", "الالتزام بإرشادات Apple ودعم أحجام الخطوط والوصول", "توزيع نسخ الاختبار عبر TestFlight", "تجهيز بيانات App Store Connect وإفصاحات الخصوصية"],
      processDetails: [
        "تصميم التنقل والشاشات والتفاعلات بما يناسب أسلوب استخدام iPhone القياسي.",
        "إتاحة نسخ تجريبية عبر TestFlight لتجربة التطبيق على أجهزة حقيقية قبل الإطلاق.",
        "توثيق أذونات الجهاز وإفصاحات الخصوصية وخيارات حذف الحساب المطلوبة من Apple.",
        "تجهيز حزمة النشر النهائية والصور التوضيحية وملاحظات الفحص لتقديمها إلى App Store.",
      ],
      faqs: [
        { q: "ما المطلوب من طرفنا لنشر التطبيق على App Store؟", a: "يلزم توفر حساب فعّال في برنامج مطوري Apple (Apple Developer Program) باسمك أو اسم شركتك، ونساعدك في إعداد الشهادات وTestFlight وبيانات المتجر." },
        { q: "هل قبول التطبيق في App Store مضمون فور الإرسال؟", a: "قرار القبول النهائي يعود لفريق مراجعة Apple. نحن نلتزم ببناء التطبيق وفق إرشادات Apple المعتمدة ونعالج أي ملاحظات تقنية ضمن النطاق المتفق عليه." },
        { q: "هل يمكن تطوير نسختي iPhone وأندرويد ضمن مشروع واحد؟", a: "نعم، يمكن توحيد الواجهات الخلفية (API) ونظام التصميم البصري لتنفيذ التطبيقين وفق جدول زمني منسق." },
      ],
    },
    windows: {
      overview: "نطوّر برامج مكتبية لنظام ويندوز مخصصة للفرق التي تتعامل مع ملفات محلية، أو سجلات تشغيلية يومية، أو تقارير قابلة للطباعة والتصدير. يُصمم البرنامج بصلاحيات مستخدمين واضحة وحزمة تثبيت موثقة تناسب بيئة العمل المكتبية.",
      audienceItems: [
        "فرق العمليات والإدارة والمحاسبة التي تعتمد على أجهزة ويندوز في إنجاز مهامها اليومية.",
        "المؤسسات التي تحتاج معالجة ملفات محلية أو استخراج تقارير PDF/Excel أو العمل في شبكة داخلية.",
        "الشركات التي تريد استبدال جداول البيانات المعقدة ببرنامج مكتبي منظم ومضبوط الصلاحيات.",
      ],
      technologies: ["معمارية تطبيقات سطح المكتب لنظام Windows", "تخزين بيانات محلي أو شبكي مع نسخ احتياطي منظم", "نظام صلاحيات وأدوار للموظفين وسجل للعمليات", "تصدير التقارير بصيغ PDF وCSV/Excel والطباعة", "حزم تثبيت موثقة وآلية تحديث واضحة"],
      processDetails: [
        "تحديد صيغ الملفات ومجلدات الحفظ والبيانات التي يتعامل معها فريقك يوميًا.",
        "بناء شاشات واضحة وسريعة لإدخال البيانات والبحث والتحقق وتنفيذ المهام.",
        "إضافة لوحات الملخصات والتقارير القابلة للتصدير أو الطباعة حسب صلاحية المستخدم.",
        "تسليم حزمة التثبيت ودليل الإعداد والتحديث لسهولة التشغيل على أجهزة الفريق.",
      ],
      faqs: [
        { q: "هل يعمل برنامج ويندوز بدون اتصال بالإنترنت؟", a: "نعم، يمكن تصميم البرنامج للعمل محليًا بالكامل أو عبر الشبكة الداخلية، مع إمكانية المزامنة عند توفر الاتصال حسب متطلباتك." },
        { q: "كيف يتم تثبيت البرنامج على عدة أجهزة في الشركة؟", a: "نسلّم حزمة تثبيت قياسية مرفقة بدليل إعداد واضح يمكّن فريقك أو مسؤول التقنية من تثبيت البرنامج وتحديثه بسهولة." },
        { q: "هل يمكن تخصيص صلاحيات مختلفة لكل موظف؟", a: "نعم، عند تضمين نظام الحسابات والصلاحيات يمكن تحديد ما يستطيع كل دور عرضه أو تعديله أو تصديره." },
      ],
    },
    store: {
      overview: "نبني متاجر إلكترونية تجمع بين سرعة تصفح المنتجات، وتنظيم التصنيفات والخيارات والمخزون، ووضوح خطوات السلة والدفع. قبل الربط التقني نحدد معك السوق المستهدف، والعملة، والضرائب، ومزودي الدفع والشحن المعتمدين لديك.",
      audienceItems: [
        "العلامات التجارية والمتاجر التي تريد بيع منتجاتها مباشرة عبر متجر إلكتروني مستقل.",
        "الشركات التي تحتاج كتالوج منتجات متعدد اللغات أو خيارات مخصصة لا توفرها القوالب الجاهزة.",
        "الأنشطة التجارية التي تتطلب متابعة دقيقة لحالات الطلبات وإشعارات العملاء.",
      ],
      technologies: ["هيكلة منظمة للكتالوج والتصنيفات وخيارات المنتجات", "التحقق الخادمي من السلة والأسعار والكميات", "ربط بوابات الدفع المعتمدة مع التحقق من Webhooks", "إدارة حالات الطلبات وإشعارات البريد الإلكتروني", "بيانات وصفية مهيأة لمحركات البحث لكل منتج وتصنيف"],
      processDetails: [
        "تنظيم شجرة التصنيفات وصور المنتجات والمواصفات لتسهيل وصول العميل للمنتج المطلوب.",
        "تصميم سلة مشتريات واضحة تعرض الخيارات المختارة وتكاليف الشحن والضرائب بشفافية.",
        "ربط مزود الدفع المعتمد مع التحقق الخادمي من المبالغ وحالة العملية.",
        "توفير لوحة لمتابعة الطلبات وتحديث حالة التجهيز والشحن حتى التسليم.",
      ],
      faqs: [
        { q: "ما بوابات الدفع التي يمكن ربطها بالمتجر؟", a: "ندعم ربط بوابات الدفع القياسية مثل Stripe وPayPal عبر جلسات دفع آمنة وWebhooks موثقة، وذلك بعد تفعيل حساب التاجر الخاص بشركتك لدى المزود." },
        { q: "هل نستطيع إضافة المنتجات وتعديل الأسعار والمخزون بأنفسنا؟", a: "نعم، يتضمن المتجر لوحة إدارة للكتالوج والطلبات تتيح لفريقك تحديث المنتجات والخيارات والأسعار وحالات الطلب." },
        { q: "كيف يتم ضبط الضرائب والشحن وسياسة الاسترجاع؟", a: "نراجع معك مناطق الشحن ونسب الضرائب وسياسة الاسترجاع قبل التنفيذ لتظهر بوضوح في صفحة الدفع وصفحات الشروط." },
      ],
    },
    erp: {
      overview: "نصمّم ونطوّر أنظمة إدارة أعمال مخصصة تجمع بيانات العملاء، والعروض، والمهام، والموافقات، والتقارير في مساحة عمل واحدة آمنة. تُبنى الوحدات والصلاحيات على مقاس دورة العمل الفعلية في شركتك بدل تشتيت البيانات بين الجداول والرسائل.",
      audienceItems: [
        "شركات الخدمات والمشاريع التي تتابع العملاء والعروض ومراحل التنفيذ وتوزيع المهام بين الأقسام.",
        "المؤسسات المتنامية التي تريد استبدال ملفات الجداول المتفرقة بنظام مركزي موحد.",
        "الفرق التي تحتاج صلاحيات دقيقة لكل موظف وسجلًا واضحًا للتغييرات والاعتمادات.",
      ],
      technologies: ["قواعد بيانات علائقية PostgreSQL مع Drizzle ORM", "صلاحيات دقيقة حسب الدور (RBAC) وعزل البيانات", "عمليات خادمية موثقة مع سجل مراجعة (Audit Log)", "لوحات متابعة وجداول بيانات بفلترة وبحث سريع", "واجهات ربط برمجية (API) مع الأنظمة الخارجية"],
      processDetails: [
        "تسجيل بيانات العملاء الجدد وطلباتهم ومتطلباتهم في سجل موحد ومنظم.",
        "إعداد ومراجعة واعتماد العروض أو أوامر العمل مع تتبع واضح لحالة كل مرحلة.",
        "توزيع المهام على أعضاء الفريق مع تحديد المسؤوليات والمواعيد ونقاط المراجعة.",
        "استعراض تقارير الأداء والملخصات التشغيلية وتصدير البيانات حسب الصلاحيات.",
      ],
      faqs: [
        { q: "كيف يضمن النظام عدم اطلاع الموظف على بيانات خارج اختصاصه؟", a: "تُطبّق الصلاحيات على مستوى الخادم في كل عملية عرض أو تعديل، بحيث يرى كل مستخدم فقط الأقسام والمشاريع المصرح له بها." },
        { q: "هل يمكن البدء بالوحدات الأساسية ثم توسيع النظام لاحقًا؟", a: "نعم، ننصح بالبدء بالمسار التشغيلي الأهم لشركتك على قاعدة بيانات منظمة قابلة للتوسع وإضافة وحدات جديدة في مراحل لاحقة." },
        { q: "هل يمكن ربط النظام بأدوات المحاسبة أو البريد المعتمدة لدينا؟", a: "نعم، يمكن ربط الخدمات الخارجية التي توفر واجهات برمجية (REST API) موثقة ضمن النطاق المتفق عليه." },
      ],
    },
    ai: {
      overview: "نبني حلول أتمتة ومساعدات ذكية عملية تربط مصادر بياناتك المعتمدة بخطوات معالجة واضحة لتقليل العمل اليدوي المتكرر. نصمّم كل مسار بحدود استخدام وتكلفة مضبوطة، وتحقق هيكلي من المخرجات، ومراجعة بشرية للقرارات الحساسة.",
      audienceItems: [
        "فرق خدمة العملاء والعمليات التي تتعامل مع حجم كبير من الاستفسارات أو النماذج المتكررة.",
        "الشركات التي تحتاج مساعدًا داخليًا يجيب بالاستناد إلى أدلة العمل والوثائق المعتمدة لديها فقط.",
        "الفرق التي ترغب في أتمتة فرز البيانات أو تلخيص المستندات وربطها بأنظمتها الداخلية.",
      ],
      technologies: ["تكامل نماذج الذكاء الاصطناعي مع مخرجات JSON مهيكلة", "ربط المساعد بالمستندات والمصادر المعتمدة للشركة", "حدود معدل الطلبات وميزانية الاستخدام (Rate & Cost Guards)", "مسارات مراجعة واعتماد بشري مع سجل للنتائج", "عزل مفاتيح الخدمات الخادمية ومسارات بديلة عند التعذر"],
      processDetails: [
        "تحديد وتجهيز المصادر والمستندات والبيانات المعتمدة التي يُسمح للمساعد بالاعتماد عليها.",
        "برمجة خطوات التصنيف أو الاستخراج أو الصياغة مع التحقق الآلي من شكل المخرجات.",
        "إدراج خطوة مراجعة بشرية قبل إرسال أي رد حساس أو اعتماد إجراء مؤثر.",
        "تسجيل النتائج واستهلاك الخدمة لمراقبة الجودة وضبط التكلفة التشغيلية.",
      ],
      faqs: [
        { q: "هل تضمنون دقة مخرجات الذكاء الاصطناعي بنسبة 100%؟", a: "لا؛ قد تخطئ النماذج اللغوية أحيانًا. لذلك نصمم الحلول بحدود مصادر واضحة، وتحقق برمجي من البيانات، ومراجعة بشرية للقرارات المهمة دون وعود بدقة مطلقة." },
        { q: "كيف تُحمى بيانات شركتنا ومفاتيح API؟", a: "تُنفّذ جميع الاتصالات من جانب الخادم حصريًا دون كشف المفاتيح في المتصفح، ونراجع معك سياسات الخصوصية والاحتفاظ بالبيانات لمزود الخدمة قبل الإطلاق." },
        { q: "كيف نتحكم في تكلفة استهلاك واجهات الذكاء الاصطناعي؟", a: "نضع حدودًا واضحة لحجم المدخلات وعدد الطلبات وسقف الاستهلاك الشهري لتبقى التكاليف تحت السيطرة." },
      ],
    },
    design: {
      overview: "نصمّم الهويات البصرية وأنظمة الواجهات والنماذج التفاعلية (Prototypes) التي توضّح شكل منتجك وطريقة عمله قبل بدء البرمجة. يساعدك التصميم المسبق على اختبار رحلة المستخدم واعتماد الألوان والخطوط وحالات الشاشات كافة لتقليل التعديلات أثناء التطوير.",
      audienceItems: [
        "المشاريع والعلامات الجديدة التي تحتاج شعارًا وهوية بصرية متكاملة ونظام ألوان وخطوط واضح.",
        "فرق المنتجات التي تريد التحقق من تجربة المستخدم عبر نموذج تفاعلي قابل للنقر قبل التطوير.",
        "الشركات التي تعيد تصميم موقعها أو تطبيقها لتحسين الوضوح وسهولة الاستخدام على الجوال.",
      ],
      technologies: ["أنظمة مكونات Figma ومتغيرات التصميم (Design Tokens)", "توازن بصري وخطوط مخصصة للعربية (RTL) واللغات اللاتينية (LTR)", "نماذج تفاعلية توضح مسارات الاستخدام وحالات التحميل والخطأ", "فحص تباين الألوان ووضوح عناصر اللمس وفق معايير الوصول", "ملفات تسليم منظمة للمطورين بصيغ SVG وWebP"],
      processDetails: [
        "تحديد الاتجاه البصري وشخصية العلامة ونظام الشبكة (Grid) المناسب لجمهورك.",
        "تصميم الشعار، ولوحة الألوان، وتدرج الخطوط العربية واللاتينية وقواعد استخدامها.",
        "بناء مكتبة مكونات الواجهة (الأزرار، النماذج، القوائم، البطاقات) لجميع أحجام الشاشات.",
        "تسليم نموذج تفاعلي كامل وملفات الأصول الموثقة الجاهزة للتنفيذ البرمجي.",
      ],
      faqs: [
        { q: "هل يمكن طلب خدمة تصميم الواجهات والهوية بشكل مستقل قبل البرمجة؟", a: "نعم، يفضّل كثير من العملاء البدء بمسار التصميم والنموذج التفاعلي لاعتماد تجربة المنتج وتفاصيله قبل الانتقال لمرحلة التطوير البرمجي." },
        { q: "ما الملفات التي نستلمها في نهاية مسار التصميم؟", a: "تستلم ملفات الشعار والهوية المتجهة (SVG/PNG)، ودليل الألوان والخطوط، وتصميمات الشاشات للهاتف وسطح المكتب، والنموذج التفاعلي الجاهز للتسليم للمطورين." },
        { q: "هل يراعي التصميم اللغتين العربية والإنجليزية معًا؟", a: "نعم، نصمم الواجهات والمسافات والأيقونات والخطوط بحيث تعمل بتناسق كامل في الاتجاهين RTL وLTR." },
      ],
    },
  },
  nl: {
    web: {
      overview: "Wij ontwerpen en ontwikkelen snelle, toegankelijke websites met een heldere informatiearchitectuur, gestructureerde metadata en beheerbare contentworkflows. Elk project wordt opgebouwd vanuit uw daadwerkelijke paginastructuur en klantreis, met stabiele weergave op mobiel en desktop en ondersteuning voor zowel Europese talen (LTR) als Arabisch (RTL).",
      audienceItems: [
        "Dienstverleners en adviesbureaus die een betrouwbare meertalige online presentatie en gestructureerde aanvraagformulieren nodig hebben.",
        "Groeiende organisaties die een verouderde of trage website vervangen door een moderne, onderhoudbare webarchitectuur.",
        "Productteams die een duidelijke marketing- en documentatiesite lanceren.",
      ],
      technologies: ["Next.js & React Server Components", "TypeScript & strikte schemavalidatie", "Responsieve CSS Grid & Tailwind CSS", "Technische SEO (canonical, hreflang, JSON-LD)", "Toegankelijke, semantische HTML volgens WCAG-richtlijnen"],
      processDetails: [
        "Bepaal de kernboodschap van de homepagina, uw waardepropositie en de belangrijkste conversieroutes.",
        "Structuur overzichtelijke dienstenpagina’s met duidelijke opleveringen, doorlooptijden en prijsinformatie.",
        "Orden portfolio-, referentie- of kennispagina’s op basis van geverifieerd bedrijfsmateriaal.",
        "Implementeer gevalideerde contact- en aanvraagformulieren met spambeveiliging en directe routering naar uw team.",
      ],
      faqs: [
        { q: "Kunnen we na oplevering zelf teksten en afbeeldingen aanpassen?", a: "Ja. Wanneer contentbeheer in de scope is opgenomen, leveren we een overzichtelijke beheeromgeving waarmee uw team teksten, media en pagina’s kan bijwerken zonder code aan te passen." },
        { q: "Ondersteunt de website Nederlands, Engels én Arabisch (RTL)?", a: "Ja. We bouwen server-gerenderde LTR- en RTL-lay-outs met passende typografie, canonieke URL’s en wederkerige hreflang-verwijzingen." },
        { q: "Zijn domeinregistratie en externe hosting inbegrepen in de richtprijs?", a: "De implementatieschatting dekt ontwerp, ontwikkeling, testen en voorbereiding op livegang. Domeinnaam en hostingabonnementen blijven op naam van uw eigen organisatie zodat u volledig eigenaar blijft." },
      ],
    },
    android: {
      overview: "Wij ontwikkelen Android-applicaties met aandacht voor soepele aanraakinteracties, betrouwbare API-koppelingen en zorgvuldig rechtenbeheer op het toestel. Van inloggen en pushmeldingen tot offline opslag en voorbereiding voor Google Play: elk scherm wordt getest op uiteenlopende schermformaten.",
      audienceItems: [
        "Bedrijven die hun bestaande webplatform of reserveringsdienst beschikbaar willen maken op Android-telefoons en -tablets.",
        "Buitendienst- en logistieke teams die mobiele workflows, camera-/QR-functionaliteit of offline ondersteuning nodig hebben.",
        "Startups die een gerichte eerste versie in Google Play willen lanceren met een veilige API-koppeling.",
      ],
      technologies: ["Android SDK & moderne declaratieve UI", "REST / JSON API-koppelingen met sessiebeveiliging", "Pushmeldingen (FCM) & achtergrondsynchronisatie", "Versleutelde lokale opslag & offline wachtrijen", "Ondertekende AAB-releasepakketten voor Google Play"],
      processDetails: [
        "Ontwerp een duidelijke start- en inlogervaring met veilige sessieopslag.",
        "Realiseer de kernschermen, invoervalidatie en synchronisatie met uw backend.",
        "Configureer meldingen en toestelrechten (zoals camera of locatie) uitsluitend waar functioneel nodig en met toestemming.",
        "Lever accountinstellingen, privacyopties en een ondertekend releasepakket voor de Google Play-beoordeling.",
      ],
      faqs: [
        { q: "Wordt de app gepubliceerd onder ons eigen Google Play Console-account?", a: "Ja. Wij leveren de ondertekende Android App Bundle (AAB), winkelinformatie en privacyverklaringen aan voor het Google Play-account van uw organisatie. De uiteindelijke toelating blijft afhankelijk van de controle door Google." },
        { q: "Kan de Android-app koppelen met onze bestaande database of bedrijfssysteem?", a: "Ja, via een beveiligde HTTPS API-laag. Zo blijven databasesleutels en bedrijfslogica veilig op de server." },
        { q: "Wat gebeurt er als een gebruiker tijdelijk geen internetverbinding heeft?", a: "Wanneer offline functionaliteit in de scope is opgenomen, worden belangrijke gegevens lokaal bewaard en gesynchroniseerd zodra de verbinding terugkeert." },
      ],
    },
    ios: {
      overview: "Wij bouwen iPhone-applicaties volgens Apple’s Human Interface Guidelines, met focus op natuurlijke iOS-navigatie, heldere typografie en strikte naleving van privacyregels. Elke versie wordt getest via TestFlight en zorgvuldig voorbereid op de App Store-beoordeling.",
      audienceItems: [
        "Merken en dienstverleners die iPhone-gebruikers een hoogwaardige, native iOS-ervaring willen bieden.",
        "Platforms die naast hun webomgeving of Android-app een volwaardige iOS-app lanceren.",
        "Organisaties die waarde hechten aan veilige authenticatie, toegankelijkheid en een correcte App Store Connect-inrichting.",
      ],
      technologies: ["Native iOS-interactiepatronen & Swift/SwiftUI-architectuur", "Veilige sessieopslag via iOS Keychain", "Apple Human Interface Guidelines & Dynamic Type", "TestFlight-distributie voor gebruikerstests", "App Store Connect-privacyverklaringen & reviewvoorbereiding"],
      processDetails: [
        "Vorm schermen, navigatie en interacties rond de richtlijnen en schermformaten van iPhone.",
        "Stel testversies beschikbaar via TestFlight zodat uw team vroegtijdig op echte toestellen kan testen.",
        "Leg toestemmingsvragen, privacy-etiketten en accountverwijderingsopties vast volgens Apple-beleid.",
        "Lever het definitieve releasepakket, schermafbeeldingen en toelichtingen voor indiening bij de App Store.",
      ],
      faqs: [
        { q: "Wat hebben wij nodig om een app in de Apple App Store te publiceren?", a: "U heeft een actief Apple Developer Program-account nodig op naam van uw bedrijf. Wij ondersteunen bij certificaten, TestFlight en de inrichting van App Store Connect." },
        { q: "Is goedkeuring door Apple gegarandeerd?", a: "De beoordeling ligt altijd bij het reviewteam van Apple. Wij bouwen volgens de actuele Apple-richtlijnen en verhelpen eventuele technische opmerkingen binnen de afgesproken projectscope." },
        { q: "Kunnen iPhone- en Android-apps gelijktijdig worden ontwikkeld?", a: "Ja. We stemmen de API-koppelingen, datamodellen en het ontwerpsysteem op elkaar af zodat beide trajecten gelijk oplopen." },
      ],
    },
    windows: {
      overview: "Wij ontwikkelen Windows-desktopsoftware voor teams die dagelijks werken met lokale bestanden, gestructureerde bedrijfsgegevens of interne netwerken. De software wordt opgebouwd met duidelijke gebruikersrechten, snelle toetsenbord- en muisbediening, exporteerbare rapporten en gedocumenteerde installatiepakketten.",
      audienceItems: [
        "Operationele, administratieve en logistieke teams die werken op Windows-werkstations.",
        "Organisaties die lokale bestandsverwerking, PDF-/Excel-rapportages of offline werking nodig hebben.",
        "Bedrijven die foutgevoelige spreadsheets willen vervangen door een beheerste desktoptoepassing.",
      ],
      technologies: ["Windows-desktoparchitectuur", "Lokale en netwerkopslag met back-uproutines", "Rolgebaseerde rechten & activiteitenlogboeken", "Rapportexport naar PDF, CSV/Excel en afdrukopmaak", "Gedocumenteerde installers & updateprocedures"],
      processDetails: [
        "Breng de bestandsformaten, opslaglocaties en gegevensstromen van uw team nauwkeurig in kaart.",
        "Bouw overzichtelijke schermen voor dagelijkse invoer, controle, zoekopdrachten en verwerking.",
        "Realiseer duidelijke overzichten en exporteerbare rapporten per gebruikersrol.",
        "Lever een installatiepakket, updateproces en beknopte handleiding voor uw werkomgeving.",
      ],
      faqs: [
        { q: "Kan het Windows-programma volledig zonder internet werken?", a: "Ja. Afhankelijk van uw werkomgeving kan het programma volledig lokaal draaien, binnen uw kantoornetwerk werken of periodiek synchroniseren." },
        { q: "Hoe installeren we de software op meerdere pc’s?", a: "U ontvangt een standaard installatiepakket met duidelijke instructies waarmee uw team of systeembeheerder de software eenvoudig kan uitrollen." },
        { q: "Kunnen we per medewerker instellen welke schermen toegankelijk zijn?", a: "Ja. Met rolgebaseerde rechten bepaalt u wie gegevens mag inzien, bewerken, exporteren of beheren." },
      ],
    },
    store: {
      overview: "Wij bouwen webwinkels met een overzichtelijke productcatalogus, varianten- en voorraadbeheer en geverifieerde betaal- en verzendkoppelingen. Vóór de technische koppeling leggen we samen de doelmarkt, valuta, btw-tarieven, verzendzones en het retourbeleid vast.",
      audienceItems: [
        "Merken en winkeliers die producten rechtstreeks online willen verkopen via een eigen webwinkel.",
        "Handelsbedrijven die meertalige productpagina’s, maatwerkfilters of specifieke prijsregels nodig hebben.",
        "Ondernemingen die bestellingen, betalingen en verzendstatussen centraal willen opvolgen.",
      ],
      technologies: ["Gestructureerde catalogus-, categorie- en SKU-variantschema’s", "Server-side winkelwagen- en prijsvalidatie", "Geverifieerde betaalsessies en webhooks (Stripe / PayPal)", "Orderbeheer & automatische statusmeldingen", "Zoekmachinevriendelijke productmetadata"],
      processDetails: [
        "Richt categorieën, productafbeeldingen, kenmerken en voorraadstatussen overzichtelijk in.",
        "Zorg voor een heldere winkelwagen met transparante weergave van verzendkosten en btw.",
        "Koppel goedgekeurde betaalaanbieders met server-side bedragcontrole.",
        "Bied een beheeromgeving voor bestellingen, klantgegevens en verzendupdates.",
      ],
      faqs: [
        { q: "Welke betaalmethoden kunnen worden gekoppeld?", a: "Wij ondersteunen gangbare betaalproviders zoals Stripe en PayPal via beveiligde checkoutsessies en geverifieerde webhooks, zodra uw zakelijke aangesloten account bij de provider actief is." },
        { q: "Kunnen wij zelf producten, prijzen en voorraad beheren?", a: "Ja. Via het winkelbeheer kunt u zelfstandig producten, varianten, foto’s, prijzen en orderstatussen bijwerken." },
        { q: "Hoe worden btw, verzending en retouren ingericht?", a: "Voorafgaand aan de bouw stemmen we uw verzendtarieven, btw-regels en retourvoorwaarden af zodat deze correct in de winkelwagen en voorwaarden staan." },
      ],
    },
    erp: {
      overview: "Wij ontwerpen en ontwikkelen bedrijfssystemen op maat waarin klanten, offertes, taken, goedkeuringen en rapportages samenkomen in één beveiligde webomgeving. Elke module volgt uw werkelijke bedrijfsproces en rechtenstructuur in plaats van losse bestanden en e-mails.",
      audienceItems: [
        "Dienstverlenende bedrijven die klantaanvragen, offertes, projectfasen en taakverdeling centraal willen aansturen.",
        "Groeiende organisaties die losse spreadsheets en handmatige statuslijsten willen vervangen.",
        "Teams die behoefte hebben aan strikte toegangsrechten per functie en een betrouwbaar wijzigingslogboek.",
      ],
      technologies: ["Relationele PostgreSQL-database & Drizzle ORM", "Rolgebaseerde toegangscontrole (RBAC)", "Server-side validatie & auditlogging", "Dashboards, zoekfilters en taakborden", "REST API-koppelingen met bestaande bedrijfssoftware"],
      processDetails: [
        "Registreer nieuwe klanten, contactmomenten en projectvereisten op één centrale plek.",
        "Stel offertes of werkorders op en leg goedkeuringen en statusovergangen vast.",
        "Wijs taken toe aan teamleden met duidelijke verantwoordelijkheden en voortgangspunten.",
        "Volg operationele cijfers, doorlooptijden en exporteerbare rapportages vanuit het dashboard.",
      ],
      faqs: [
        { q: "Hoe wordt voorkomen dat medewerkers gegevens zien waarvoor zij geen rechten hebben?", a: "Toegangsrechten worden op de server gecontroleerd bij elke opvraging en wijziging. Elke rol krijgt uitsluitend toegang tot de toegewezen onderdelen." },
        { q: "Kunnen we starten met een basismodule en het systeem later uitbreiden?", a: "Ja. We adviseren te starten met het belangrijkste kernproces op een schaalbaar datamodel, zodat extra modules later gefaseerd kunnen worden toegevoegd." },
        { q: "Kan het systeem gekoppeld worden aan onze bestaande tools?", a: "Ja, binnen de afgesproken scope kunnen we koppelen met externe pakketten die beschikken over een gedocumenteerde REST API." },
      ],
    },
    ai: {
      overview: "Wij bouwen praktische AI-assistenten en werkstroomautomatiseringen die uw goedgekeurde bedrijfsdocumenten of formulieren koppelen aan duidelijke verwerkingsstappen. Elke oplossing bevat strikte invoer- en uitvoerschema’s, gebruikslimieten, menselijke controle bij belangrijke beslissingen en een terugvaloptie bij storingen.",
      audienceItems: [
        "Support- en operatieteams die veel tijd kwijt zijn aan terugkerende vragen, intakeformulieren of documentclassificatie.",
        "Organisaties die een interne kennisassistent willen op basis van hun eigen goedgekeurde richtlijnen en handboeken.",
        "Teams die gegevensoverdracht en controles tussen verschillende systemen willen automatiseren.",
      ],
      technologies: ["AI SDK-orkestratie & gestructureerde JSON-uitvoer", "Afbakening op goedgekeurde documentbronnen", "Server-side rate limiting & kostenplafonds", "Menselijke goedkeuringsstappen (human-in-the-loop) & logging", "Beveiligde API-sleutelisolatie & fallback-routes"],
      processDetails: [
        "Selecteer en structureer de goedgekeurde documenten of gegevensbronnen die als basis dienen.",
        "Definieer de verwerkings-, samenvattings- of classificatiestappen met schemavalidatie.",
        "Bouw een menselijke controlestap in voordat externe berichten of belangrijke wijzigingen worden doorgevoerd.",
        "Registreer resultaten en verbruik zodat kwaliteit en maandelijkse kosten inzichtelijk blijven.",
      ],
      faqs: [
        { q: "Garanderen jullie dat een AI-assistent altijd foutloze antwoorden geeft?", a: "Nee, taalmodellen kunnen fouten maken. Daarom combineren we AI met vaste bronafbakening, schemacontroles, menselijke beoordeling voor kritieke acties en duidelijke foutafhandeling." },
        { q: "Hoe blijven onze bedrijfsgegevens en API-sleutels beschermd?", a: "Alle AI-aanroepen verlopen via de server zonder sleutels in de browser bloot te stellen. Vooraf bespreken we bovendien het databeleid van de gekozen modelaanbieder." },
        { q: "Hoe houden we de maandelijkse API-kosten beheersbaar?", a: "We stellen limieten in voor berichtlengte, aantallen verzoeken en verbruiksplafonds zodat kosten voorspelbaar blijven." },
      ],
    },
    design: {
      overview: "Wij ontwerpen samenhangende merkidentiteiten, componentbibliotheken en interactieve UI/UX-prototypes waarmee uw product visueel en functioneel helder staat vóórdat de ontwikkeling start. Door gebruikersroutes, foutmeldingen en mobiele weergave vooraf uit te werken, verloopt de bouwfase sneller en voorspelbaarder.",
      audienceItems: [
        "Nieuwe ondernemingen en producten die een herkenbaar logo, kleurenpalet en typografisch systeem nodig hebben.",
        "Productteams die een web- of app-concept eerst via een klikbaar prototype willen toetsen bij gebruikers of stakeholders.",
        "Bedrijven die een bestaande interface willen vernieuwen voor betere bruikbaarheid en toegankelijkheid.",
      ],
      technologies: ["Figma-componentsystemen & designtokens", "Typografische schalen voor zowel LTR (Nederlands/Engels) als RTL (Arabisch)", "Interactieve klikbare prototypes inclusief laad- en foutstatussen", "WCAG-contrastcontrole & aanraakdoel-optimalisatie", "Overdrachtsbestanden voor ontwikkelaars (SVG, WebP, specificaties)"],
      processDetails: [
        "Bepaal de visuele richting, merkpersoonlijkheid en lay-outstructuur passend bij uw doelgroep.",
        "Werk het logo, de kleurcoderingen, contrastregels en typografie uit.",
        "Ontwerp herbruikbare interfacecomponenten, formulieren en responsieve schermen.",
        "Lever een interactief prototype en geordende ontwerpbestanden waarmee ontwikkelaars direct aan de slag kunnen.",
      ],
      faqs: [
        { q: "Kunnen we eerst alleen het ontwerp en prototype laten maken?", a: "Ja. Veel opdrachtgevers kiezen eerst het ontwerptraject om de gebruikerservaring en scope volledig scherp te krijgen voordat de softwareontwikkeling wordt ingepland." },
        { q: "Welke bestanden ontvangen we bij oplevering?", a: "U ontvangt schaalbare merkbestanden (SVG/PNG), richtlijnen voor kleur en typografie, uitgewerkte schermen voor mobiel en desktop, en een klikbaar prototype met ontwikkelspecificaties." },
        { q: "Houden jullie rekening met meertaligheid en Arabisch (RTL)?", a: "Ja. We ontwerpen componenten en typografie zodat de interface zowel van links naar rechts als van rechts naar links natuurlijk oogt." },
      ],
    },
  },
};

export function serviceExtendedContent(locale: Locale, service: ServiceSlug): ServiceExtendedInfo {
  return extendedData[activeKey(locale)][service];
}
