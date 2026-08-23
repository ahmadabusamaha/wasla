# وصلة | Wasla

> **رابطك. تأثيرك. فرصك.**
> Your Link. Your Influence. Your Opportunities.

منصة SaaS تربط صنّاع المحتوى والمشاهير بالشركات والعلامات التجارية — تبدأ من فلسطين ومبنية للتوسع عربيًا وإقليميًا.

---

## ما هي وصلة؟

- **صانع المحتوى** يحصل على صفحة عامة أنيقة على `wasla.com/username` تجمع روابطه، حساباته، عروضه، أكواد الخصم، وروابط الأفلييت.
- **الشركات** تنشئ حسابًا وتكتشف المشاهير وترسل عروض تعاون (مبلغ مالي، منتجات، عمولة، أفلييت، أو عرض هجين) وتدير حملاتها.
- العروض مبنية على `offer_items` متعددة الأنواع — لا مجرد `amount` واحد.

> 📌 **المرحلة الحالية:** Foundation + Auth + Database + Security + Design System + Landing Page + Demo Bio Page. السوق (Marketplace) والحملات والعروض قادمة في مراحل لاحقة.

---

## التقنيات

| الطبقة | التقنية |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| اللغة | TypeScript (strict) |
| التصميم | Tailwind CSS v4 + shadcn/ui (Radix) |
| Backend | Supabase — PostgreSQL + Auth + Storage + RLS |
| التحقق | Zod v4 + React Hook Form |
| i18n | عربي RTL (افتراضي) + إنجليزي LTR عبر كوكي وقاموس مركزي |

## البنية

```
app/                 # المسارات (App Router)
  [username]/        #   الصفحة العامة للصانع wasla.com/{username}
  api/analytics/     #   نقطة استقبال أحداث التحليلات
  auth/callback/     #   تبديل كود المصادقة (PKCE)
  dashboard/         #   لوحة التحكم
components/
  ui/                #   shadcn/ui primitives
  bio/ marketing/ dashboard/ auth/ layout/ shared/ providers/
features/            # منطق الأعمال لكل ميزة (queries + server actions)
lib/
  supabase/          #   client / server / session (proxy)
  i18n/              #   القواميس والإعدادات
schemas/             # مخططات Zod
types/               # أنواع Database
supabase/
  migrations/        # كل تغييرات قاعدة البيانات (SQL فقط)
  seed.sql           # بيانات Demo منفصلة عن الإنتاج
hooks/ utils/
proxy.ts             # حماية المسارات + تحديث الجلسة (Next 16 middleware)
```

## البدء السريع

### 1) المتطلبات
- Node.js 20+
- حساب [Supabase](https://supabase.com) مجاني

### 2) التثبيت

```bash
npm install
cp .env.example .env.local
```

### 3) ربط Supabase

1. أنشئ مشروعًا جديدًا على supabase.com.
2. انسخ `Project URL` و `anon public key` من Project Settings → API وضعها في `.env.local`.
3. نفّذ الـ migrations عبر إحدى طريقتين:
   - **SQL Editor** في لوحة Supabase: الصق محتوى الملفات داخل `supabase/migrations/` بالترتيب ثم `supabase/seed.sql`.
   - أو عبر CLI:
     ```bash
     npx supabase link --project-ref <your-project-ref>
     npx supabase db push
     npx supabase db execute -f supabase/seed.sql   # بيانات demo (اختياري)
     ```
4. (اختياري) فعّل تأكيد البريد الإلكتروني من Auth → Providers.

### 4) التشغيل

```bash
npm run dev
```

- الواجهة: http://localhost:3000
- صفحة Demo بعد Seed: http://localhost:3000/ahmad (أيضًا `layan`, `sara`, `kareem`)
- المصادقة: `/signup` → اختيار نوع الحساب (Creator/Company) → إنشاء المؤسسة تلقائيًا.

## الأمان

- **RLS مفعّل على كل الجداول** — السياسات هي مصدر الحماية الأساسي (`supabase/migrations/*_rls_policies.sql`):
  - شركة لا ترى بيانات شركة أخرى، وصانع لا يعدل غير صفحته.
  - أعضاء المؤسسة يصلون لمؤسستهم فقط عبر `has_org_role()`.
  - الصفحات العامة تُقرأ فقط عندما `published = true`.
- لا يوجد أي استخدام لـ `service_role` في الكود.
- Storage: Buckets عامة للصور (avatars/logos/images) وخاصة للمستندات، مع رفع مقصور على `{user_id}/...`.

## المخطط المستقبلي (جداول جاهزة، سياساتها تأتي مع مرحلتها)

`campaigns`, `campaign_applications`, `offers`, `offer_items`, `offer_negotiations`, `affiliate_programs`, `affiliate_links`, `discount_codes`, `affiliate_clicks`, `affiliate_conversions`, `transactions`, `payments`, `payouts`, `platform_fees`, `reviews`, `ratings`, `notifications`, `messages`, `media_kits`, `verification_requests`, `subscriptions`, `plans`

كل هذه الجداول RLS مفعّل عليها **deny-by-default** حتى تُبنى ميزاتها.

## الأوامر

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | خادم التطوير |
| `npm run build` | بناء الإنتاج |
| `npm run lint` | ESLint |
| `npm run db:push` | دفع migrations إلى المشروع المرتبط |

## النشر على Vercel

1. اربط الـ Repository على Vercel.
2. أضف المتغيرات: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.
3. Deploy — لا حاجة لأي backend إضافي.

## ربط GitHub (مرة واحدة)

```bash
git remote add origin git@github.com:<username>/wasla.git
git push -u origin main
```

أو باستخدام GitHub CLI:

```bash
gh repo create wasla --private --source=. --push
```

---

© وصلة | Wasla — جميع الحقوق محفوظة
