import { translated } from "./i18n/project-builder";
import type { Locale } from "./i18n/config";
import { estimate, featureCost, implementationPrice, speedModifier, type FeatureKey, type ProjectType, type Speed } from "./pricing";
import { websitePackages, websitePackage, websitePackageName } from "./website-packages";

type Names = Record<Locale, string>;
export type ProjectOption = { id: string; type: ProjectType; names: Names; price: number; weeks: number; features: FeatureKey[] };
const option = (id: string, type: ProjectType, price: number, weeks: number, features: FeatureKey[], names: Names): ProjectOption => ({ id, type, price: websitePackage(id) ? price : implementationPrice(price), weeks, features, names });
export const projectOptions: ProjectOption[] = [
  ...websitePackages.map(p => option(p.id, p.type, p.low, p.weeks, p.features, Object.fromEntries((["ar", "en", "nl", "de", "tr", "fr", "es"] as Locale[]).map(l => [l, websitePackageName(p.id, l)])) as Names)),
  option("android", "mobile", 2450, 8, ["appstore"], translated("تطبيق أندرويد", "Android app", "Android-app", "Android-App", "Android uygulaması", "Application Android", "Aplicación Android")),
  option("ios", "mobile", 2950, 9, ["appstore"], translated("تطبيق آيفون وآيباد", "iPhone and iPad app", "iPhone- en iPad-app", "iPhone- und iPad-App", "iPhone ve iPad uygulaması", "Application iPhone et iPad", "Aplicación iPhone y iPad")),
  option("cross-platform", "mobile", 3950, 10, ["appstore"], translated("تطبيق أندرويد وآيفون", "Cross-platform mobile app", "Multiplatform mobiele app", "Plattformübergreifende mobile App", "Çapraz platform mobil uygulaması", "Application mobile multiplateforme", "Aplicación móvil multiplataforma")),
  option("pwa", "web", 990, 4, ["offline"], translated("تطبيق ويب قابل للتثبيت PWA", "Installable web app (PWA)", "Installeerbare web-app", "Installierbare Web-App", "Yüklenebilir web uygulaması", "Application web installable", "Aplicación web instalable")),
  option("windows", "erp", 2450, 8, ["offline"], translated("برنامج ويندوز", "Windows software", "Windows-software", "Windows-Software", "Windows yazılımı", "Logiciel Windows", "Software Windows")),
  option("desktop", "erp", 3450, 10, ["offline"], translated("برنامج كمبيوتر متعدد الأنظمة", "Cross-platform desktop software", "Multiplatform desktopsoftware", "Plattformübergreifende Desktopsoftware", "Çapraz platform masaüstü yazılımı", "Logiciel bureau multiplateforme", "Software de escritorio multiplataforma")),
  option("crm", "erp", 1950, 6, ["auth", "dashboard"], translated("إدارة العملاء CRM", "Customer management (CRM)", "Klantbeheer CRM", "Kundenverwaltung CRM", "Müşteri yönetimi CRM", "Gestion clients CRM", "Gestión de clientes CRM")),
  option("inventory", "erp", 2450, 7, ["auth", "dashboard", "catalog"], translated("المخزون ونقاط البيع", "Inventory and point of sale", "Voorraad en kassasysteem", "Lager und Kassensystem", "Stok ve satış noktası", "Stock et point de vente", "Inventario y punto de venta")),
  option("hr", "erp", 2250, 7, ["auth", "dashboard"], translated("الموظفون والموارد البشرية", "HR and employee management", "HR en personeelsbeheer", "Personalverwaltung", "İK ve çalışan yönetimi", "RH et gestion du personnel", "RRHH y empleados")),
  option("ai-assistant", "ai", 1450, 5, ["ai", "api"], translated("مساعد ذكي وخدمة عملاء", "AI assistant and support", "AI-assistent en support", "KI-Assistent und Support", "AI asistan ve destek", "Assistant IA et support", "Asistente IA y soporte")),
  option("ai-knowledge", "ai", 2450, 8, ["ai", "auth", "api"], translated("بحث ذكي في مستندات الشركة", "AI document knowledge search", "AI-documentzoekfunctie", "KI-Dokumentensuche", "AI belge bilgi araması", "Recherche documentaire IA", "Búsqueda documental con IA")),
  option("automation", "ai", 1250, 4, ["automation", "api"], translated("أتمتة وربط العمليات", "Workflow automation", "Procesautomatisering", "Prozessautomatisierung", "İş akışı otomasyonu", "Automatisation des processus", "Automatización de procesos")),
  option("visual-identity", "brand", 395, 3, ["identity"], translated("شعار وهوية بصرية", "Logo and visual identity", "Logo en visuele identiteit", "Logo und visuelle Identität", "Logo ve görsel kimlik", "Logo et identité visuelle", "Logo e identidad visual")),
  option("ui-ux", "brand", 745, 4, ["prototype"], translated("تصميم واجهات وتجربة مستخدم", "UI and UX design", "UI- en UX-ontwerp", "UI- und UX-Design", "UI ve UX tasarımı", "Design UI et UX", "Diseño UI y UX")),
  option("social-design", "brand", 245, 2, [], translated("تصاميم تسويق وشبكات اجتماعية", "Marketing and social designs", "Marketing- en socialmediaontwerpen", "Marketing- und Social-Media-Designs", "Pazarlama ve sosyal tasarımlar", "Designs marketing et réseaux sociaux", "Diseños de marketing y redes")),
];
export function projectOption(id: string) { return projectOptions.find(p => p.id === id); }
export const featureOptions: Record<ProjectType, FeatureKey[]> = {
  web: ["auth", "payments", "dashboard", "i18n", "cms", "api", "realtime", "offline", "automation"],
  mobile: ["auth", "payments", "dashboard", "i18n", "api", "realtime", "appstore", "offline", "automation"],
  ai: ["auth", "dashboard", "i18n", "api", "ai", "realtime", "automation", "cms"],
  ecommerce: ["auth", "payments", "dashboard", "i18n", "cms", "api", "catalog", "automation"],
  erp: ["auth", "payments", "dashboard", "i18n", "api", "ai", "realtime", "offline", "automation", "catalog"],
  brand: ["identity", "prototype", "i18n"],
};
export type PricedOption = { id: string; names: Names; price: number; period: "once" | "month" | "year"; types: ProjectType[] };
const all: ProjectType[] = ["web", "mobile", "ai", "ecommerce", "erp", "brand"];
const software: ProjectType[] = ["web", "mobile", "ai", "ecommerce", "erp"];
const priced = (id: string, price: number, period: PricedOption["period"], types: ProjectType[], names: Names): PricedOption => ({ id, price: period === "once" ? implementationPrice(price) : price, period, types, names });
export const extraOptions = [
  priced("domain", 8, "year", software, translated("نطاق قياسي وربطه بالمشروع", "Standard domain and setup", "Standaarddomein en koppeling", "Standarddomain und Einrichtung", "Standart alan adı ve kurulum", "Domaine standard et configuration", "Dominio estándar y configuración")),
  priced("email", 3, "month", software, translated("بريد الدومين: صندوق مهني واحد", "Domain email: one professional mailbox", "Domeinmail: één zakelijke mailbox", "Domain-E-Mail: ein Geschäftspostfach", "Alan adı e-postası: bir posta kutusu", "E-mail du domaine : une boîte pro", "Correo del dominio: un buzón profesional")),
  priced("hosting", 10, "month", software, translated("استضافة مُدارة: موقع صغير", "Managed hosting: small site", "Beheerde hosting: kleine site", "Managed Hosting: kleine Website", "Yönetilen hosting: küçük site", "Hébergement géré : petit site", "Alojamiento administrado: sitio pequeño")),
  priced("hosting-business", 35, "month", software, translated("استضافة أعمال: مراقبة ونسخ احتياطي", "Business hosting: monitoring and backup", "Zakelijke hosting: monitoring en back-up", "Business-Hosting: Überwachung und Backup", "İşletme hosting: izleme ve yedekleme", "Hébergement pro : suivi et sauvegarde", "Alojamiento empresarial: monitoreo y copias")),
  priced("maintenance", 40, "month", all, translated("دعم أساسي: تحديثات وفحص شهري", "Essential support: updates and monthly checks", "Basisondersteuning: updates en maandcontrole", "Basissupport: Updates und monatliche Prüfung", "Temel destek: güncelleme ve aylık kontrol", "Support essentiel : mises à jour et contrôle mensuel", "Soporte básico: actualizaciones y revisión mensual")),
  priced("support-plus", 95, "month", all, translated("دعم موسّع: متابعة وتقارير أولوية", "Extended support: priority follow-up and reporting", "Uitgebreide support: prioriteit en rapportages", "Erweiterter Support: Priorität und Berichte", "Genişletilmiş destek: öncelik ve raporlama", "Support étendu : suivi prioritaire et rapports", "Soporte ampliado: seguimiento prioritario e informes")),
  priced("analytics", 20, "once", software, translated("إعداد التحليلات وقياس التحويل", "Analytics and conversion tracking setup", "Analyse- en conversiemeting instellen", "Analyse und Conversion-Tracking einrichten", "Analiz ve dönüşüm takibi kurulumu", "Configuration analytique et conversions", "Configuración de analítica y conversiones")),
  priced("training", 75, "once", all, translated("جلسة تدريب وتسليم موثّق", "Training session and documented handover", "Training en gedocumenteerde overdracht", "Schulung und dokumentierte Übergabe", "Eğitim ve belgeli teslim", "Formation et transfert documenté", "Formación y entrega documentada")),
];
export const providerOptions = [
  priced("email-password", 0, "once", software, translated("البريد وكلمة المرور", "Email and password", "E-mail en wachtwoord", "E-Mail und Passwort", "E-posta ve şifre", "E-mail et mot de passe", "Correo y contraseña")),
  ...[["google", "Google", 25], ["apple", "Apple", 35], ["microsoft", "Microsoft", 25], ["github", "GitHub", 20], ["facebook", "Facebook", 30], ["linkedin", "LinkedIn", 30]].map(([id, name, price]) => priced(String(id), Number(price), "once", software, translated(String(name), String(name), String(name), String(name), String(name), String(name), String(name)))),
];
export const moduleOptions = [
  priced("search", 75, "once", software, translated("بحث وتصفية المحتوى", "Search and content filters", "Zoeken en inhoudsfilters", "Suche und Inhaltsfilter", "Arama ve içerik filtreleri", "Recherche et filtres", "Búsqueda y filtros")),
  priced("notifications", 95, "once", software, translated("إشعارات البريد والتنبيهات", "Email notifications and alerts", "E-mailmeldingen en waarschuwingen", "E-Mail-Benachrichtigungen", "E-posta bildirimleri", "Notifications e-mail et alertes", "Notificaciones por correo y alertas")),
  priced("booking", 150, "once", ["web", "mobile", "erp"], translated("مواعيد وتقويم للحجوزات", "Appointments and booking calendar", "Afspraken en boekingskalender", "Termine und Buchungskalender", "Randevu ve rezervasyon takvimi", "Rendez-vous et calendrier", "Citas y calendario de reservas")),
  priced("forms", 50, "once", software, translated("نماذج تواصل وطلبات مخصصة", "Custom contact and request forms", "Contact- en aanvraagformulieren", "Kontakt- und Anfrageformulare", "İletişim ve talep formları", "Formulaires de contact et demandes", "Formularios de contacto y solicitudes")),
  priced("seo", 75, "once", ["web", "ecommerce"], translated("تهيئة محركات البحث الأساسية", "Technical SEO foundations", "Technische SEO-basis", "Technische SEO-Grundlagen", "Teknik SEO temelleri", "Bases du SEO technique", "Bases de SEO técnico")),
  priced("invoices", 125, "once", ["ecommerce", "erp", "web"], translated("فواتير وتقارير قابلة للتصدير", "Invoices and exportable reports", "Facturen en exporteerbare rapporten", "Rechnungen und exportierbare Berichte", "Fatura ve dışa aktarılabilir raporlar", "Factures et rapports exportables", "Facturas e informes exportables")),
  priced("shipping", 125, "once", ["ecommerce"], translated("الشحن وتتبع الطلبات", "Shipping and order tracking", "Verzending en ordertracking", "Versand und Bestellverfolgung", "Kargo ve sipariş takibi", "Livraison et suivi des commandes", "Envío y seguimiento de pedidos")),
  priced("coupons", 75, "once", ["ecommerce"], translated("كوبونات وعروض المنتجات", "Coupons and product promotions", "Kortingscodes en productacties", "Gutscheine und Produktangebote", "Kuponlar ve ürün kampanyaları", "Coupons et promotions produits", "Cupones y promociones")),
  priced("audit", 150, "once", software, translated("سجل تغييرات وصلاحيات تفصيلية", "Audit trail and granular permissions", "Auditlog en gedetailleerde rechten", "Auditprotokoll und Berechtigungen", "Denetim kaydı ve ayrıntılı izinler", "Journal d'audit et droits détaillés", "Auditoría y permisos detallados")),
  priced("accessibility", 100, "once", all, translated("مراجعة إتاحة واستخدام لوحة المفاتيح", "Accessibility and keyboard review", "Toegankelijkheids- en toetsenbordcontrole", "Barrierefreiheits- und Tastaturprüfung", "Erişilebilirlik ve klavye incelemesi", "Revue accessibilité et clavier", "Revisión de accesibilidad y teclado")),
  priced("design-system", 150, "once", ["brand", "web", "mobile"], translated("مكتبة مكونات ودليل التصميم", "Component library and design guide", "Componentenbibliotheek en ontwerpgids", "Komponentenbibliothek und Designleitfaden", "Bileşen kütüphanesi ve tasarım rehberi", "Bibliothèque de composants et guide", "Biblioteca de componentes y guía")),
];
export const performanceOptions = [
  priced("images", 0, "once", software, translated("ضغط الصور وصيغ حديثة", "Image compression and modern formats", "Beeldcompressie en moderne formaten", "Bildkompression und moderne Formate", "Görsel sıkıştırma ve modern biçimler", "Compression et formats modernes", "Compresión y formatos modernos")),
  priced("cache", 50, "once", software, translated("تخزين مؤقت وتسريع الصفحات", "Caching and page acceleration", "Caching en paginaversnelling", "Caching und Seitenbeschleunigung", "Önbellek ve sayfa hızlandırma", "Cache et accélération des pages", "Caché y aceleración de páginas")),
  priced("lazy", 0, "once", software, translated("تحميل تدريجي للصور والمحتوى", "Lazy loading for images and content", "Uitgesteld laden van beelden en inhoud", "Verzögertes Laden von Bildern und Inhalt", "Görsel ve içerik için ertelenmiş yükleme", "Chargement différé des images et contenus", "Carga diferida de imágenes y contenido")),
  priced("media", 95, "once", all, translated("معرض صور وفيديو قابل للإدارة", "Manageable image and video gallery", "Beheerbare beeld- en videogalerij", "Verwaltbare Bild- und Videogalerie", "Yönetilebilir görsel ve video galerisi", "Galerie images et vidéos administrable", "Galería de imágenes y vídeos administrable")),
  priced("cloud", 75, "once", software, translated("ربط التخزين السحابي للملفات", "Cloud file storage integration", "Koppeling met cloudopslag", "Cloud-Dateispeicher anbinden", "Bulut dosya depolama entegrasyonu", "Intégration du stockage cloud", "Integración de almacenamiento en nube")),
  priced("performance-audit", 125, "once", software, translated("تدقيق الأداء وتحسين مسار التحميل", "Performance audit and loading optimization", "Prestatie-audit en laadoptimalisatie", "Leistungsprüfung und Ladeoptimierung", "Performans denetimi ve yükleme iyileştirme", "Audit performance et optimisation", "Auditoría de rendimiento y optimización")),
];
export const projectLanguages = ["ar", "en", "nl", "de", "tr", "fr", "es", "it", "pt", "zh", "ja", "ru"];
export const languageNames: Record<string, string> = { ar: "العربية", en: "English", nl: "Nederlands", de: "Deutsch", tr: "Türkçe", fr: "Français", es: "Español", it: "Italiano", pt: "Português", zh: "中文", ja: "日本語", ru: "Русский" };
export type ProjectConfiguration = {
  priceVersion?: 1 | 2;
  promotionPercent?: number;
  version: 1; type: ProjectType; kind: string; features: FeatureKey[]; extras: string[]; providers: string[]; languages: string[]; modules: string[]; performance: string[];
  speed: Speed; deliveryDays: number; projectName: string; domain: string; name: string; company: string; notes: string; templateId: string;
};
export function initialConfiguration(type: ProjectType = "web", kind?: string): ProjectConfiguration {
  const selected = projectOption(kind ?? "") ?? projectOptions.find(p => p.type === type)!;
  return { version: 1, priceVersion: 2, type: selected.type, kind: selected.id, features: [...selected.features], extras: [], providers: [], languages: ["ar"], modules: [], performance: [], speed: "standard", deliveryDays: selected.weeks * 7, projectName: "", domain: "", name: "", company: "", notes: "", templateId: "" };
}
export function configuredEstimate(config: ProjectConfiguration) {
  const factor = config.priceVersion === 1 ? 2.5 : 1;
  const selected = projectOption(config.kind)!;
  const pack = websitePackage(config.kind) ?? { type: selected.type, low: selected.price, high: Math.round(selected.price * 1.4), weeks: selected.weeks, features: selected.features };
  // Language count is charged separately, never twice as the generic i18n module.
  const result = estimate(config.type, config.features.filter(f => f !== "i18n"), config.speed, { ...pack, low: Math.round(pack.low * factor), high: Math.round(pack.high * factor) }, factor, config.promotionPercent);
  const chosen = [...extraOptions.filter(p => config.extras.includes(p.id)), ...providerOptions.filter(p => config.providers.includes(p.id)), ...moduleOptions.filter(p => config.modules.includes(p.id)), ...performanceOptions.filter(p => config.performance.includes(p.id))];
  const languagePrice = Math.max(0, config.languages.length - 1) * featureCost.i18n.price * factor;
  const setup = chosen.filter(p => p.period === "once").reduce((sum, p) => sum + Math.round(p.price * factor), languagePrice);
  const simpleDays: Record<string, number> = { landing: 3, personal: 7, portfolio: 10, company: 14, restaurant: 10, blog: 14, "social-design": 3, "visual-identity": 10 };
  const scopeDays = config.kind in simpleDays
    ? Math.ceil(simpleDays[config.kind] * speedModifier[config.speed].weeks) + Math.max(0, result.weeks - Math.ceil(selected.weeks * speedModifier[config.speed].weeks)) * 7
    : result.weeks * 7;
  return { ...result, setup, totalLow: result.low + setup, totalHigh: result.high + setup, monthly: chosen.filter(p => p.period === "month").reduce((sum, p) => sum + p.price, 0), yearly: chosen.filter(p => p.period === "year").reduce((sum, p) => sum + p.price, 0), minimumDays: Math.max(3, scopeDays + Math.ceil(config.modules.length / 3) * 2 + Math.max(0, config.languages.length - 1) * 2) };
}
