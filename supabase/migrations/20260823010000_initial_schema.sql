-- ============================================================================
-- Wasla | وصلة — Initial Schema
-- Core architecture: auth.users → profiles → organizations → organization_members
-- Plus: creator/company profiles, categories, social accounts, bio pages/blocks,
-- event-based analytics foundation, and future marketplace tables (structure only).
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ─────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────
create type public.org_type as enum ('creator', 'company', 'agency');

create type public.member_role as enum (
  'owner',
  'company_manager',
  'marketing_manager',
  'employee',
  'admin'
);

create type public.verification_status_type as enum (
  'none',
  'pending',
  'approved',
  'rejected'
);

create type public.social_platform as enum (
  'instagram',
  'tiktok',
  'youtube',
  'facebook',
  'x',
  'website'
);

-- Offer item types: offers are composed of multiple items (cash + products +
-- commission + affiliate) instead of a single amount.
create type public.offer_item_type as enum (
  'cash',
  'product',
  'commission',
  'affiliate',
  'other'
);

create type public.offer_status as enum (
  'draft',
  'sent',
  'viewed',
  'negotiating',
  'accepted',
  'rejected',
  'expired',
  'withdrawn'
);

create type public.campaign_status as enum (
  'draft',
  'scheduled',
  'active',
  'paused',
  'completed',
  'cancelled'
);

create type public.application_status as enum (
  'pending',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn'
);

create type public.payment_status as enum (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded'
);

create type public.payout_status as enum (
  'pending',
  'processing',
  'paid',
  'failed'
);

create type public.request_status as enum ('pending', 'approved', 'rejected');

-- ─────────────────────────────────────────────────────────────
-- Shared helpers & triggers
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- profiles — one row per auth.users row (created by trigger below)
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  username citext not null unique,
  avatar_url text,
  bio text,
  phone text,
  language text not null default 'ar'
    check (language in ('ar', 'en')),
  timezone text default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Application-level user data. 1:1 with auth.users.';

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  attempts int := 0;
begin
  base := lower(
    regexp_replace(
      coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
      '[^a-zA-Z0-9_]+', '', 'g'
    )
  );
  if base is null or char_length(base) < 3 then
    base := 'user';
  elsif char_length(base) > 20 then
    base := left(base, 20);
  end if;

  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    attempts := attempts + 1;
    if attempts > 20 then
      candidate := base || substr(md5(random()::text), 1, 8);
      exit;
    end if;
    candidate := base || floor(random() * 100000)::int::text;
  end loop;

  insert into public.profiles (id, full_name, username, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    candidate,
    coalesce(new.raw_user_meta_data ->> 'language', 'ar')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- organizations — creators, companies and agencies are all orgs.
-- This keeps the door open for agencies & management companies.
-- ─────────────────────────────────────────────────────────────
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug citext not null unique,
  type public.org_type not null,
  logo_url text,
  description text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organizations_type_idx on public.organizations (type);
create index organizations_slug_idx on public.organizations (slug);

create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- organization_members — an organization can have many members,
-- a user can belong to many organizations.
-- ─────────────────────────────────────────────────────────────
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,
  user_id uuid not null
    references public.profiles (id) on delete cascade,
  role public.member_role not null default 'employee',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index organization_members_user_idx
  on public.organization_members (user_id);
create index organization_members_org_idx
  on public.organization_members (organization_id);

-- ─────────────────────────────────────────────────────────────
-- creator_profiles / company_profiles — type-specific extensions of an org
-- ─────────────────────────────────────────────────────────────
create table public.creator_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique
    references public.organizations (id) on delete cascade,
  display_name text not null,
  bio text,
  city text,
  gender text check (gender in ('male', 'female', 'other')),
  date_of_birth date,
  verified boolean not null default false,
  verification_status public.verification_status_type not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_creator_profiles_updated_at
  before update on public.creator_profiles
  for each row execute function public.set_updated_at();

create table public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique
    references public.organizations (id) on delete cascade,
  industry text,
  description text,
  website text,
  city text,
  verified boolean not null default false,
  verification_status public.verification_status_type not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_company_profiles_updated_at
  before update on public.company_profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- categories & creator_categories (many-to-many)
-- ─────────────────────────────────────────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  slug citext not null unique,
  icon text,
  created_at timestamptz not null default now()
);

create table public.creator_categories (
  creator_profile_id uuid not null
    references public.creator_profiles (id) on delete cascade,
  category_id uuid not null
    references public.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (creator_profile_id, category_id)
);

