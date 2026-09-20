# نشر منصة AWWA على Vercel + Neon

دليل خطوة بخطوة. الوقت المتوقّع: ١٥ دقيقة.

---

## ١. أنشئ قاعدة بيانات Neon

1. اذهب إلى <https://console.neon.tech> وسجّل الدخول (مجاني).
2. **Create project** → اختر المنطقة **AWS eu-central-1 (Frankfurt)** لأنها الأقرب لأمستردام.
3. بعد الإنشاء ستظهر لك نافذة **Connection string**.
   - اختر **Pooled connection** (مهم — Vercel serverless يحتاجها).
   - انسخ النص، يبدو هكذا:
     ```
     postgresql://neondb_owner:XXXX@ep-cool-name-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
     ```

---

## ٢. جهّز المشروع محليًا

```bash
git clone https://github.com/omaramen354-dev/xowaak.git
cd xowaak
git checkout arena/01a071a0-xowaak
npm install
cp .env.example .env.local
```

افتح `.env.local` واملأه:

```env
DATABASE_URL=<الصق نص الاتصال من Neon>
AUTH_SECRET=<انظر الخطوة التالية>
AUTH_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@aakwhx.com
SEED_ADMIN_PASSWORD=<كلمة مرور قوية من اختيارك>
```

توليد `AUTH_SECRET`:

```bash
npx auth secret
# أو:  openssl rand -base64 32
```

---

## ٣. أنشئ الجداول وعبّئها

```bash
npm run db:push    # ينشئ كل الجداول والأنواع في Neon
npm run db:seed    # يضيف حساب المدير + فريق العمل + ٣ مشاريع تجريبية
```

سيطبع لك السكربت في النهاية بيانات الدخول:

```
admin   admin@aakwhx.com / <كلمة المرور التي وضعتها>
client  nadia@meridian-health.com / ClientDemo!2026
```

جرّبه محليًا:

```bash
npm run dev
```

افتح <http://localhost:3000/ar> ثم **إنشاء حساب** — سترى الحساب فورًا في جدول `users` داخل Neon.

---

## ٤. انشر على Vercel

### الطريقة الأولى — من الموقع (الأسهل)

1. <https://vercel.com/new>
2. **Import Git Repository** → اختر `omaramen354-dev/xowaak`.
3. في **Root Directory** اتركه `./`.
4. افتح **Environment Variables** وأضف:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | نص الاتصال المجمّع من Neon |
   | `AUTH_SECRET` | نفس القيمة التي ولّدتها |

   > **لا تضف `AUTH_URL`** — Vercel يضبطها تلقائيًا.

5. **Deploy**.

⚠️ Vercel ينشر الفرع الافتراضي `main` تلقائيًا، وهو فارغ حاليًا. إمّا:
- **Settings → Git → Production Branch** غيّرها إلى `arena/01a071a0-xowaak`، أو
- ادمج الفرع في `main` أولًا.

### الطريقة الثانية — من الطرفية

```bash
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
vercel --prod
```

---

## ٥. تكامل Neon مع Vercel (اختياري لكنه مفيد)

في Vercel: **Integrations → Neon → Add Integration**.
يربط `DATABASE_URL` تلقائيًا وينشئ فرع قاعدة بيانات منفصل لكل Preview Deployment، فتجرّب التغييرات دون المساس ببيانات الإنتاج.

---

## ما الذي يحدث عند تسجيل العميل؟

1. العميل يفتح `/ar/register` ويملأ النموذج.
2. `registerAction` يتحقّق من البيانات بـ Zod، يشفّر كلمة المرور بـ bcrypt (12 جولة)، ويضيف صفًا في `users` بدور `client`.
3. إن كان قد أرسل طلب عرض سعر سابقًا بنفس البريد، يُربط سجل `leads` بحسابه الجديد وتتحوّل حالته إلى `qualified`.
4. يُنشأ له session ويُحوَّل مباشرة إلى `/ar/portal`.
5. في اللوحة يرى: **نسبة الإنجاز**، **الوقت التقديري المتبقّي بالساعات**، **الأيام حتى الموعد النهائي**، **المراحل الخمس**، و**التسليمات** (صور وفيديوهات وروابط ديمو حيّة) — كلها من قاعدة البيانات.

## ما الذي يحدث عند إرسال طلب عرض سعر؟

نموذج `/quote` يرسل مخرجات الحاسبة (النوع، الوحدات، الميزانية التقديرية، المدة) مع بيانات التواصل إلى جدول `leads`، وتظهر فورًا في **Quote requests** أعلى صفحة `/admin` مع أزرار لتحريكها في مسار المبيعات.

---

## الأوامر المرجعية

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | خادم التطوير |
| `npm run build` | بناء الإنتاج |
| `npm run db:push` | مزامنة المخطط مع Neon |
| `npm run db:generate` | توليد ملف SQL للهجرة |
| `npm run db:studio` | متصفّح رسومي لقاعدة البيانات |
| `npm run db:seed` | تعبئة البيانات التجريبية |
| `npm run typecheck` | فحص TypeScript |
| `npm run lint` | فحص ESLint |

---

## الأمان

- كلمات المرور مشفّرة بـ **bcrypt** بـ 12 جولة؛ لا تُخزَّن أبدًا كنص صريح.
- الجلسات **JWT** موقّعة بـ `AUTH_SECRET`.
- بما أنّ Neon لا توفّر RLS مرتبطة بالجلسة، فإنّ التحقق من الصلاحيات يتم في `lib/db/access.ts` وتفرضه كل server action:
  - `visibleProjectsFilter` — العميل لا يرى إلا مشاريعه، والزائر لا يرى إلا العام.
  - `assertCanEditProject` — التعديل للمدراء أو الموظف المُسنَد للمشروع فقط.
  - `requireRole` — يحمي إجراءات الأدمن.
- الملفات المُعلَّمة `visibleToClient = false` لا تُرسَل إطلاقًا إلى العميل (تُستبعَد في الاستعلام نفسه، لا في الواجهة).
- **لا تضع `.env.local` في Git** — مُستثنى بالفعل في `.gitignore`.
