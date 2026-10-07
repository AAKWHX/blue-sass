import { withExtraLocales } from "@/lib/i18n/extra-locales";
import type { Locale } from "@/lib/i18n";
import { platformCopy } from "@/lib/i18n/platform-tools";
import { subscriptionToolLimits } from "@/lib/subscription-tools";
import { subscriptionUnits } from "@/lib/i18n/subscription-units";

export const subscriptionIds = ["launch", "growth", "scale"] as const;
export type SubscriptionId = (typeof subscriptionIds)[number];

type LegacyPlan = { id: SubscriptionId; name: string; description: string; price: number; features: string[]; response: string; hours: string };

const rows: Record<Locale, string[]> = withExtraLocales({
  ar: [
    "انطلاقة|للمواقع الصغيرة التي تحتاج استضافة آمنة وصيانة مستمرة.|استضافة مُدارة،نسخ احتياطي أسبوعي،تحديثات أمنية،مراقبة التوفر،تقرير شهري|خلال يومي عمل|ساعة دعم شهريًا",
    "نمو|للمواقع والمتاجر النشطة التي تتطور باستمرار.|كل مزايا انطلاقة،نسخ احتياطي يومي،تحسين السرعة،تحليلات وتقارير،تحديثات محتوى،بيئة تجريبية|خلال يوم عمل|4 ساعات تطوير شهريًا",
    "توسّع|للمنصات والأنظمة التي تحتاج متابعة وأولوية عالية.|كل مزايا نمو،مراقبة متقدمة،دعم بالأولوية،تحسينات شهرية،مراجعة تقنية،أتمتة وربط خدمات|خلال 4 ساعات عمل|10 ساعات تطوير شهريًا",
  ],
  en: [
    "Launch|For smaller websites that need secure hosting and ongoing care.|Managed hosting,Weekly backups,Security updates,Uptime monitoring,Monthly report|Within 2 business days|1 support hour monthly",
    "Growth|For active websites and stores that improve continuously.|Everything in Launch,Daily backups,Performance optimisation,Analytics reports,Content updates,Staging environment|Within 1 business day|4 development hours monthly",
    "Scale|For platforms and systems that need priority support.|Everything in Growth,Advanced monitoring,Priority support,Monthly improvements,Technical review,Automation integrations|Within 4 business hours|10 development hours monthly",
  ],
  nl: [
    "Start|Voor kleinere websites met veilige hosting en doorlopend onderhoud.|Beheerde hosting,Wekelijkse back-ups,Beveiligingsupdates,Uptime-monitoring,Maandrapport|Binnen 2 werkdagen|1 supportuur per maand",
    "Groei|Voor actieve websites en winkels die blijven verbeteren.|Alles van Start,Dagelijkse back-ups,Prestatie-optimalisatie,Analyserapporten,Contentupdates,Testomgeving|Binnen 1 werkdag|4 ontwikkeluren per maand",
    "Schaal|Voor platforms en systemen met prioriteitsondersteuning.|Alles van Groei,Geavanceerde monitoring,Prioriteitsondersteuning,Maandelijkse verbeteringen,Technische review,Automatiseringen|Binnen 4 werkuren|10 ontwikkeluren per maand",
  ],
  de: [
    "Start|Für kleinere Websites mit sicherem Hosting und laufender Pflege.|Managed Hosting,Wöchentliche Backups,Sicherheitsupdates,Uptime-Monitoring,Monatsbericht|Innerhalb von 2 Werktagen|1 Supportstunde monatlich",
    "Wachstum|Für aktive Websites und Shops mit laufender Weiterentwicklung.|Alles aus Start,Tägliche Backups,Performance-Optimierung,Analyseberichte,Inhaltsupdates,Testumgebung|Innerhalb 1 Werktags|4 Entwicklungsstunden monatlich",
    "Skalierung|Für Plattformen und Systeme mit priorisiertem Support.|Alles aus Wachstum,Erweitertes Monitoring,Prioritätssupport,Monatliche Verbesserungen,Technische Prüfung,Automatisierungen|Innerhalb 4 Arbeitsstunden|10 Entwicklungsstunden monatlich",
  ],
  tr: [
    "Başlangıç|Güvenli barındırma ve sürekli bakım isteyen küçük siteler için.|Yönetilen hosting,Haftalık yedek,Güvenlik güncellemeleri,Çalışma süresi takibi,Aylık rapor|2 iş günü içinde|Aylık 1 destek saati",
    "Büyüme|Sürekli gelişen aktif siteler ve mağazalar için.|Başlangıçtaki her şey,Günlük yedek,Performans iyileştirme,Analiz raporları,İçerik güncellemeleri,Test ortamı|1 iş günü içinde|Aylık 4 geliştirme saati",
    "Ölçek|Öncelikli destek isteyen platform ve sistemler için.|Büyümedeki her şey,Gelişmiş izleme,Öncelikli destek,Aylık iyileştirmeler,Teknik inceleme,Otomasyonlar|4 iş saati içinde|Aylık 10 geliştirme saati",
  ],
  fr: [
    "Lancement|Pour les petits sites nécessitant hébergement sécurisé et maintenance.|Hébergement géré,Sauvegardes hebdomadaires,Mises à jour de sécurité,Surveillance de disponibilité,Rapport mensuel|Sous 2 jours ouvrés|1 heure de support par mois",
    "Croissance|Pour les sites et boutiques actifs en évolution continue.|Tout Lancement,Sauvegardes quotidiennes,Optimisation des performances,Rapports analytiques,Mises à jour de contenu,Préproduction|Sous 1 jour ouvré|4 heures de développement par mois",
    "Échelle|Pour les plateformes nécessitant une assistance prioritaire.|Tout Croissance,Surveillance avancée,Support prioritaire,Améliorations mensuelles,Revue technique,Automatisations|Sous 4 heures ouvrées|10 heures de développement par mois",
  ],
  es: [
    "Lanzamiento|Para sitios pequeños que necesitan alojamiento seguro y mantenimiento.|Alojamiento administrado,Copias semanales,Actualizaciones de seguridad,Monitoreo de disponibilidad,Informe mensual|En 2 días hábiles|1 hora de soporte mensual",
    "Crecimiento|Para sitios y tiendas activos que mejoran continuamente.|Todo Lanzamiento,Copias diarias,Optimización de rendimiento,Informes analíticos,Actualizaciones de contenido,Entorno de pruebas|En 1 día hábil|4 horas de desarrollo mensuales",
    "Escala|Para plataformas que necesitan soporte prioritario.|Todo Crecimiento,Monitoreo avanzado,Soporte prioritario,Mejoras mensuales,Revisión técnica,Automatizaciones|En 4 horas hábiles|10 horas de desarrollo mensuales",
  ],
});

