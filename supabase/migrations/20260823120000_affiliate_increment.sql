create or replace function public.increment_affiliate_click(_link_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.affiliate_links
  set clicks_count = clicks_count + 1
  where id = _link_id;
$$;

grant execute on function public.increment_affiliate_click(uuid) to anon, authenticated;
