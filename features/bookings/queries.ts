import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BookingSlot, StoreProduct } from "@/types/database";

export async function getMySlots(): Promise<
  Array<BookingSlot & { product_title: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return [];

  const { data } = await supabase
    .from("booking_slots")
    .select("*, store_products(title)")
    .eq("organization_id", membership.organization_id)
    .gte("starts_at", new Date(Date.now() - 86400000).toISOString())
    .order("starts_at")
    .limit(100);

  return (data ?? []).map((s) => ({
    ...s,
    product_title:
      (s.store_products as unknown as { title: string } | null)?.title ?? "—",
  }));
}

export async function getMyCoachingProducts(): Promise<StoreProduct[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return [];

  const { data } = await supabase
    .from("store_products")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .eq("type", "coaching_call")
    .eq("is_active", true)
    .order("title");
  return data ?? [];
}

/** Public open slots for a product. */
export async function getOpenSlots(productId: string): Promise<BookingSlot[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_slots")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "open")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(50);
  return data ?? [];
}
