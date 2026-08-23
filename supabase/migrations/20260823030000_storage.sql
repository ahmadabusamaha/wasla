-- ============================================================================
-- Wasla | وصلة — Storage buckets & policies
-- Public buckets: avatars, logos, images
-- Private buckets: media-kit, campaign-files (org-scoped access later)
-- Uploads are namespaced per user: {bucket}/{auth.uid()}/{path}
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media-kit', 'media-kit', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('campaign-files', 'campaign-files', false)
on conflict (id) do nothing;

-- ── Public buckets are world-readable ───────────────────────────
create policy "storage_public_read_avatars_logos_images"
  on storage.objects for select
  using (
    bucket_id in ('avatars', 'logos', 'images')
  );

-- ── Authenticated users manage files inside their own folder only ──
create policy "storage_authenticated_upload_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('avatars', 'logos', 'images', 'media-kit', 'campaign-files')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_authenticated_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('avatars', 'logos', 'images', 'media-kit', 'campaign-files')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('avatars', 'logos', 'images', 'media-kit', 'campaign-files')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_authenticated_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('avatars', 'logos', 'images', 'media-kit', 'campaign-files')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
