-- ============================================================================
-- Wasla | وصلة — Explicit table grants for anon/authenticated
-- Some newer Supabase projects do not inherit default privileges for the
-- role that applies migrations, leaving RLS-protected tables inaccessible
-- to API roles (42501 permission denied).
--
-- Security model unchanged: RLS remains the actual gatekeeper. These grants
-- only allow the API roles to REACH the tables; every private row stays
-- protected by policies (marketplace tables remain deny-by-default since
-- they have no policies yet).
-- ============================================================================

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete
  on all tables in schema public
  to anon, authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables
  to anon, authenticated;
