-- ============================================================================
-- Wasla | وصلة — Demo Accounts
-- Creates demo users for Admin, Creator, and Company
-- ============================================================================

-- Demo passwords are all "demo1234" (hashed with bcrypt: $2b$10$H/nuLX6LTzwC54qBVJXbaeIR0zi5XaQu51t1yUOlGtmvfuaO6vunK)

-- Ensure demo organizations exist
INSERT INTO public.organizations (id, name, slug, type, website) VALUES
  ('20000000-0000-4000-8000-000000000001', 'أحمد التجريبي', 'demo-ahmad-1787492445', 'creator', 'https://wasla.app/demo-ahmad'),
  ('30000000-0000-4000-8000-000000000001', 'Villa Store', 'villa-store-demo', 'company', 'https://villastore.example.com')
ON CONFLICT (id) DO NOTHING;

-- Admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'admin@wasla.app',
  '$2b$10$H/nuLX6LTzwC54qBVJXbaeIR0zi5XaQu51t1yUOlGtmvfuaO6vunK',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "مدير المنصة", "language": "ar"}',
  true,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Creator demo user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-4000-8000-000000000002',
  'authenticated',
  'authenticated',
  'creator@wasla.app',
  '$2b$10$H/nuLX6LTzwC54qBVJXbaeIR0zi5XaQu51t1yUOlGtmvfuaO6vunK',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "أحمد التجريبي", "language": "ar"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Company demo user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-4000-8000-000000000003',
  'authenticated',
  'authenticated',
  'company@wasla.app',
  '$2b$10$H/nuLX6LTzwC54qBVJXbaeIR0zi5XaQu51t1yUOlGtmvfuaO6vunK',
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "شركة Villa Store", "language": "ar"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Update profiles with is_admin flag
UPDATE profiles SET is_admin = true WHERE id = 'd0000000-0000-4000-8000-000000000001';

-- Creator demo profile
INSERT INTO public.creator_profiles (
  id,
  organization_id,
  display_name,
  bio,
  city,
  verified
) VALUES (
  'd1000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000001',
  'أحمد التجريبي',
  'صانع محتوى تقني — أشارككم آخر الأخبار ومراجعات التقنية بأسلوب مبسّط.',
  'غزة',
  true
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  city = EXCLUDED.city,
  verified = EXCLUDED.verified;

-- Company demo profile
INSERT INTO public.company_profiles (
  id,
  organization_id,
  industry,
  description,
  website,
  city,
  verified
) VALUES (
  'd1000000-0000-4000-8000-000000000003',
  '30000000-0000-4000-8000-000000000001',
  'تجارة إلكترونية',
  'شركة رائدة في التجارة الإلكترونية',
  'https://villastore.example.com',
  'رام الله',
  true
) ON CONFLICT (id) DO UPDATE SET
  industry = EXCLUDED.industry,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  city = EXCLUDED.city,
  verified = EXCLUDED.verified;

-- Ensure creator organization has a published bio page
INSERT INTO bio_pages (id, organization_id, slug, title, description, theme, background, published)
VALUES (
  'e0000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'demo-ahmad-1787492445',
  'أحمد التجريبي',
  'صانع محتوى تقني | مراجعات وأخبار التقنية',
  'default',
  'aurora',
  true
) ON CONFLICT (id) DO UPDATE SET
  published = EXCLUDED.published;

