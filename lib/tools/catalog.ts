import type { Locale } from "../i18n/config";
export const toolIds = ["website-audit", "website-cost-calculator", "seo-checker", "speed-test", "security-checker", "qr-code-generator", "invoice-generator", "business-name-generator", "ai-content-generator", "privacy-scanner", "message-checker"] as const;
export type ToolId = typeof toolIds[number];
export const toolCategories = ["website", "seo", "security", "ai", "business", "marketing"] as const;
const categories = ["website", "business", "seo", "website", "security", "marketing", "business", "ai", "ai", "security", "security"] as const;
const names: Record<Locale, string[]> = {
 ar: ["فحص الموقع", "اختيار تفاصيل المشروع", "فحص SEO", "قياس سرعة الموقع", "فحص إعدادات الحماية", "إنشاء رمز QR", "إنشاء فاتورة", "اقتراح أسماء أعمال", "كتابة محتوى بالذكاء الاصطناعي", "فحص مؤشرات الخصوصية", "فحص الرسائل والروابط"],
 en: ["Website audit", "Project cost calculator", "SEO checker", "Website speed test", "Security configuration check", "QR code generator", "Invoice generator", "Business name generator", "AI content generator", "Privacy signals scanner", "Message and link checker"],
 nl: ["Websitecontrole", "Projectcalculator", "SEO-controle", "Snelheidstest", "Beveiligingscontrole", "QR-code maken", "Factuur maken", "Bedrijfsnamen bedenken", "AI-teksten maken", "Privacysignalen controleren", "Berichten en links controleren"],
 de: ["Websiteprüfung", "Projektkalkulator", "SEO-Prüfung", "Geschwindigkeitstest", "Sicherheitsprüfung", "QR-Code erstellen", "Rechnung erstellen", "Firmennamen finden", "KI-Inhalte erstellen", "Datenschutzsignale prüfen", "Nachrichten und Links prüfen"],
 tr: ["Site denetimi", "Proje hesaplayıcı", "SEO kontrolü", "Hız testi", "Güvenlik kontrolü", "QR oluşturucu", "Fatura oluşturucu", "İş adı oluşturucu", "Yapay zekâ içerik", "Gizlilik işaretleri", "Mesaj ve bağlantı kontrolü"],
 fr: ["Audit de site", "Calculateur de projet", "Contrôle SEO", "Test de vitesse", "Contrôle de sécurité", "Générateur QR", "Créer une facture", "Noms d’entreprise", "Contenu IA", "Signaux de confidentialité", "Messages et liens"],
 es: ["Auditoría web", "Calculadora de proyecto", "Revisión SEO", "Prueba de velocidad", "Revisión de seguridad", "Generador QR", "Crear factura", "Nombres de empresa", "Contenido IA", "Señales de privacidad", "Mensajes y enlaces"],
 it: ["Analisi sito", "Calcolatore progetto", "Controllo SEO", "Test velocità", "Controllo sicurezza", "Generatore QR", "Generatore fatture", "Nomi aziendali", "Contenuti IA", "Segnali privacy", "Messaggi e link"],
 pt: ["Auditoria web", "Calculadora de projeto", "Verificação SEO", "Teste de velocidade", "Verificação de segurança", "Gerador QR", "Gerador de faturas", "Nomes comerciais", "Conteúdo IA", "Sinais de privacidade", "Mensagens e ligações"],
 pl: ["Audyt strony", "Kalkulator projektu", "Kontrola SEO", "Test szybkości", "Kontrola bezpieczeństwa", "Generator QR", "Generator faktur", "Nazwy firm", "Treści AI", "Sygnały prywatności", "Wiadomości i linki"],
 uk: ["Аудит сайту", "Калькулятор проєкту", "Перевірка SEO", "Тест швидкості", "Перевірка безпеки", "Генератор QR", "Генератор рахунків", "Назви бізнесу", "Контент ШІ", "Ознаки приватності", "Повідомлення й посилання"],
 ru: ["Аудит сайта", "Калькулятор проекта", "Проверка SEO", "Тест скорости", "Проверка безопасности", "Генератор QR", "Генератор счетов", "Названия бизнеса", "Контент ИИ", "Признаки приватности", "Сообщения и ссылки"],
 zh: ["网站审计", "项目报价计算", "SEO检查", "速度测试", "安全配置检查", "二维码生成", "发票生成", "企业名称生成", "AI内容生成", "隐私信号检查", "消息与链接检查"],
 ja: ["サイト監査", "プロジェクト見積もり", "SEO確認", "速度テスト", "セキュリティ設定確認", "QRコード生成", "請求書作成", "会社名の提案", "AIコンテンツ生成", "プライバシー確認", "メッセージとリンク確認"],
 ko: ["사이트 감사", "프로젝트 견적", "SEO 검사", "속도 테스트", "보안 설정 검사", "QR 생성", "청구서 생성", "회사 이름 제안", "AI 콘텐츠 생성", "개인정보 신호 검사", "메시지 및 링크 검사"],
};
export function toolCatalog(locale: Locale) { return toolIds.map((id, i) => ({ id, title: names[locale][i], category: categories[i], ai: categories[i] === "ai" })); }
export function isToolId(value: string): value is ToolId { return (toolIds as readonly string[]).includes(value); }