const prices = [25, 65, 150];
export function legacySubscriptionPlans(locale: Locale): LegacyPlan[] {
  return rows[locale].map((row, index) => {
    const [name, description, featureList, response, hours] = row.split("|");
    return { id: subscriptionIds[index], name, description, price: prices[index], features: featureList.split(/[,،、，]/), response, hours };
  });
}

/** Version 2 is tool access, not staff working time. Legacy terms stay archived. */
export function subscriptionPlans(locale: Locale) {
  const c = platformCopy(locale);
  return subscriptionIds.map((id, index) => {
    const limits = subscriptionToolLimits[id];
    return { id, name: ["Pro", "Business", "Agency"][index], description: c.siteLimit.replace("{count}", String(limits.sites)), price: limits.price, limits,
      features: [...c.toolFeatures, `${limits.reports} ${subscriptionUnits(locale).units}`, c.siteLimit.replace("{count}", String(limits.sites)), ...(limits.compare ? [c.comparisonFeature] : []), ...(limits.jsonExport ? [c.jsonFeature] : [])],
    };
  });
}

export const subscriptionAddOns: Record<SubscriptionId, string[]> = {
  launch: ["hosting", "maintenance"],
  growth: ["email", "hosting", "maintenance", "analytics"],
  scale: ["domain", "email", "hosting", "maintenance", "google", "analytics"],
};

export const subscriptionPurchaseNote: Record<Locale, string> = withExtraLocales({
  ar: "يُحفظ الاشتراك ثم تنتقل مباشرة إلى PayPal. لا يبدأ التفعيل إلا بعد تأكيد الدفع، ولا نخزن بيانات بطاقتك.",
  en: "Your plan is saved before secure PayPal checkout. Activation starts only after payment confirmation; we never store card details.",
  nl: "Uw plan wordt opgeslagen vóór de veilige PayPal-betaling. Activering start pas na bevestiging; wij bewaren geen kaartgegevens.",
  de: "Ihr Plan wird vor dem sicheren PayPal-Checkout gespeichert. Die Aktivierung beginnt erst nach Bestätigung; Kartendaten speichern wir nicht.",
  tr: "Paketiniz güvenli PayPal ödemesinden önce kaydedilir. Etkinleştirme yalnızca ödeme onayından sonra başlar; kart bilgilerini saklamayız.",
  fr: "Votre formule est enregistrée avant le paiement PayPal sécurisé. L’activation commence après confirmation; aucune donnée bancaire n’est stockée.",
  es: "El plan se guarda antes del pago seguro con PayPal. La activación empieza tras la confirmación; no almacenamos datos de tarjeta.",
});
