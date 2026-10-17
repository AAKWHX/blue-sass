import type { Locale } from "./config";
const rows: Record<Locale, string[]> = {
  "ar": [
    "قريبًا",
    "قيد التطوير",
    "مكتمل",
    "منشور",
    "منتجات رقمية معتمدة لعملك.",
    "تواصل مع المستقلين حول مشروعك.",
    "فرص العمل والإعلانات المهنية.",
    "معاينة",
    "آخر تحديث"
  ],
  "en": [
    "Coming Soon",
    "In Development",
    "Completed",
    "Published",
    "Approved digital products for your business.",
    "Connect with freelancers about your project.",
    "Job opportunities and professional listings.",
    "Preview",
    "Last updated"
  ],
  "nl": [
    "Binnenkort",
    "In ontwikkeling",
    "Afgerond",
    "Gepubliceerd",
    "Goedgekeurde digitale producten voor uw bedrijf.",
    "Vind freelancers voor uw project.",
    "Vacatures en professionele advertenties.",
    "Voorbeeld",
    "Laatst bijgewerkt"
  ],
  "de": [
    "Demnächst",
    "In Entwicklung",
    "Abgeschlossen",
    "Veröffentlicht",
    "Freigegebene digitale Produkte für Ihr Unternehmen.",
    "Freelancer für Ihr Projekt finden.",
    "Stellenangebote und professionelle Anzeigen.",
    "Vorschau",
    "Zuletzt aktualisiert"
  ],
  "tr": [
    "Yakında",
    "Geliştirme aşamasında",
    "Tamamlandı",
    "Yayımlandı",
    "İşletmeniz için onaylı dijital ürünler.",
    "Projeniz için freelancerlarla iletişim kurun.",
    "İş fırsatları ve profesyonel ilanlar.",
    "Önizleme",
    "Son güncelleme"
  ],
  "fr": [
    "Bientôt",
    "En développement",
    "Terminé",
    "Publié",
    "Des produits numériques approuvés pour votre entreprise.",
    "Trouvez des indépendants pour votre projet.",
    "Offres d’emploi et annonces professionnelles.",
    "Aperçu",
    "Dernière mise à jour"
  ],
  "es": [
    "Próximamente",
    "En desarrollo",
    "Completado",
    "Publicado",
    "Productos digitales aprobados para su empresa.",
    "Encuentre profesionales para su proyecto.",
    "Ofertas de empleo y anuncios profesionales.",
    "Vista previa",
    "Última actualización"
  ],
  "it": [
    "Prossimamente",
    "In sviluppo",
    "Completato",
    "Pubblicato",
    "Prodotti digitali approvati per la tua attività.",
    "Trova freelance per il tuo progetto.",
    "Opportunità di lavoro e annunci professionali.",
    "Anteprima",
    "Ultimo aggiornamento"
  ],
  "pt": [
    "Em breve",
    "Em desenvolvimento",
    "Concluído",
    "Publicado",
    "Produtos digitais aprovados para o seu negócio.",
    "Encontre freelancers para o seu projeto.",
    "Oportunidades de emprego e anúncios profissionais.",
    "Pré-visualização",
    "Última atualização"
  ],
  "pl": [
    "Wkrótce",
    "W rozwoju",
    "Ukończono",
    "Opublikowano",
    "Zatwierdzone produkty cyfrowe dla Twojej firmy.",
    "Znajdź freelancerów do swojego projektu.",
    "Oferty pracy i ogłoszenia zawodowe.",
    "Podgląd",
    "Ostatnia aktualizacja"
  ],
  "uk": [
    "Незабаром",
    "У розробці",
    "Завершено",
    "Опубліковано",
    "Схвалені цифрові продукти для вашого бізнесу.",
    "Знайдіть фрилансерів для свого проєкту.",
    "Вакансії та професійні оголошення.",
    "Перегляд",
    "Останнє оновлення"
  ],
  "ru": [
    "Скоро",
    "В разработке",
    "Завершено",
    "Опубликовано",
    "Одобренные цифровые продукты для вашего бизнеса.",
    "Найдите фрилансеров для своего проекта.",
    "Вакансии и профессиональные объявления.",
    "Просмотр",
    "Последнее обновление"
  ],
  "zh": [
    "即将推出",
    "开发中",
    "已完成",
    "已发布",
    "为您的企业提供经过审核的数字产品。",
    "为您的项目联系自由职业者。",
    "工作机会与专业招聘信息。",
    "预览",
    "最后更新"
  ],
  "ja": [
    "近日公開",
    "開発中",
    "完了",
    "公開済み",
    "ビジネス向けの承認済みデジタル製品。",
    "プロジェクトのフリーランサーを探す。",
    "求人とプロフェッショナル向け情報。",
    "プレビュー",
    "最終更新"
  ],
  "ko": [
    "출시 예정",
    "개발 중",
    "완료",
    "게시됨",
    "비즈니스를 위한 승인된 디지털 제품.",
    "프로젝트를 위한 프리랜서를 찾아보세요.",
    "채용 기회와 전문 공고.",
    "미리 보기",
    "마지막 업데이트"
  ]
};
const faqAnswers: Record<Locale, string[]> = {
  "ar": [
    "اختر الخدمة وحدد احتياجات مشروعك، ثم أرسل الطلب لمراجعة الفريق.",
    "يُعتمد عرض السعر حسب نطاق العمل قبل الدفع."
  ],
  "en": [
    "Choose a service, define your project needs and submit your request for team review.",
    "Your quote is approved against the agreed scope before payment."
  ],
  "nl": [
    "Kies een dienst, beschrijf uw project en stuur de aanvraag ter beoordeling.",
    "Uw offerte wordt op basis van de afgesproken omvang goedgekeurd vóór betaling."
  ],
  "de": [
    "Wählen Sie eine Leistung, beschreiben Sie Ihr Projekt und senden Sie die Anfrage zur Prüfung.",
    "Ihr Angebot wird anhand des vereinbarten Umfangs vor der Zahlung freigegeben."
  ],
  "tr": [
    "Bir hizmet seçin, proje ihtiyaçlarınızı belirleyin ve talebinizi incelemeye gönderin.",
    "Teklifiniz ödeme öncesinde kararlaştırılan kapsama göre onaylanır."
  ],
  "fr": [
    "Choisissez un service, définissez vos besoins et envoyez votre demande pour examen.",
    "Votre devis est approuvé selon le périmètre convenu avant paiement."
  ],
  "es": [
    "Elija un servicio, defina sus necesidades y envíe la solicitud para revisión.",
    "Su presupuesto se aprueba según el alcance acordado antes del pago."
  ],
  "it": [
    "Scegli un servizio, definisci le esigenze e invia la richiesta per la revisione.",
    "Il preventivo viene approvato in base all’ambito concordato prima del pagamento."
  ],
  "pt": [
    "Escolha um serviço, defina as necessidades e envie o pedido para análise.",
    "O orçamento é aprovado com base no âmbito acordado antes do pagamento."
  ],
  "pl": [
    "Wybierz usługę, określ potrzeby projektu i wyślij zgłoszenie do oceny.",
    "Wycena jest zatwierdzana na podstawie uzgodnionego zakresu przed płatnością."
  ],
  "uk": [
    "Виберіть послугу, визначте потреби проєкту та надішліть заявку на розгляд.",
    "Кошторис затверджується за погодженим обсягом до оплати."
  ],
  "ru": [
    "Выберите услугу, определите требования проекта и отправьте заявку на рассмотрение.",
    "Смета утверждается по согласованному объёму до оплаты."
  ],
  "zh": [
    "选择服务，定义项目需求并提交申请供团队审核。",
    "报价将在付款前根据约定范围获得批准。"
  ],
  "ja": [
    "サービスを選び、要件を定義してチームの確認のために依頼を送信します。",
    "支払い前に合意された範囲に基づいて見積もりを承認します。"
  ],
  "ko": [
    "서비스를 선택하고 프로젝트 요구사항을 정한 후 검토를 위해 요청하세요.",
    "결제 전에 합의된 범위에 따라 견적이 승인됩니다."
  ]
};
export function redesignCopy(locale: Locale) { const [comingSoon, inDevelopment, completed, published, productsIntro, freelanceIntro, jobsIntro, preview, updated] = rows[locale]; const [startAnswer, priceAnswer] = faqAnswers[locale]; return { startAnswer, priceAnswer, comingSoon, inDevelopment, completed, published, productsIntro, freelanceIntro, jobsIntro, preview, updated }; }