-- ─────────────────────────────────────────────────────────────
-- social_accounts — audience stats per platform, owned by the org
-- ─────────────────────────────────────────────────────────────
create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,
  platform public.social_platform not null,
  username text,
  url text not null,
  followers_count integer not null default 0
    check (followers_count >= 0),
  engagement_rate numeric(5, 2)
    check (engagement_rate >= 0 and engagement_rate <= 100),
  average_views bigint,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, platform)
);

create trigger set_social_accounts_updated_at
  before update on public.social_accounts
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- BIO PAGE SYSTEM
-- A bio page is intentionally decoupled from creator_profiles:
-- it lives at wasla.com/{slug} and belongs to the organization,
-- so companies/agencies could publish pages later too.
-- ─────────────────────────────────────────────────────────────
create table public.bio_pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique
    references public.organizations (id) on delete cascade,
  slug citext not null unique,
  title text not null,
  description text,
  avatar_url text,
  theme text not null default 'default',
  background text not null default 'aurora',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bio_pages_slug_format check (
    slug ~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{1,48}[a-zA-Z0-9]$'
  )
);

create trigger set_bio_pages_updated_at
  before update on public.bio_pages
  for each row execute function public.set_updated_at();

-- Block types are stored as free text validated at the application layer
-- (Zod registry), so new block kinds can ship without a migration.
create table public.bio_blocks (
  id uuid primary key default gen_random_uuid(),
  bio_page_id uuid not null
    references public.bio_pages (id) on delete cascade,
  type text not null,
  title text,
  content text,
  url text,
  image_url text,
  position integer not null default 0,
  visible boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bio_blocks_page_position_idx
  on public.bio_blocks (bio_page_id, position);

create trigger set_bio_blocks_updated_at
  before update on public.bio_blocks
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ANALYTICS FOUNDATION — event-based, append-only
-- Whitelisted events: bio_page_view, link_click, social_click,
-- affiliate_click, campaign_conversion.
-- ─────────────────────────────────────────────────────────────
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in (
      'bio_page_view',
      'link_click',
      'social_click',
      'affiliate_click',
      'campaign_conversion'
    )
  ),
  bio_page_id uuid references public.bio_pages (id) on delete cascade,
  bio_block_id uuid references public.bio_blocks (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  visitor_id text,
  referrer text,
  country text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_page_time_idx
  on public.analytics_events (bio_page_id, created_at desc);
create index analytics_events_org_time_idx
  on public.analytics_events (organization_id, created_at desc);
create index analytics_events_type_time_idx
  on public.analytics_events (event_type, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- FUTURE MARKETPLACE — structure only, features come in later phases.
-- RLS is enabled with deny-by-default (no policies yet).
-- ─────────────────────────────────────────────────────────────

-- Campaigns: brands create campaigns; creators apply.
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  budget numeric(14, 2),
  currency text not null default 'USD',
  status public.campaign_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

create table public.campaign_applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null
    references public.campaigns (id) on delete cascade,
  creator_organization_id uuid not null
    references public.organizations (id) on delete cascade,
  status public.application_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, creator_organization_id)
);

create trigger set_campaign_applications_updated_at
  before update on public.campaign_applications
  for each row execute function public.set_updated_at();

-- Offers are composed of items so a single offer can mix
-- cash + products + commission + affiliate.
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns (id) on delete set null,
  company_organization_id uuid not null
    references public.organizations (id) on delete cascade,
  creator_organization_id uuid not null
    references public.organizations (id) on delete cascade,
  title text,
  message text,
  currency text not null default 'USD',
  total_estimated_value numeric(14, 2),
  status public.offer_status not null default 'draft',
  expires_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index offers_creator_org_idx on public.offers (creator_organization_id);
create index offers_company_org_idx on public.offers (company_organization_id);

create trigger set_offers_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

