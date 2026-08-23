-- ============================================================================
-- Wasla | وصلة — Private bucket owner reads
-- Gap fix: owners could upload into media-kit/campaign-files but had no
-- SELECT path back to their own objects. Read stays scoped to the caller's
-- own top-level folder; anonymous access remains denied.
-- ============================================================================

create policy "storage_owner_read_private_own_folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id in ('media-kit', 'campaign-files')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
