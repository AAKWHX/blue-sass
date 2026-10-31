import type { Locale } from "./config";
import { creationLocale } from "./creation";
const content = {
  ar: {
    details: ["تابع موقعك بتقارير وفحوص دورية، واختر الخطة المناسبة لاستخدامك.", "انشر موقع Static أو مشروع Next.js، وتابع حالة نشره من حسابك.", "أدوات عملية تختصر مهام صغيرة ومتكررة في مشروعك.", "تصفح الملفات والمنتجات الرقمية المعتمدة، وراجع تفاصيلها قبل الشراء.", "اعرض احتياج مشروعك وتواصل مع المستقلين حول النطاق والعرض المناسب.", "اكتشف فرص العمل، أو انشر فرصة واضحة للمهارات التي يحتاجها فريقك."],
    features: [["فحوص وتقارير للموقع", "حدود استخدام واضحة", "سجل للنتائج في حسابك"], ["رفع ملفات المشروع", "متابعة حالة النشر", "إدارة مواقعك من مكان واحد"], [], ["وصف ومحتويات كل منتج", "متطلبات الاستخدام", "الوصول إلى مشترياتك"], ["تفاصيل مشروع واضحة", "عروض قابلة للمراجعة", "تواصل حول المتطلبات"], ["تصفح الفرص المتاحة", "تفاصيل الدور ومكان العمل", "خيارات نشر للإعلان"]],
    tools: ["رمز QR|حوّل رابطًا أو بيانات اتصال إلى رمز قابل للتنزيل والمشاركة.", "فاتورة PDF|رتّب البنود والكميات والخصم والضريبة في فاتورة قابلة للتنزيل.", "فحص SEO|راجع عناوين الصفحة ووصفها وبنيتها لمعرفة ما يحتاج تحسينًا.", "فحص الرسائل والروابط|اكشف مؤشرات الاستعجال وطلبات كلمات المرور والروابط المخفية دون زيارتها."],
    note: "بعض الأدوات تحتاج حسابًا أو تخضع لحدود استخدام. نتائج الفحص تساعد على المراجعة ولا تمثل ضمانًا شاملًا.",
  },
  en: {
    details: ["Follow your website with recurring checks and reports, and choose a plan for your usage.", "Publish a static site or Next.js project and follow its deployment from your account.", "Practical tools for small, recurring tasks in your project.", "Browse approved digital files and products, and review their contents before buying.", "Describe your project and discuss its scope and suitable offers with freelancers.", "Discover opportunities or publish a clear role for the skills your team needs."],
    features: [["Website checks and reports", "Clear usage limits", "Results history in your account"], ["Upload project files", "Follow deployment status", "Manage your sites in one place"], [], ["Product contents and description", "Usage requirements", "Access your purchases"], ["Clear project requirements", "Offers you can review", "Discuss the scope"], ["Browse available roles", "Role and location details", "Job publication options"]],
    tools: ["QR code|Turn a link or contact details into a code you can download and share.", "PDF invoice|Organise items, quantities, discounts and tax into a downloadable invoice.", "SEO checker|Review page titles, descriptions and structure to identify improvements.", "Message and link checker|Spot urgency, password requests and hidden link destinations without visiting them."],
    note: "Some tools require an account or have usage limits. Checks support your review and do not provide a comprehensive guarantee.",
  },
  nl: {
    details: ["Volg uw website met periodieke controles en rapporten en kies een passend abonnement.", "Publiceer een statische site of Next.js-project en volg de publicatie vanuit uw account.", "Praktische tools voor kleine, terugkerende taken in uw project.", "Bekijk goedgekeurde digitale bestanden en producten en lees de inhoud vóór aankoop.", "Beschrijf uw project en bespreek de scope en passende offertes met freelancers.", "Ontdek vacatures of publiceer een duidelijke rol voor de vaardigheden die uw team zoekt."],
    features: [["Websitecontroles en rapporten", "Duidelijke gebruikslimieten", "Resultaatgeschiedenis in uw account"], ["Projectbestanden uploaden", "Publicatiestatus volgen", "Uw sites op één plek beheren"], [], ["Inhoud en productbeschrijving", "Gebruiksvereisten", "Toegang tot uw aankopen"], ["Duidelijke projectvereisten", "Offertes beoordelen", "De scope bespreken"], ["Beschikbare rollen bekijken", "Functie- en locatiegegevens", "Publicatieopties voor vacatures"]],
    tools: ["QR-code|Maak van een link of contactgegevens een downloadbare code om te delen.", "PDF-factuur|Zet artikelen, aantallen, korting en btw in een downloadbare factuur.", "SEO-controle|Bekijk paginatitels, beschrijvingen en structuur voor verbeterpunten.", "Berichten en links controleren|Herken urgentie, wachtwoordverzoeken en verborgen linkdoelen zonder ze te bezoeken."],
    note: "Sommige tools vereisen een account of hebben gebruikslimieten. Controles ondersteunen uw beoordeling en bieden geen volledige garantie.",
  },
};
export function homePlatformCopy(locale: Locale) { return content[creationLocale(locale)]; }
