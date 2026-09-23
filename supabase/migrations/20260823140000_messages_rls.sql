-- ============================================================================
-- Wasla | وصلة — Messages RLS (company ↔ creator threads)
-- Thread key convention: "offer:{offerId}" or "org:{orgA}:{orgB}" (sorted)
-- ============================================================================

create policy "messages_select_party"
  on public.messages for select
  to authenticated
  using (
    sender_user_id = auth.uid()
    or public.has_org_role(sender_organization_id)
    or public.has_org_role(recipient_organization_id)
    or public.is_platform_admin()
  );

create policy "messages_insert_sender"
  on public.messages for insert
  to authenticated
  with check (
    sender_user_id = auth.uid()
    and public.has_org_role(sender_organization_id)
  );
