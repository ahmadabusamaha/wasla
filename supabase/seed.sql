-- ============================================================================
-- Wasla | وصلة — Demo / Seed data
-- 100% fictional demo data, separate from production.
-- Creators: أحمد، ليان، سارة، كريم — Companies: Brand A/B/C
-- Safe to run multiple times (idempotent).
-- ============================================================================

-- ── Categories ─────────────────────────────────────────────
insert into public.categories (id, name_ar, name_en, slug, icon) values
  ('10000000-0000-4000-8000-000000000001', 'تقنية', 'Tech', 'tech', 'cpu'),
  ('10000000-0000-4000-8000-000000000002', 'أزياء', 'Fashion', 'fashion', 'shirt'),
  ('10000000-0000-4000-8000-000000000003', 'جمال وعناية', 'Beauty', 'beauty', 'sparkles'),
  ('10000000-0000-4000-8000-000000000004', 'لياقة ورياضة', 'Fitness', 'fitness', 'dumbbell'),
  ('10000000-0000-4000-8000-000000000005', 'طعام ومطاعم', 'Food', 'food', 'utensils'),
  ('10000000-0000-4000-8000-000000000006', 'سفر', 'Travel', 'travel', 'plane'),
  ('10000000-0000-4000-8000-000000000007', 'تعليم', 'Education', 'education', 'graduation-cap'),
  ('10000000-0000-4000-8000-000000000008', 'ألعاب', 'Gaming', 'gaming', 'gamepad')
on conflict (id) do nothing;

-- ── Creator organizations ──────────────────────────────────
insert into public.organizations (id, name, slug, type) values
  ('20000000-0000-4000-8000-000000000001', 'أحمد', 'ahmad', 'creator'),
  ('20000000-0000-4000-8000-000000000002', 'ليان', 'layan', 'creator'),
  ('20000000-0000-4000-8000-000000000003', 'سارة', 'sara', 'creator'),
  ('20000000-0000-4000-8000-000000000004', 'كريم', 'kareem', 'creator')
on conflict (id) do nothing;

-- ── Company organizations ──────────────────────────────────
insert into public.organizations (id, name, slug, type, website) values
  ('30000000-0000-4000-8000-000000000001', 'Brand A', 'brand-a', 'company', 'https://example.com/brand-a'),
  ('30000000-0000-4000-8000-000000000002', 'Brand B', 'brand-b', 'company', 'https://example.com/brand-b'),
  ('30000000-0000-4000-8000-000000000003', 'Brand C', 'brand-c', 'company', 'https://example.com/brand-c')
on conflict (id) do nothing;

-- ── Creator profiles ───────────────────────────────────────
insert into public.creator_profiles (id, organization_id, display_name, bio, city) values
  ('21000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
   'أحمد', 'صانع محتوى تقني — أشارككم آخر الأخبار ومراجعات التقنية بأسلوب مبسّط.', 'غزة'),
  ('21000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002',
   'ليان', 'عالم الأزياء والستايل — إلهام يومي لإطلالاتك.', 'رام الله'),
  ('21000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003',
   'سارة', 'مدربة لياقة — تمارين منزلية ونصائح غذائية عملية.', 'القدس'),
  ('21000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000004',
   'كريم', 'رحلات ومغامرات — أستكشف أجمل الأماكن وأوثقها لكم.', 'بيت لحم')
on conflict (id) do nothing;

