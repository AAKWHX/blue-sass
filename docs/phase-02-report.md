# تقرير المرحلة 02 — Blue Sass

تنفيذ محلي فقط. لم تُشغّل ترحيلات أو إعداد PayPal أو نشر. تغييرات AGENTS.md والنسخ الاحتياطية سابقة للعمل وبقيت دون تعديل.

## الملفات والمسارات وسبب كل تغيير

| الملف | التعديل |
|---|---|
| [next.config.mjs](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/next.config.mjs>) | تحويلات 308 لأسماء الخدمات القديمة قبل التصيير، مع الحفاظ على webpack/turbopack alias وdistDir. |
| [DEPLOYMENT.md](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/DEPLOYMENT.md>) | توثيق مسار الإصدار الجديد والنتائج والحدود والملفات المتغيرة. |
| [app/[locale]/about/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/about/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/admin/layout.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/admin/layout.tsx>) | إضافة noindex لمسارات الحساب أو الإدارة أو النموذج الحساس؛ لا تغيير في المصادقة أو الوصول. |
| [app/[locale]/contact/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/contact/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/create-project/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/create-project/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/hosting/layout.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/hosting/layout.tsx>) | إضافة noindex لمسارات الحساب أو الإدارة أو النموذج الحساس؛ لا تغيير في المصادقة أو الوصول. |
| [app/[locale]/hosting/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/hosting/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/layout.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/layout.tsx>) | إزالة canonical الرئيسية الموروث وترجمة metadata العامة حسب اللغة، مع الحفاظ على HTML/RTL. |
| [app/[locale]/login/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/login/page.tsx>) | إضافة noindex لمسارات الحساب أو الإدارة أو النموذج الحساس؛ لا تغيير في المصادقة أو الوصول. |
| [app/[locale]/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/portal/layout.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/portal/layout.tsx>) | إضافة noindex لمسارات الحساب أو الإدارة أو النموذج الحساس؛ لا تغيير في المصادقة أو الوصول. |
| [app/[locale]/pricing/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/pricing/page.tsx>) | الحفاظ على التحويل الحالي إلى قسم الخدمات، وتوجيه canonical إلى الصفحة الوجهة. |
| [app/[locale]/privacy/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/privacy/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/projects/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/projects/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/quote/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/quote/page.tsx>) | إضافة noindex لمسارات الحساب أو الإدارة أو النموذج الحساس؛ لا تغيير في المصادقة أو الوصول. |
| [app/[locale]/register/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/register/page.tsx>) | إضافة noindex لمسارات الحساب أو الإدارة أو النموذج الحساس؛ لا تغيير في المصادقة أو الوصول. |
| [app/[locale]/reviews/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/reviews/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/services/[service]/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/services/[service]/page.tsx>) | توليد عنوان ووصف الخدمة بلغة المسار بدل العربية الثابتة، مع السياسة الموحدة. |
| [app/[locale]/services/apps/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/services/apps/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/services/company/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/services/company/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/services/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/services/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/services/systems/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/services/systems/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/subscriptions/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/subscriptions/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/templates/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/templates/page.tsx>) | الحفاظ على التحويل الحالي إلى قسم الخدمات، وتوجيه canonical إلى الصفحة الوجهة. |
| [app/[locale]/terms/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/terms/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/tools/[tool]/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/tools/[tool]/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/tools/message-checker/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/tools/message-checker/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/tools/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/tools/page.tsx>) | توليد metadata مناسبة للصفحة وللغة المسار دون تغيير JSX أو الوظائف الحالية. |
| [app/[locale]/verify/page.tsx](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/[locale]/verify/page.tsx>) | إضافة noindex لمسارات الحساب أو الإدارة أو النموذج الحساس؛ لا تغيير في المصادقة أو الوصول. |
| [app/fonts/ibm-plex-sans-arabic.css](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/fonts/ibm-plex-sans-arabic.css>) | تعريف الأوزان 400–700 وأجزاء الحروف ومقاييس fallback مع تحميل محلي وswap. |
| [app/sitemap.ts](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/app/sitemap.ts>) | تغطية 540 عنوانًا فريدًا مع بدائل اللغات وحذف lastModified المصطنع. |
| [docs/phase-02-foundation.md](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/docs/phase-02-foundation.md>) | توثيق مسار الإصدار الجديد والنتائج والحدود والملفات المتغيرة. |
| [docs/phase-02-report.md](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/docs/phase-02-report.md>) | توثيق مسار الإصدار الجديد والنتائج والحدود والملفات المتغيرة. |
| [lib/fonts.ts](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/lib/fonts.ts>) | إلغاء next/font/google واستخدام الخط العربي المحلي نفسه؛ Geist دون تغيير. |
| [lib/i18n/seo.ts](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/lib/i18n/seo.ts>) | نصوص metadata مترجمة صراحة لكل اللغات الخمس عشرة. |
| [lib/marketplace-metadata.ts](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/lib/marketplace-metadata.ts>) | توحيد metadata الوظائف والمنتجات والسوق مع سياسة x-default. |
| [lib/page-metadata.ts](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/lib/page-metadata.ts>) | مصدر موحد لـcanonical وhreflang وx-default والبيانات الاجتماعية. |
| [lib/seo-public-paths.ts](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/lib/seo-public-paths.ts>) | تعريف المسارات العامة القانونية دون تحويلات أو صفحات خاصة. |
| [package.json](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/package.json>) | فصل الترحيلات وPayPal وفحص AI عن دورة البناء؛ إبقاء prebuild اختبارًا محليًا. |
| [public/fonts/ibm-plex-sans-arabic/280fac012b00b901-s.3ihiqn4pviisd.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/280fac012b00b901-s.3ihiqn4pviisd.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/3347fc7792f0b5ea-s.0c7ha31nuacbu.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/3347fc7792f0b5ea-s.0c7ha31nuacbu.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/441492499fc86682-s.1fbvi_fot8u4l.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/441492499fc86682-s.1fbvi_fot8u4l.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/5a1ede1938590d51-s.19gzon4xl8qiz.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/5a1ede1938590d51-s.19gzon4xl8qiz.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/5ad8fdb5805e9b4a-s.0-uv4l43gdmt7.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/5ad8fdb5805e9b4a-s.0-uv4l43gdmt7.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/5d6231e6818a3930-s.2vs72h_x6qrve.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/5d6231e6818a3930-s.2vs72h_x6qrve.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/65b08f011bd29e21-s.00vfn3_g-ftpg.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/65b08f011bd29e21-s.00vfn3_g-ftpg.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/84cd8d504984ae62-s.0iritm8hg8q1a.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/84cd8d504984ae62-s.0iritm8hg8q1a.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/OFL.txt](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/OFL.txt>) | حفظ ترخيص SIL OFL 1.1 الرسمي وحقوق IBM. |
| [public/fonts/ibm-plex-sans-arabic/a1b65e215f8df202-s.3w3hylgez90of.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/a1b65e215f8df202-s.3w3hylgez90of.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/aa914dbbd9a27e94-s.0n4hkusom70ae.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/aa914dbbd9a27e94-s.0n4hkusom70ae.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/b140408e2d7eae5d-s.2x1j3gzzngp4x.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/b140408e2d7eae5d-s.2x1j3gzzngp4x.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/b3f2ed44161db83e-s.3c64at4xi6rda.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/b3f2ed44161db83e-s.3c64at4xi6rda.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/bb8a9270184a3556-s.0phk7_etl12r4.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/bb8a9270184a3556-s.0phk7_etl12r4.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/c9a0d344f313d307-s.3ik2qu-u9tgho.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/c9a0d344f313d307-s.3ik2qu-u9tgho.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/ceec3e50f42c26e3-s.0da8nscnv1nkd.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/ceec3e50f42c26e3-s.0da8nscnv1nkd.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/d3af3242084a193c-s.1jr_z050he_qo.woff2](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/d3af3242084a193c-s.1jr_z050he_qo.woff2>) | نسخ الأصل المحلي دون تعديل، مع الحفاظ على العائلة والوزن وجزء الحروف. |
| [public/fonts/ibm-plex-sans-arabic/provenance.json](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/public/fonts/ibm-plex-sans-arabic/provenance.json>) | توثيق مصدر كل ملف خط وحجمه وبصمة SHA-256. |
| [scripts/configure-paypal-webhook.mjs](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/scripts/configure-paypal-webhook.mjs>) | تحديث التعليق ليوضح أن الإعداد أمر صريح مستقل عن البناء؛ المنطق دون تغيير. |
| [scripts/seo-foundation.test.mjs](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/scripts/seo-foundation.test.mjs>) | اختبارات sitemap واللغة وcanonical ومسار البناء وهوية الخطوط وبصماتها. |
| [scripts/verify-seo-html.mjs](<C:/Users/AAK Khalid/Desktop/Blue-sass/Blue-sass/scripts/verify-seo-html.mjs>) | فحص قراءة فقط على خادم loopback للـHTML والتحويلات وsitemap والأدوات والخطوط. |

انظر [تفاصيل السياسات ومسار الإصدار](phase-02-foundation.md).
