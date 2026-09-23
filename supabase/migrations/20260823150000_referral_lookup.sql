-- ============================================================================
-- Wasla | وصلة — Referral lookup RPC + auto referral codes on signup
-- Codes are shareable by design; resolution happens server-side only.
-- ============================================================================

-- Auto-generate a referral code for every new profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_name text;
  base text;
  candidate text;
  attempts int := 0;
begin
  meta_name := nullif(new.raw_user_meta_data ->> 'full_name', '');

  base := lower(regexp_replace(coalesce(meta_name, ''), '[^a-zA-Z0-9_]+', '', 'g'));

  if base is null or char_length(base) < 3 then
    base := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]+', '', 'g'));
  end if;

  if base is null or char_length(base) < 3 then
    base := 'user';
  elsif char_length(base) > 20 then
    base := left(base, 20);
  end if;

  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    attempts := attempts + 1;
    if attempts > 20 then
      candidate := base || substr(md5(random()::text), 1, 8);
      exit;
    end if;
    candidate := base || floor(random() * 100000)::int::text;
  end loop;

  insert into public.profiles (id, full_name, username, language, referral_code)
  values (
    new.id,
    coalesce(meta_name, ''),
    candidate,
    coalesce(new.raw_user_meta_data ->> 'language', 'ar'),
    substr(md5(new.id::text || random()::text), 1, 8)
  );

  -- Attribute a pending referral if the signup carried a code
  if coalesce(new.raw_user_meta_data ->> 'referral_code', '') <> '' then
    update public.profiles p
    set referred_by = r.id
    from public.profiles r
    where p.id = new.id
      and r.referral_code = lower(new.raw_user_meta_data ->> 'referral_code')
      and r.id <> new.id;
  end if;

  return new;
end;
$$;

-- Resolve a referral code to the referrer's org (for reward crediting)
create or replace function public.resolve_referral(_code text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.organization_id
  from public.profiles p
  join public.organization_members m on m.user_id = p.id
  where p.referral_code = lower(_code)
  order by m.created_at
  limit 1;
$$;

revoke execute on function public.resolve_referral(text) from anon;
grant execute on function public.resolve_referral(text) to authenticated;