-- ── Company profiles ───────────────────────────────────────
insert into public.company_profiles (id, organization_id, industry, city) values
  ('31000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'تجارة إلكترونية', 'حيفا'),
  ('31000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', 'مستحضرات تجميل', 'عمّان'),
  ('31000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 'تطبيقات وتقنية', 'دبي')
on conflict (id) do nothing;

-- ── Creator categories ─────────────────────────────────────
insert into public.creator_categories (creator_profile_id, category_id) values
  ('21000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001'),
  ('21000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000007'),
  ('21000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002'),
  ('21000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003'),
  ('21000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004'),
  ('21000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006')
on conflict do nothing;

-- ── Social accounts ────────────────────────────────────────
insert into public.social_accounts (organization_id, platform, username, url, followers_count, engagement_rate, average_views) values
  ('20000000-0000-4000-8000-000000000001', 'youtube', '@ahmad-tech', 'https://youtube.com/@demo-ahmad', 145000, 6.20, 52000),
  ('20000000-0000-4000-8000-000000000001', 'instagram', 'ahmad.tech', 'https://instagram.com/demo-ahmad', 88000, 5.10, null),
  ('20000000-0000-4000-8000-000000000001', 'x', 'ahmad_tech', 'https://x.com/demo-ahmad', 34000, 3.40, null),
  ('20000000-0000-4000-8000-000000000002', 'instagram', 'layan.style', 'https://instagram.com/demo-layan', 210000, 7.30, null),
  ('20000000-0000-4000-8000-000000000002', 'tiktok', 'layan.style', 'https://tiktok.com/@demo-layan', 480000, 9.10, 180000),
  ('20000000-0000-4000-8000-000000000003', 'instagram', 'sara.fit', 'https://instagram.com/demo-sara', 120000, 6.80, null),
  ('20000000-0000-4000-8000-000000000003', 'youtube', '@sara-fit', 'https://youtube.com/@demo-sara', 65000, 5.90, 28000),
  ('20000000-0000-4000-8000-000000000004', 'instagram', 'kareem.travels', 'https://instagram.com/demo-kareem', 175000, 4.90, null),
  ('20000000-0000-4000-8000-000000000004', 'tiktok', 'kareem.travels', 'https://tiktok.com/@demo-kareem', 290000, 8.20, 140000)
on conflict (organization_id, platform) do nothing;

-- ── Bio pages (published) ──────────────────────────────────
insert into public.bio_pages (id, organization_id, slug, title, description, theme, background, published) values
  ('22000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
   'ahmad', 'أحمد', 'صانع محتوى تقني | مراجعات وأخبار التقنية', 'default', 'aurora', true),
  ('22000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002',
   'layan', 'ليان', 'أزياء وستايل | إلهامك اليومي', 'default', 'rose', true),
  ('22000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003',
   'sara', 'سارة', 'مدربة لياقة | تمارين وتغذية', 'default', 'ocean', true),
  ('22000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000004',
   'kareem', 'كريم', 'سفر ومغامرات | أجمل الأماكن حول العالم', 'default', 'sand', true)
on conflict (id) do nothing;

-- ── Bio blocks — أحمد ───────────────────────────────────────
insert into public.bio_blocks (id, bio_page_id, type, title, content, url, position, settings) values
  ('23000000-0000-4000-8000-000000000101', '22000000-0000-4000-8000-000000000001', 'heading', 'تابعني هنا', null, null, 10, '{}'),
  ('23000000-0000-4000-8000-000000000102', '22000000-0000-4000-8000-000000000001', 'social', 'يوتيوب', null, 'https://youtube.com/@demo-ahmad', 20, '{"platform":"youtube"}'),
  ('23000000-0000-4000-8000-000000000103', '22000000-0000-4000-8000-000000000001', 'social', 'إنستغرام', null, 'https://instagram.com/demo-ahmad', 21, '{"platform":"instagram"}'),
  ('23000000-0000-4000-8000-000000000104', '22000000-0000-4000-8000-000000000001', 'social', 'إكس', null, 'https://x.com/demo-ahmad', 22, '{"platform":"x"}'),
  ('23000000-0000-4000-8000-000000000105', '22000000-0000-4000-8000-000000000001', 'heading', 'روابط مهمة', null, null, 30, '{}'),
  ('23000000-0000-4000-8000-000000000106', '22000000-0000-4000-8000-000000000001', 'link', 'قناتي على يوتيوب', 'آخر الفيديوهات أسبوعيًا', 'https://youtube.com/@demo-ahmad', 40, '{}'),
  ('23000000-0000-4000-8000-000000000107', '22000000-0000-4000-8000-000000000001', 'link', 'نشرة التقنية البريدية', 'ملخص أسبوعي بأهم الأخبار', 'https://example.com/newsletter', 50, '{}')
on conflict (id) do nothing;

insert into public.bio_blocks (id, bio_page_id, type, title, content, url, image_url, position, settings) values
  ('23000000-0000-4000-8000-000000000108', '22000000-0000-4000-8000-000000000001', 'discount', 'خصم للمتابعين', 'استخدم الكود عند الشراء من المتجر', 'https://example.com/store', null, 60, '{"code":"AHMAD15","discountLabel":"15% خصم"}'),
  ('23000000-0000-4000-8000-000000000109', '22000000-0000-4000-8000-000000000001', 'affiliate', 'عدسي المفضل للتصوير', 'رابط تسويقي — أحصل على عمولة صغيرة دون تكلفة عليك', 'https://example.com/lens?ref=ahmad', null, 70, '{"badge":"Affiliate"}')
on conflict (id) do nothing;

-- ── Bio blocks — ليان ───────────────────────────────────────
insert into public.bio_blocks (id, bio_page_id, type, title, content, url, position, settings) values
  ('23000000-0000-4000-8000-000000000201', '22000000-0000-4000-8000-000000000002', 'social', 'تيك توك', null, 'https://tiktok.com/@demo-layan', 10, '{"platform":"tiktok"}'),
  ('23000000-0000-4000-8000-000000000202', '22000000-0000-4000-8000-000000000002', 'social', 'إنستغرام', null, 'https://instagram.com/demo-layan', 11, '{"platform":"instagram"}'),
  ('23000000-0000-4000-8000-000000000203', '22000000-0000-4000-8000-000000000002', 'link', 'احجزي استشارة ستايل', 'جلسة فردية عبر الفيديو', 'https://example.com/booking-layan', 20, '{}'),
  ('23000000-0000-4000-8000-000000000204', '22000000-0000-4000-8000-000000000002', 'link', 'قائمة مفضلاتي', 'كل ما أرتديه في الفيديوهات', 'https://example.com/layan-favorites', 30, '{}'),
  ('23000000-0000-4000-8000-000000000205', '22000000-0000-4000-8000-000000000002', 'text', 'للتعاون التجاري', null, null, 40, '{"content":"لطلبات الإعلانات والتعاون: collaborations@example.com"}')
on conflict (id) do nothing;

-- ── Bio blocks — سارة ───────────────────────────────────────
insert into public.bio_blocks (id, bio_page_id, type, title, content, url, position, settings) values
  ('23000000-0000-4000-8000-000000000301', '22000000-0000-4000-8000-000000000003', 'social', 'إنستغرام', null, 'https://instagram.com/demo-sara', 10, '{"platform":"instagram"}'),
  ('23000000-0000-4000-8000-000000000302', '22000000-0000-4000-8000-000000000003', 'social', 'يوتيوب', null, 'https://youtube.com/@demo-sara', 11, '{"platform":"youtube"}'),
  ('23000000-0000-4000-8000-000000000303', '22000000-0000-4000-8000-000000000003', 'link', 'برنامج التمارين المنزلية', '٤ أسابيع — بدون معدات', 'https://example.com/sara-program', 20, '{}'),
  ('23000000-0000-4000-8000-000000000304', '22000000-0000-4000-8000-000000000003', 'video', 'تمرين اليوم', null, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 30, '{}')
on conflict (id) do nothing;

-- ── Bio blocks — كريم ───────────────────────────────────────
insert into public.bio_blocks (id, bio_page_id, type, title, content, url, position, settings) values
  ('23000000-0000-4000-8000-000000000401', '22000000-0000-4000-8000-000000000004', 'social', 'تيك توك', null, 'https://tiktok.com/@demo-kareem', 10, '{"platform":"tiktok"}'),
  ('23000000-0000-4000-8000-000000000402', '22000000-0000-4000-8000-000000000004', 'social', 'إنستغرام', null, 'https://instagram.com/demo-kareem', 11, '{"platform":"instagram"}'),
  ('23000000-0000-4000-8000-000000000403', '22000000-0000-4000-8000-000000000004', 'link', 'دليل السفر الاقتصادي', 'PDF مجاني — ٤٠ صفحة', 'https://example.com/kareem-guide', 20, '{}'),
  ('23000000-0000-4000-8000-000000000404', '22000000-0000-4000-8000-000000000004', 'discount', 'خصم حجوزات الفنادق', 'شركاء الرحلة', 'https://example.com/hotels', 30, '{"code":"KAREEM10","discountLabel":"10% خصم"}')
on conflict (id) do nothing;
