import type { Locale } from "@/lib/i18n";
import type { ServiceSlug } from "@/lib/service-catalog";

export type ServiceDetail = { idealFor: string; timeline: string; outcome: string };

const rows: Record<Locale, string[]> = {
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
};

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
