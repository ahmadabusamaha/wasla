-- ============================================================================
-- Wasla | وصلة — Campaigns RLS + Bio page extended customization
-- ============================================================================

-- ── Bio page extended customization columns ─────────────────
alter table public.bio_pages
  add column if not exists button_style text not null default 'solid',
  add column if not exists accent_color text not null default 'teal',
  add column if not exists font_choice text not null default 'default';

alter table public.bio_pages
  add constraint bio_pages_button_style_check
    check (button_style in ('solid','outline','soft','shadow'))
    not valid;
alter table public.bio_pages
  validate constraint bio_pages_button_style_check;

alter table public.bio_pages
  add constraint bio_pages_accent_color_check
    check (accent_color in ('teal','purple','rose','amber','blue','slate','emerald'))
    not valid;
alter table public.bio_pages
  validate constraint bio_pages_accent_color_check;

alter table public.bio_pages
  add constraint bio_pages_font_choice_check
    check (font_choice in ('default','cairo','tajawal','almarai'))
    not valid;
alter table public.bio_pages
  validate constraint bio_pages_font_choice_check;

-- ── Campaigns: party-scoped RLS ─────────────────────────────
create policy "campaigns_select_owner"
  on public.campaigns for select
  to authenticated
  using (public.has_org_role(organization_id));

create policy "campaigns_insert_owner"
  on public.campaigns for insert
  to authenticated
  with check (public.has_org_role(organization_id));

create policy "campaigns_update_owner"
  on public.campaigns for update
  to authenticated
  using (public.has_org_role(organization_id))
  with check (public.has_org_role(organization_id));

create policy "campaigns_delete_owner"
  on public.campaigns for delete
  to authenticated
  using (public.has_org_role(organization_id));

-- Applications: creator sees own, company sees campaign's
create policy "campaign_applications_select_party"
  on public.campaign_applications for select
  to authenticated
  using (
    public.has_org_role(creator_organization_id)
    or exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and public.has_org_role(c.organization_id)
    )
  );

create policy "campaign_applications_insert_creator"
  on public.campaign_applications for insert
  to authenticated
  with check (
    status = 'pending'
    and public.has_org_role(creator_organization_id)
    and exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.status = 'active'
    )
  );

create policy "campaign_applications_update_party"
  on public.campaign_applications for update
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

-- Creators can discover active campaigns
create policy "campaigns_discover_active"
  on public.campaigns for select
  to authenticated
  using (status = 'active');
