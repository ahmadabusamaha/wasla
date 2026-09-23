-- ============================================================================
-- Wasla | وصلة — Booking Calendar + Referrals + Multi-lang Bio + Reminders
-- ============================================================================

-- ── Booking slots ────────────────────────────────────────────
create table public.booking_slots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'open' check (status in ('open','booked','cancelled')),
  order_id uuid references public.store_orders (id) on delete set null,
  buyer_name text,
  buyer_email text,
  meeting_link text,
  created_at timestamptz not null default now(),
  unique (product_id, starts_at)
);

create index booking_slots_product_idx on public.booking_slots (product_id, starts_at);
create index booking_slots_org_idx on public.booking_slots (organization_id, starts_at);

-- ── Referral system ─────────────────────────────────────────
alter table public.profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;

-- Auto-generate referral codes
update public.profiles set referral_code = substr(md5(random()::text), 1, 8)
where referral_code is null;

alter table public.profiles
  add constraint profiles_referral_code_len check (char_length(referral_code) >= 6);

-- Referral rewards (wallet credit on signup via referral)
create table public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_org_id uuid references public.organizations (id) on delete cascade,
  referred_user_id uuid references public.profiles (id) on delete cascade,
  reward_amount numeric(10,2) not null default 5.00,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','credited')),
  created_at timestamptz not null default now()
);

-- ── Multi-language bio translations ─────────────────────────
alter table public.bio_pages
  add column if not exists translations jsonb not null default '{}'::jsonb;

-- ── Content deliverables (approval workflow) ─────────────────
create table public.content_deliverables (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers (id) on delete cascade,
  campaign_post_id uuid references public.campaign_posts (id) on delete set null,
  creator_organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  content_url text,
  description text,
  status text not null default 'submitted'
    check (status in ('submitted','approved','revision_requested','rejected','published')),
  feedback text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null
);

-- ═════════════════════════════════════════════════════════════
-- RLS
-- ═════════════════════════════════════════════════════════════
alter table public.booking_slots enable row level security;
alter table public.referral_rewards enable row level security;
alter table public.content_deliverables enable row level security;

-- Booking slots: org manages; public reads open slots
create policy "booking_slots_public_read_open"
  on public.booking_slots for select
  using (status = 'open' or public.has_org_role(organization_id));

create policy "booking_slots_org_write"
  on public.booking_slots for insert
  to authenticated
  with check (public.has_org_role(organization_id));

create policy "booking_slots_org_update"
  on public.booking_slots for update
  using (public.has_org_role(organization_id))
  with check (public.has_org_role(organization_id));

create policy "booking_slots_org_delete"
  on public.booking_slots for delete
  using (public.has_org_role(organization_id));

-- Public books a slot (update to booked by anon/authenticated)
create policy "booking_slots_public_book"
  on public.booking_slots for update
  to anon, authenticated
  using (status = 'open')
  with check (status = 'booked');

-- Referral rewards: org sees own
create policy "referral_rewards_org_read"
  on public.referral_rewards for select
  to authenticated
  using (public.has_org_role(referrer_org_id));

-- Content deliverables: party access
create policy "deliverables_select_party"
  on public.content_deliverables for select
  to authenticated
  using (
    public.has_org_role(creator_organization_id)
    or exists (
      select 1 from public.offers o
      where o.id = offer_id and public.has_org_role(o.company_organization_id)
    )
    or public.is_platform_admin()
  );

create policy "deliverables_creator_insert"
  on public.content_deliverables for insert
  to authenticated
  with check (public.has_org_role(creator_organization_id));

create policy "deliverables_party_update"
  on public.content_deliverables for update
  to authenticated
  using (
    public.has_org_role(creator_organization_id)
    or exists (
      select 1 from public.offers o
      where o.id = offer_id and public.has_org_role(o.company_organization_id)
    )
  )
  with check (
    public.has_org_role(creator_organization_id)
    or exists (
      select 1 from public.offers o
      where o.id = offer_id and public.has_org_role(o.company_organization_id)
    )
  );
