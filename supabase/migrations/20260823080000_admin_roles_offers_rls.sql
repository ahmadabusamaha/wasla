-- ============================================================================
-- Wasla | وصلة — Platform Admin role + Creator discovery + Offers RLS
-- Admin is a PLATFORM-LEVEL role on profiles (is_admin) — NOT an org type.
-- ============================================================================

-- ── Platform admin flag ─────────────────────────────────────
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke execute on function public.is_platform_admin() from anon;
grant execute on function public.is_platform_admin() to authenticated;

-- ── Admin read access across the platform ───────────────────
create policy "profiles_admin_read"
  on public.profiles for select
  to authenticated
  using (public.is_platform_admin());

create policy "organizations_admin_read"
  on public.organizations for select
  to authenticated
  using (public.is_platform_admin());

create policy "bio_pages_admin_read"
  on public.bio_pages for select
  to authenticated
  using (public.is_platform_admin());

create policy "bio_blocks_admin_read"
  on public.bio_blocks for select
  to authenticated
  using (
    exists (
      select 1 from public.bio_pages p
      where p.id = bio_page_id and public.is_platform_admin()
    )
  );

create policy "analytics_events_admin_read"
  on public.analytics_events for select
  to authenticated
  using (public.is_platform_admin());

create policy "categories_admin_manage"
  on public.categories for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- ── Creator discovery: authenticated users can browse creator orgs ──
create policy "organizations_creator_directory"
  on public.organizations for select
  to authenticated
  using (type = 'creator');

-- ─────────────────────────────────────────────────────────────
-- OFFERS — party-scoped RLS (company side & creator side)
-- Marketplace features land here; tables were deny-by-default.
-- ─────────────────────────────────────────────────────────────

create policy "offers_select_party"
  on public.offers for select
  to authenticated
  using (
    public.has_org_role(company_organization_id)
    or public.has_org_role(creator_organization_id)
  );

create policy "offers_insert_company"
  on public.offers for insert
  to authenticated
  with check (
    status = 'sent'
    and public.has_org_role(company_organization_id)
  );

create policy "offers_update_party"
  on public.offers for update
  to authenticated
  using (
    public.has_org_role(company_organization_id)
    or public.has_org_role(creator_organization_id)
  )
  with check (
    public.has_org_role(company_organization_id)
    or public.has_org_role(creator_organization_id)
  );

create policy "offers_delete_company_draft"
  on public.offers for delete
  to authenticated
  using (
    public.has_org_role(company_organization_id)
    and status in ('draft', 'sent')
  );

create policy "offer_items_select_party"
  on public.offer_items for select
  to authenticated
  using (
    exists (
      select 1 from public.offers o
      where o.id = offer_id
        and (
          public.has_org_role(o.company_organization_id)
          or public.has_org_role(o.creator_organization_id)
        )
    )
  );

create policy "offer_items_insert_sender"
  on public.offer_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.offers o
      where o.id = offer_id
        and public.has_org_role(o.company_organization_id)
    )
  );

create policy "offer_negotiations_select_party"
  on public.offer_negotiations for select
  to authenticated
  using (
    exists (
      select 1 from public.offers o
      where o.id = offer_id
        and (
          public.has_org_role(o.company_organization_id)
          or public.has_org_role(o.creator_organization_id)
        )
    )
  );

create policy "offer_negotiations_insert_party"
  on public.offer_negotiations for insert
  to authenticated
  with check (
    exists (
      select 1 from public.offers o
      where o.id = offer_id
        and (
          public.has_org_role(o.company_organization_id)
          or public.has_org_role(o.creator_organization_id)
        )
    )
  );
