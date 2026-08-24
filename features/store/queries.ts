import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { StoreOrder, StoreProduct } from "@/types/database";

/** Active products of an org (public store page). */
export async function getPublicStore(
  slug: string
): Promise<{ orgName: string; products: StoreProduct[] } | null> {
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();
  if (!org) return null;

  const { data: products } = await supabase
    .from("store_products")
    .select("*")
    .eq("organization_id", org.id)
    .eq("is_active", true)
    .order("sort_order");

  return { orgName: org.name, products: products ?? [] };
}

/** All products for the owner's studio. */
export async function getMyProducts(): Promise<StoreProduct[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user!.id)
    .limit(1)
    .maybeSingle();

  const { data } = await supabase
    .from("store_products")
    .select("*")
    .eq("organization_id", membership!.organization_id)
    .order("sort_order");
  return data ?? [];
}

/** Orders for owner's store. */
export async function getMyOrders(): Promise<
  Array<StoreOrder & { product_title: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user!.id)
    .limit(1)
    .maybeSingle();

  const { data } = await supabase
    .from("store_orders")
    .select("*, store_products(title)")
    .eq("organization_id", membership!.organization_id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((o) => {
    const p = o.store_products as unknown as { title: string } | null;
    return { ...o, product_title: p?.title ?? "—" };
  });
}
