// Mechanical normalization of locally generated static dictionaries.
import fs from "node:fs";
const labels = {
  it: ["Lingua", "Pagina iniziale", "Servizi", "Contatti", "Pianificazione", "Design", "Sviluppo", "Test", "Revisione", "Completato", "Avanti", "Indietro", "Blue Sass"],
  pt: ["Idioma", "Início", "Serviços", "Contacto", "Planeamento", "Design", "Desenvolvimento", "Testes", "Revisão", "Concluído", "Seguinte", "Voltar", "Blue Sass"],
  pl: ["Język", "Strona główna", "Usługi", "Kontakt", "Planowanie", "Projektowanie", "Programowanie", "Testowanie", "Weryfikacja", "Ukończono", "Dalej", "Wstecz", "Blue Sass"],
  uk: ["Мова", "Головна", "Послуги", "Контакти", "Планування", "Дизайн", "Розробка", "Тестування", "Перевірка", "Завершено", "Далі", "Назад", "Blue Sass"],
  ru: ["Язык", "Главная", "Услуги", "Контакты", "Планирование", "Дизайн", "Разработка", "Тестирование", "Проверка", "Завершено", "Далее", "Назад", "Blue Sass"],
  zh: ["语言", "首页", "服务", "联系我们", "规划", "设计", "开发", "测试", "审核", "已完成", "下一步", "返回", "Blue Sass"],
  ja: ["言語", "ホーム", "サービス", "お問い合わせ", "計画", "デザイン", "開発", "テスト", "レビュー", "完了", "次へ", "戻る", "Blue Sass"],
  ko: ["언어", "홈", "서비스", "문의", "기획", "디자인", "개발", "테스트", "검토", "완료", "다음", "뒤로", "Blue Sass"],
};
const keys = ["Language", "Home", "Services", "Contact", "Planning", "Design", "Development", "Testing", "Review", "Completed", "Next", "Back", "Blue Sass"];
const serviceTitles = {
  it: ["Siti web", "App Android", "App iPhone", "Software Windows", "Negozi online", "Sistemi aziendali", "IA e automazione", "Interfacce e identità visiva"],
  pt: ["Sites web", "Aplicações Android", "Aplicações iPhone", "Software Windows", "Lojas online", "Sistemas empresariais", "IA e automação", "Interfaces e identidade visual"],
  pl: ["Strony internetowe", "Aplikacje Android", "Aplikacje iPhone", "Oprogramowanie Windows", "Sklepy internetowe", "Systemy biznesowe", "AI i automatyzacja", "Interfejsy i identyfikacja wizualna"],
  uk: ["Вебсайти", "Застосунки Android", "Застосунки iPhone", "Програми Windows", "Інтернет-магазини", "Бізнес-системи", "ШІ та автоматизація", "Інтерфейси та айдентика"],
  ru: ["Веб-сайты", "Приложения Android", "Приложения iPhone", "Программы Windows", "Интернет-магазины", "Бизнес-системы", "ИИ и автоматизация", "Интерфейсы и фирменный стиль"],
  zh: ["网站", "Android 应用", "iPhone 应用", "Windows 软件", "网上商店", "企业管理系统", "人工智能与自动化", "界面与品牌设计"],
  ja: ["ウェブサイト", "Android アプリ", "iPhone アプリ", "Windows ソフトウェア", "オンラインストア", "業務システム", "AI と自動化", "UI・ブランドデザイン"],
  ko: ["웹사이트", "Android 앱", "iPhone 앱", "Windows 소프트웨어", "온라인 쇼핑몰", "업무 시스템", "AI 및 자동화", "인터페이스 및 브랜드 디자인"],
};
const serviceKeys = ["Websites", "Android apps", "iPhone apps", "Windows software", "Online stores", "Business systems", "AI & automation", "Interface & brand design"];
const signIn = { it: "Accedi", pt: "Iniciar sessão", pl: "Zaloguj się", uk: "Увійти", ru: "Войти", zh: "登录", ja: "ログイン", ko: "로그인" };
for (const [locale, values] of Object.entries(labels)) {
  const file = `lib/i18n/locales-extra/${locale}.json`;
  const lexicon = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [source, translated] of Object.entries(lexicon)) {
    if (source.startsWith("../")) { delete lexicon[source]; continue; }
    let normalized = translated.replaceAll("▁", " ");
    // Dynamic fragments keep their original boundary spacing.
    normalized = normalized.trim();
    if (/^\s/.test(source)) normalized = " " + normalized;
    if (/\s$/.test(source)) normalized += " ";
    normalized = normalized.replace(/(\S)(\{[^{}]+\})/g, "$1 $2").replace(/(\{[^{}]+\})([\p{L}\p{N}])/gu, "$1 $2");
    lexicon[source] = normalized.replaceAll("&amp;", "&");
    const serviceIndex = serviceKeys.indexOf(source.split("|")[0]);
    if (serviceIndex >= 0) lexicon[source] = [serviceTitles[locale][serviceIndex], ...lexicon[source].split("|").slice(1)].join("|");
  }
  keys.forEach((key, index) => { lexicon[key] = values[index]; });
  lexicon["Sign in"] = signIn[locale];
  const heroTitles = { it: "Trasformiamo la tua idea", pt: "Transformamos a sua ideia", pl: "Zamieniamy Twój pomysł", uk: "Перетворюємо вашу ідею", ru: "Превращаем вашу идею", zh: "将您的创意", ja: "あなたのアイデアを", ko: "당신의 아이디어를" };
  const heroEnds = { zh: "转化为数字产品", ja: "デジタル製品に変えます", ko: "디지털 제품으로 만듭니다" };
  lexicon["We turn your idea"] = heroTitles[locale];
  if (locale in heroEnds) lexicon["into a digital product"] = heroEnds[locale];
  for (const brand of ["PayPal", "Google", "Apple", "GitHub", "Microsoft", "LinkedIn", "Facebook", "Windows", "Android", "iPhone", "EUR", "API", "CRM", "ERP", "SSL", "PWA", "SaaS"]) if (brand in lexicon) lexicon[brand] = brand;
  fs.writeFileSync(file, JSON.stringify(lexicon, null, 2) + "\n");
}
