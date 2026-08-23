-- ============================================================================
-- Wasla | وصلة — Fix handle_new_user username derivation
-- Bug: an Arabic full_name (e.g. "أحمد") strips to an empty latin string,
-- which silently became the 'user' fallback instead of falling back to the
-- email local-part. Fix: derive from the email whenever the stripped name
-- is shorter than 3 latin chars.
-- ============================================================================

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

  -- Prefer latin characters from the display name…
  base := lower(regexp_replace(coalesce(meta_name, ''), '[^a-zA-Z0-9_]+', '', 'g'));

  -- …fall back to the email local-part for Arabic-only names.
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

  insert into public.profiles (id, full_name, username, language)
  values (
    new.id,
    coalesce(meta_name, ''),
    candidate,
    coalesce(new.raw_user_meta_data ->> 'language', 'ar')
  );

  return new;
end;
$$;
