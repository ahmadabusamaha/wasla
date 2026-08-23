-- ============================================================================
-- Wasla | وصلة — Row Level Security Policies
-- The database is the primary security layer; the frontend only hides UI.
-- ============================================================================

-- Helper: is the current user a member of the given organization?
-- SECURITY DEFINER avoids RLS recursion on organization_members.
create or replace function public.has_org_role(
  _organization_id uuid,
  _roles public.member_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = _organization_id
      and m.user_id = auth.uid()
      and (_roles is null or m.role = any(_roles))
  );
$$;

revoke execute on function public.has_org_role(uuid, public.member_role[])
  from anon;
grant execute on function public.has_org_role(uuid, public.member_role[])
  to authenticated;

-- ─────────────────────────────────────────────────────────────
-- profiles: private except to the owner
-- ─────────────────────────────────────────────────────────────
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- organizations: visible to members, creatable by any authenticated user,
-- editable by owners.
-- ─────────────────────────────────────────────────────────────
create policy "organizations_select_member"
  on public.organizations for select
  using (public.has_org_role(id));

create policy "organizations_insert_authenticated"
  on public.organizations for insert
  to authenticated
  with check (true);

create policy "organizations_update_owner"
  on public.organizations for update
  using (public.has_org_role(id, array['owner']::public.member_role[]))
  with check (public.has_org_role(id, array['owner']::public.member_role[]));

create policy "organizations_delete_owner"
  on public.organizations for delete
  using (public.has_org_role(id, array['owner']::public.member_role[]));

-- ─────────────────────────────────────────────────────────────
-- organization_members:
-- - members can see their org's members; users can see their own rows.
-- - users may only join as OWNER of a brand-new org (self-join). Invites
--   will be added in a later phase with proper invitation tokens.
-- ─────────────────────────────────────────────────────────────
create policy "members_select"
  on public.organization_members for select
  using (
    user_id = auth.uid()
    or public.has_org_role(organization_id)
  );

create policy "members_insert_self_owner"
  on public.organization_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'owner'
  );

create policy "members_owner_manages"
  on public.organization_members for update
  using (
    public.has_org_role(organization_id, array['owner']::public.member_role[])
  )
  with check (
    public.has_org_role(organization_id, array['owner']::public.member_role[])
  );

create policy "members_leave_or_removed_by_owner"
  on public.organization_members for delete
  using (
    user_id = auth.uid()
    or (
      public.has_org_role(organization_id, array['owner']::public.member_role[])
      and user_id <> auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- creator_profiles / company_profiles: org members only
-- (the public surface is bio_pages, not these tables)
-- ─────────────────────────────────────────────────────────────
create policy "creator_profiles_org"
  on public.creator_profiles for all
  using (public.has_org_role(organization_id))
  with check (public.has_org_role(organization_id));

create policy "company_profiles_org"
  on public.company_profiles for all
  using (public.has_org_role(organization_id))
  with check (public.has_org_role(organization_id));

-- ─────────────────────────────────────────────────────────────
-- categories: public read-only taxonomy (admin writes via dashboard later)
-- ─────────────────────────────────────────────────────────────
create policy "categories_public_read"
  on public.categories for select
  using (true);

create policy "creator_categories_public_read"
  on public.creator_categories for select
  using (true);

create policy "creator_categories_manage_by_org"
  on public.creator_categories for insert
  with check (
    exists (
      select 1 from public.creator_profiles cp
      where cp.id = creator_profile_id
        and public.has_org_role(cp.organization_id)
    )
  );

create policy "creator_categories_delete_by_org"
  on public.creator_categories for delete
  using (
    exists (
      select 1 from public.creator_profiles cp
      where cp.id = creator_profile_id
        and public.has_org_role(cp.organization_id)
    )
  );

-- ─────────────────────────────────────────────────────────────
-- social_accounts: org members only
-- ─────────────────────────────────────────────────────────────
create policy "social_accounts_org"
  on public.social_accounts for all
  using (public.has_org_role(organization_id))
  with check (public.has_org_role(organization_id));

-- ─────────────────────────────────────────────────────────────
-- bio_pages: public can read PUBLISHED pages only;
-- members manage their own page.
-- ─────────────────────────────────────────────────────────────
create policy "bio_pages_public_read_published"
  on public.bio_pages for select
  using (published = true or public.has_org_role(organization_id));

create policy "bio_pages_org_write"
  on public.bio_pages for insert
  with check (public.has_org_role(organization_id));

create policy "bio_pages_org_update"
  on public.bio_pages for update
  using (public.has_org_role(organization_id))
  with check (public.has_org_role(organization_id));

create policy "bio_pages_org_delete"
  on public.bio_pages for delete
  using (public.has_org_role(organization_id));

-- ─────────────────────────────────────────────────────────────
-- bio_blocks: public reads blocks of published pages (visible ones);
-- members manage blocks of their pages.
-- ─────────────────────────────────────────────────────────────
create policy "bio_blocks_public_read"
  on public.bio_blocks for select
  using (
    exists (
      select 1 from public.bio_pages p
      where p.id = bio_page_id
        and (
          (p.published and visible = true)
          or public.has_org_role(p.organization_id)
        )
    )
  );

create policy "bio_blocks_org_write"
  on public.bio_blocks for insert
  with check (
    exists (
      select 1 from public.bio_pages p
      where p.id = bio_page_id
        and public.has_org_role(p.organization_id)
    )
  );

create policy "bio_blocks_org_update"
  on public.bio_blocks for update
  using (
    exists (
      select 1 from public.bio_pages p
      where p.id = bio_page_id
        and public.has_org_role(p.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.bio_pages p
      where p.id = bio_page_id
        and public.has_org_role(p.organization_id)
    )
  );

create policy "bio_blocks_org_delete"
  on public.bio_blocks for delete
  using (
    exists (
      select 1 from public.bio_pages p
      where p.id = bio_page_id
        and public.has_org_role(p.organization_id)
    )
  );

-- ─────────────────────────────────────────────────────────────
-- analytics_events:
-- - anyone (anon included) may INSERT whitelisted events (enforced by the
--   event_type CHECK constraint) so public bio pages can track views/clicks.
-- - only the owning organization's members can SELECT.
-- ─────────────────────────────────────────────────────────────
create policy "analytics_events_public_insert"
  on public.analytics_events for insert
  to anon, authenticated
  with check (true);

create policy "analytics_events_org_select"
  on public.analytics_events for select
  using (
    organization_id is not null
    and public.has_org_role(organization_id)
  );
