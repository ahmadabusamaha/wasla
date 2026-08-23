-- ============================================================================
-- Wasla | وصلة — Slug availability RPC
-- The onboarding flow must check slug uniqueness across organizations and
-- bio_pages BEFORE inserting. Plain SELECTs are scoped by RLS (users cannot
-- see other users' drafts), so this SECURITY DEFINER helper performs the
-- check server-side, read-only.
-- ============================================================================

create or replace function public.slug_available(_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    not exists (select 1 from public.organizations where slug = _slug)
    and not exists (select 1 from public.bio_pages where slug = _slug);
$$;

revoke execute on function public.slug_available(text) from anon;
grant execute on function public.slug_available(text) to authenticated;
