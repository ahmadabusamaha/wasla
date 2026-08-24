-- ============================================================================
-- Wasla | وصلة — Creator Store + Wallet + Payouts + Campaign Posts + Fans
-- ============================================================================

-- ── Store products ──────────────────────────────────────────
create table public.store_products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  type text not null check (type in ('digital_download','course','coaching_call','membership','payment_link')),
  title text not null check (char_length(title) between 2 and 120),
  description text,
  thumbnail_url text,
  price numeric(10,2) not null check (price >= 0),
  currency text not null default 'USD' check (currency in ('USD','ILS','JOD')),
  compare_at_price numeric(10,2),
  digital_file_url text,
  call_duration_minutes int,
  payment_link_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  sales_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index store_products_org_idx on public.store_products (organization_id, sort_order);

create trigger set_store_products_updated_at
  before update on public.store_products
  for each row execute function public.set_updated_at();

-- ── Store orders (buyers are fans — no account needed) ──────
create table public.store_orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending','paid','fulfilled','cancelled','refunded')),
  payment_reference text,
  notes text,
  created_at timestamptz not null default now()
);

create index store_orders_org_idx on public.store_orders (organization_id, created_at desc);

-- ── Wallet transactions ─────────────────────────────────────
create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  type text not null check (type in
    ('sale','platform_fee','offer_payment','payout','refund','affiliate_commission','adjustment')),
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','cleared','paid_out','cancelled')),
  description text,
  reference_type text,
  reference_id uuid,
  available_at timestamptz,
  created_at timestamptz not null default now()
);

create index wallet_org_idx on public.wallet_transactions (organization_id, created_at desc);

-- ── Payout requests ─────────────────────────────────────────
create table public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'USD',
  method text not null default 'bank_transfer'
    check (method in ('bank_transfer','wallet','cash_pickup')),
  account_details text not null,
  status text not null default 'requested'
    check (status in ('requested','processing','paid','rejected')),
  admin_notes text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── Campaign posts (performance tracking) ───────────────────
create table public.campaign_posts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  creator_organization_id uuid not null references public.organizations (id) on delete cascade,
  platform text not null check (platform in ('tiktok','instagram','youtube','facebook','x')),
  post_url text not null,
  views bigint not null default 0 check (views >= 0),
  likes bigint not null default 0 check (likes >= 0),
  comments bigint not null default 0 check (comments >= 0),
  shares bigint not null default 0 check (shares >= 0),
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, creator_organization_id, post_url)
);

create trigger set_campaign_posts_updated_at
  before update on public.campaign_posts
  for each row execute function public.set_updated_at();

-- ── Fan contacts (email capture) ────────────────────────────
create table public.fan_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  name text,
  source text,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

-- ── Notifications RLS (table exists) ────────────────────────
alter table public.notifications
  add constraint notifications_type_check check (type in
    ('offer_received','offer_accepted','offer_rejected','offer_withdrawn',
     'campaign_invite','application_update','new_sale','payout_processed',
     'verification_update','general'));

-- ═════════════════════════════════════════════════════════════
-- RLS
-- ═════════════════════════════════════════════════════════════
alter table public.store_products enable row level security;
alter table public.store_orders enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.payout_requests enable row level security;
alter table public.campaign_posts enable row level security;
alter table public.fan_contacts enable row level security;

-- Store products: public reads ACTIVE, org manages all
create policy "store_products_public_read_active"
  on public.store_products for select
  using (is_active = true or public.has_org_role(organization_id));

create policy "store_products_org_write"
  on public.store_products for insert
  to authenticated
  with check (public.has_org_role(organization_id));

create policy "store_products_org_update"
  on public.store_products for update
  using (public.has_org_role(organization_id))
  with check (public.has_org_role(organization_id));

create policy "store_products_org_delete"
  on public.store_products for delete
  using (public.has_org_role(organization_id));

-- Store orders: anyone can place; org sees own; admin sees all
create policy "store_orders_public_insert"
  on public.store_orders for insert
  to anon, authenticated
  with check (true);

create policy "store_orders_org_read"
  on public.store_orders for select
  to authenticated
  using (public.has_org_role(organization_id) or public.is_platform_admin());

create policy "store_orders_org_update"
  on public.store_orders for update
  to authenticated
  using (public.has_org_role(organization_id))
  with check (public.has_org_role(organization_id));

-- Wallet: org members only
create policy "wallet_org_all"
  on public.wallet_transactions for all
  to authenticated
  using (public.has_org_role(organization_id) or public.is_platform_admin())
  with check (public.has_org_role(organization_id) or public.is_platform_admin());

-- Payouts: org creates/reads own; admin manages all
create policy "payouts_org_insert"
  on public.payout_requests for insert
  to authenticated
  with check (public.has_org_role(organization_id));

create policy "payouts_org_read"
  on public.payout_requests for select
  to authenticated
  using (public.has_org_role(organization_id) or public.is_platform_admin());

create policy "payouts_admin_update"
  on public.payout_requests for update
  to authenticated
  using (public.is_platform_admin() or public.has_org_role(organization_id))
  with check (public.is_platform_admin() or public.has_org_role(organization_id));

-- Campaign posts: party access
create policy "campaign_posts_select_party"
  on public.campaign_posts for select
  to authenticated
  using (
    public.has_org_role(creator_organization_id)
    or exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and public.has_org_role(c.organization_id)
    )
    or public.is_platform_admin()
  );

create policy "campaign_posts_creator_insert"
  on public.campaign_posts for insert
  to authenticated
  with check (public.has_org_role(creator_organization_id));

create policy "campaign_posts_creator_update"
  on public.campaign_posts for update
  to authenticated
  using (
    public.has_org_role(creator_organization_id)
    or exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and public.has_org_role(c.organization_id)
    )
  )
  with check (
    public.has_org_role(creator_organization_id)
    or exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and public.has_org_role(c.organization_id)
    )
  );

create policy "campaign_posts_creator_delete"
  on public.campaign_posts for delete
  to authenticated
  using (public.has_org_role(creator_organization_id));

-- Fan contacts: public submits, org reads
create policy "fan_contacts_public_insert"
  on public.fan_contacts for insert
  to anon, authenticated
  with check (true);

create policy "fan_contacts_org_read"
  on public.fan_contacts for select
  to authenticated
  using (public.has_org_role(organization_id));

create policy "fan_contacts_org_delete"
  on public.fan_contacts for delete
  using (public.has_org_role(organization_id));

-- Notifications: user reads/updates own; authenticated may create (v1)
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_insert_authenticated"
  on public.notifications for insert
  to authenticated
  with check (true);

create policy "notifications_admin_all"
  on public.notifications for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
