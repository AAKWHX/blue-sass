import type {Locale} from "./config";
const rows:Record<Locale,string[]>={
 ar:["الدولة","الأسلوب","الكلمات الأساسية","الجمهور المستهدف","الصفحة الرئيسية","من نحن","الخدمات","وصف منتج","وصف SEO","محتوى اجتماعي","نص","بريد إلكتروني","هاتف","مفتاح Wi-Fi"],
 en:["Country","Style","Keywords","Target audience","Homepage","About","Services","Product description","SEO description","Social content","Text","Email","Phone","Wi-Fi key"],
 nl:["Land","Stijl","Trefwoorden","Doelgroep","Homepage","Over ons","Diensten","Productbeschrijving","SEO-beschrijving","Sociale inhoud","Tekst","E-mail","Telefoon","Wifi-sleutel"],
 de:["Land","Stil","Schlüsselwörter","Zielgruppe","Startseite","Über uns","Leistungen","Produktbeschreibung","SEO-Beschreibung","Social-Media-Inhalte","Text","E-Mail","Telefon","WLAN-Schlüssel"],
 tr:["Ülke","Tarz","Anahtar kelimeler","Hedef kitle","Ana sayfa","Hakkımızda","Hizmetler","Ürün açıklaması","SEO açıklaması","Sosyal içerik","Metin","E-posta","Telefon","Wi-Fi anahtarı"],
 fr:["Pays","Style","Mots-clés","Public cible","Accueil","À propos","Services","Description produit","Description SEO","Contenu social","Texte","E-mail","Téléphone","Clé Wi-Fi"],
 es:["País","Estilo","Palabras clave","Público objetivo","Inicio","Nosotros","Servicios","Descripción producto","Descripción SEO","Contenido social","Texto","Correo","Teléfono","Clave Wi-Fi"],
 it:["Paese","Stile","Parole chiave","Pubblico","Homepage","Chi siamo","Servizi","Descrizione prodotto","Descrizione SEO","Contenuti social","Testo","Email","Telefono","Chiave Wi-Fi"],
 pt:["País","Estilo","Palavras-chave","Público-alvo","Início","Sobre","Serviços","Descrição produto","Descrição SEO","Conteúdo social","Texto","Email","Telefone","Chave Wi-Fi"],
 pl:["Kraj","Styl","Słowa kluczowe","Odbiorcy","Strona główna","O nas","Usługi","Opis produktu","Opis SEO","Treść społecznościowa","Tekst","E-mail","Telefon","Klucz Wi-Fi"],
 uk:["Країна","Стиль","Ключові слова","Цільова аудиторія","Головна","Про нас","Послуги","Опис продукту","Опис SEO","Соціальний контент","Текст","Електронна пошта","Телефон","Ключ Wi-Fi"],
 ru:["Страна","Стиль","Ключевые слова","Аудитория","Главная","О нас","Услуги","Описание продукта","Описание SEO","Социальный контент","Текст","Почта","Телефон","Ключ Wi-Fi"],
 zh:["国家","风格","关键词","目标受众","首页","关于","服务","产品描述","SEO描述","社交内容","文本","邮箱","电话","Wi-Fi密钥"],
 ja:["国","スタイル","キーワード","対象者","ホーム","会社紹介","サービス","商品説明","SEO説明","SNSコンテンツ","テキスト","メール","電話","Wi-Fiキー"],
 ko:["국가","스타일","키워드","대상 고객","홈","소개","서비스","제품 설명","SEO 설명","소셜 콘텐츠","텍스트","이메일","전화","Wi-Fi 키"],
};
export function toolFormCopy(locale:Locale){const [country,style,keywords,audience,home,about,services,product,seo,social,text,email,phone,password]=rows[locale];return {country,style,keywords,audience,content:[home,about,services,product,seo,social],qr:{Text:text,Email:email,Phone:phone,password}};}
