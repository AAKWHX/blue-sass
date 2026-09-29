import type { Locale } from "@/lib/i18n/config";
import { serviceSlugs, type ServiceSlug } from "@/lib/service-catalog";
import type { FeatureKey } from "@/lib/pricing";

const names: Record<Locale, string[]> = {
 ar: ["واجهة شركة استشارية", "مجلة ومركز محتوى", "حجز خدمات محلية", "تطبيق ميداني دون اتصال", "عضويات وتجربة شخصية", "دليل وجهات تفاعلي", "إدارة مخزون مكتبية", "لوحة عمليات الفريق", "متجر منتجات وعلامات", "متجر متعدد اللغات", "إدارة المبيعات والعملاء", "إدارة العمليات والموافقات", "مساعد معرفة ذكي", "أتمتة سير الطلبات", "هوية شركة ودليل بصري", "تصميم تطبيق ونموذج تفاعلي"],
 en: ["Consultancy website", "Editorial & content hub", "Local service booking", "Offline field app", "Personalised memberships", "Interactive destination guide", "Desktop inventory", "Team operations dashboard", "Product & brand store", "Multilingual storefront", "Sales & client management", "Operations & approvals", "AI knowledge assistant", "Request automation", "Brand identity & guidelines", "App design & prototype"],
 nl: ["Adviesbureauwebsite", "Redactie en contenthub", "Lokale diensten boeken", "Offline veldapp", "Persoonlijke lidmaatschappen", "Interactieve reisgids", "Desktopvoorraad", "Teamdashboard", "Product- en merkenwinkel", "Meertalige winkel", "Verkoop en klanten", "Processen en goedkeuringen", "AI-kennisassistent", "Aanvraagautomatisering", "Merkidentiteit en richtlijnen", "Appontwerp en prototype"],
 de: ["Beratungswebsite", "Redaktion und Inhalte", "Lokale Servicebuchung", "Offline-Außendienst-App", "Persönliche Mitgliedschaften", "Interaktiver Reiseführer", "Desktop-Lagerverwaltung", "Team-Dashboard", "Produkt- und Markenshop", "Mehrsprachiger Shop", "Vertrieb und Kunden", "Abläufe und Freigaben", "KI-Wissensassistent", "Anfrageautomatisierung", "Markenidentität und Leitfaden", "Appdesign und Prototyp"],
 tr: ["Danışmanlık sitesi", "İçerik merkezi", "Yerel hizmet rezervasyonu", "Çevrimdışı saha uygulaması", "Kişisel üyelikler", "Etkileşimli gezi rehberi", "Masaüstü stok yönetimi", "Ekip operasyon paneli", "Ürün ve marka mağazası", "Çok dilli mağaza", "Satış ve müşteri yönetimi", "İşlemler ve onaylar", "Yapay zekâ bilgi asistanı", "Talep otomasyonu", "Marka kimliği ve rehber", "Uygulama tasarımı ve prototip"],
 fr: ["Site de conseil", "Centre éditorial", "Réservation de services", "Application terrain hors ligne", "Adhésions personnalisées", "Guide interactif", "Stock sur ordinateur", "Tableau de bord équipe", "Boutique de marques", "Boutique multilingue", "Ventes et clients", "Opérations et validations", "Assistant de connaissances IA", "Automatisation des demandes", "Identité et charte", "Application et prototype"],
 es: ["Web de consultoría", "Centro editorial", "Reservas de servicios", "App de campo sin conexión", "Membresías personalizadas", "Guía interactiva", "Inventario de escritorio", "Panel de operaciones", "Tienda de marcas", "Tienda multilingüe", "Ventas y clientes", "Operaciones y aprobaciones", "Asistente de conocimiento IA", "Automatización de solicitudes", "Identidad y guía visual", "Diseño de app y prototipo"],
};
const features: FeatureKey[][] = [
 ["cms", "i18n"], ["cms", "auth", "api"], ["auth", "payments", "realtime"], ["auth", "api", "offline"],
 ["auth", "payments", "appstore"], ["api", "realtime", "appstore"], ["auth", "dashboard", "offline"], ["auth", "dashboard", "api"],
 ["catalog", "payments", "cms"], ["catalog", "payments", "i18n"], ["auth", "dashboard", "api"], ["dashboard", "automation", "realtime"],
 ["ai", "api", "dashboard"], ["automation", "api", "realtime"], ["identity", "i18n"], ["prototype", "identity"],
];
export function serviceTemplates(locale: Locale, service?: ServiceSlug) {
 return names[locale].map((name, index) => ({ id: `${serviceSlugs[Math.floor(index / 2)]}-${index % 2 + 1}`, service: serviceSlugs[Math.floor(index / 2)], name, features: features[index], variant: index % 2 })).filter(item => !service || item.service === service);
}
export type ServiceTemplate = ReturnType<typeof serviceTemplates>[number];
export function findServiceTemplate(id: string | undefined, locale: Locale) {
 return serviceTemplates(locale).find(item => item.id === id);
}
