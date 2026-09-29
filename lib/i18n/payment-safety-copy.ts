import type { Locale } from "./config";

export const paymentSafetyCopy: Record<Locale, { sandboxDetail: string; cards: string }> = {
  ar: {
    sandboxDetail: "اختبار فقط: يقبل PayPal بيانات الاختبار عمدًا، ولا تُخصم أو تُحوّل أموال حقيقية. التحقق من البطاقة و3D Secure يعملان في الوضع الحقيقي حسب أهلية PayPal.",
    cards: "PayPal أو بطاقة Visa / Mastercard المؤهلة",
  },
  en: {
    sandboxDetail: "Testing only: PayPal intentionally accepts sandbox test data and no real money is charged or transferred. Live card checks and 3D Secure depend on PayPal eligibility.",
    cards: "PayPal or an eligible Visa / Mastercard",
  },
  nl: {
    sandboxDetail: "Alleen testen: PayPal accepteert bewust testgegevens en er wordt geen echt geld afgeschreven of overgemaakt. Live kaartcontrole en 3D Secure zijn afhankelijk van PayPal.",
    cards: "PayPal of een geschikte Visa / Mastercard",
  },
  de: {
    sandboxDetail: "Nur zum Testen: PayPal akzeptiert bewusst Testdaten; es wird kein echtes Geld belastet oder übertragen. Live-Kartenprüfung und 3D Secure hängen von PayPal ab.",
    cards: "PayPal oder geeignete Visa / Mastercard",
  },
  tr: {
    sandboxDetail: "Yalnızca test içindir: PayPal test verilerini bilerek kabul eder; gerçek para çekilmez veya aktarılmaz. Canlı kart kontrolü ve 3D Secure, PayPal uygunluğuna bağlıdır.",
    cards: "PayPal veya uygun Visa / Mastercard",
  },
  fr: {
    sandboxDetail: "Test uniquement : PayPal accepte volontairement les données de test et aucun argent réel n’est débité ni transféré. Les contrôles carte et 3D Secure dépendent de l’éligibilité PayPal.",
    cards: "PayPal ou Visa / Mastercard éligible",
  },
  es: {
    sandboxDetail: "Solo pruebas: PayPal acepta datos de prueba deliberadamente y no se cobra ni transfiere dinero real. La verificación de tarjeta y 3D Secure en producción dependen de PayPal.",
    cards: "PayPal o Visa / Mastercard elegible",
  },
};