create table public.offer_items (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers (id) on delete cascade,
  type public.offer_item_type not null,
  label text,
  amount numeric(14, 2) check (amount >= 0),
  percentage numeric(5, 2) check (percentage >= 0 and percentage <= 100),
  quantity integer default 1 check (quantity > 0),
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.offer_negotiations (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers (id) on delete cascade,
  by_user_id uuid references public.profiles (id) on delete set null,
  action text not null, -- e.g. message | counter | accept | reject
  message text,
  proposed_terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Affiliate system
create table public.affiliate_programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  commission_percentage numeric(5, 2),
  cookie_window_days integer default 30,
  status public.request_status not null default 'pending',
  terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_affiliate_programs_updated_at
  before update on public.affiliate_programs
  for each row execute function public.set_updated_at();

create table public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null
    references public.affiliate_programs (id) on delete cascade,
  creator_organization_id uuid not null
    references public.organizations (id) on delete cascade,
  code text not null unique,
  destination_url text not null,
  clicks_count bigint not null default 0,
  conversions_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_affiliate_links_updated_at
  before update on public.affiliate_links
  for each row execute function public.set_updated_at();

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,
  creator_organization_id uuid
    references public.organizations (id) on delete set null,
  code citext not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(14, 2) not null check (discount_value >= 0),
  usage_limit integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_link_id uuid not null
    references public.affiliate_links (id) on delete cascade,
  visitor_id text,
  referrer text,
  country text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_link_id uuid not null
    references public.affiliate_links (id) on delete cascade,
  click_id uuid references public.affiliate_clicks (id) on delete set null,
  order_reference text,
  order_amount numeric(14, 2),
  commission_amount numeric(14, 2),
  currency text not null default 'USD',
  status public.payment_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Money movement
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  reference text unique,
  type text not null, -- e.g. payment | payout | fee | refund
  amount numeric(14, 2) not null,
  currency text not null default 'USD',
  status public.payment_status not null default 'pending',
  from_organization_id uuid references public.organizations (id) on delete set null,
  to_organization_id uuid references public.organizations (id) on delete set null,
  offer_id uuid references public.offers (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references public.transactions (id) on delete cascade,
  payer_organization_id uuid
    references public.organizations (id) on delete set null,
  provider text, -- stripe | paypal | manual …
  provider_payment_id text,
  amount numeric(14, 2) not null,
  currency text not null default 'USD',
  status public.payment_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references public.transactions (id) on delete cascade,
  payee_organization_id uuid
    references public.organizations (id) on delete set null,
  method text, -- bank_transfer | wallet | …
  amount numeric(14, 2) not null,
  currency text not null default 'USD',
  status public.payout_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.platform_fees (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references public.transactions (id) on delete cascade,
  rate numeric(5, 2) not null,
  amount numeric(14, 2) not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

-- Reputation
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references public.offers (id) on delete set null,
  reviewer_organization_id uuid not null
    references public.organizations (id) on delete cascade,
  reviewed_organization_id uuid not null
    references public.organizations (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  content text,
  created_at timestamptz not null default now(),
  unique (offer_id, reviewer_organization_id)
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,
  average_rating numeric(3, 2) not null default 0,
  ratings_count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create trigger set_ratings_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();

-- Communication
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link_url text,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index notifications_user_idx
  on public.notifications (user_id, created_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_key text not null, -- lightweight threading (offer/negotiation scoped)
  sender_user_id uuid references public.profiles (id) on delete set null,
  sender_organization_id uuid references public.organizations (id) on delete set null,
  recipient_organization_id uuid references public.organizations (id) on delete set null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_thread_idx on public.messages (thread_key, created_at);

create table public.media_kits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique
    references public.organizations (id) on delete cascade,
  file_path text,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_media_kits_updated_at
  before update on public.media_kits
  for each row execute function public.set_updated_at();

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,
  submitted_by uuid references public.profiles (id) on delete set null,
  status public.request_status not null default 'pending',
  documents jsonb not null default '{}'::jsonb,
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Billing plans / subscriptions (SaaS monetization later)
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ar text not null,
  name_en text not null,
  price_monthly numeric(10, 2) not null default 0,
  price_yearly numeric(10, 2) not null default 0,
  currency text not null default 'USD',
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete cascade,
  plan_id uuid not null references public.plans (id) on delete restrict,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id)
);

-- Enable RLS everywhere immediately (policies in the next migration).
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.company_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.creator_categories enable row level security;
alter table public.social_accounts enable row level security;
alter table public.bio_pages enable row level security;
alter table public.bio_blocks enable row level security;
alter table public.analytics_events enable row level security;

alter table public.campaigns enable row level security;
alter table public.campaign_applications enable row level security;
alter table public.offers enable row level security;
alter table public.offer_items enable row level security;
alter table public.offer_negotiations enable row level security;
alter table public.affiliate_programs enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.discount_codes enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.transactions enable row level security;
alter table public.payments enable row level security;
alter table public.payouts enable row level security;
alter table public.platform_fees enable row level security;
alter table public.reviews enable row level security;
alter table public.ratings enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.media_kits enable row level security;
alter table public.verification_requests enable row level security;
alter table public.subscriptions enable row level security;
alter table public.plans enable row level security;

-- Marketplace tables stay deny-by-default until their feature phase ships.
