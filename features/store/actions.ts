"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storeOrderSchema, storeProductSchema } from "@/schemas/store";

export interface StoreResult {
  ok: boolean;
  error?: string;
}

async function myOrg() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return null;
  return { supabase, orgId: membership.organization_id };
}

function zmsg(error?: { issues: Array<{ message: string }> }): string {
  return error?.issues.map((i) => i.message).join(" · ") ?? "invalid";
}

export async function saveStoreProductAction(input: unknown): Promise<StoreResult> {
  const parsed = storeProductSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zmsg(parsed.error) };

  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };

  const { id, ...values } = parsed.data;
  const row = {
    ...values,
    digital_file_url: values.digital_file_url || null,
    payment_link_url: values.payment_link_url || null,
    description: values.description || null,
    compare_at_price: values.compare_at_price ?? null,
    call_duration_minutes: values.call_duration_minutes ?? null,
  };

  if (id) {
    const { error } = await ctx.supabase.from("store_products").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await ctx.supabase
      .from("store_products")
      .insert({ ...row, organization_id: ctx.orgId });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/store");
  return { ok: true };
}

export async function deleteStoreProductAction(id: string): Promise<StoreResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  const { error } = await ctx.supabase.from("store_products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/store");
  return { ok: true };
}

/** Buyer places an order (public — no login needed). Payment is confirmed by the creator. */
export async function placeStoreOrderAction(input: unknown): Promise<
  StoreResult & { paymentLink?: string }
> {
  const parsed = storeOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zmsg(parsed.error) };

  const supabase = await createClient();

  const { data: product } = await supabase
    .from("store_products")
    .select("id, organization_id, price, currency, is_active, payment_link_url, type")
    .eq("id", parsed.data.productId)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) return { ok: false, error: "product_not_found" };

  const { error } = await supabase.from("store_orders").insert({
    product_id: product.id,
    organization_id: product.organization_id,
    buyer_name: parsed.data.buyerName,
    buyer_email: parsed.data.buyerEmail,
    buyer_phone: parsed.data.buyerPhone || null,
    amount: product.price,
    currency: product.currency,
    payment_reference: parsed.data.paymentReference || null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, paymentLink: product.payment_link_url ?? undefined };
}

/** Creator confirms payment received → order becomes paid + wallet credit. */
export async function confirmOrderPaidAction(orderId: string): Promise<StoreResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };

  const { data: order } = await ctx.supabase
    .from("store_orders")
    .select("id, amount, currency, status, organization_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.organization_id !== ctx.orgId) return { ok: false, error: "not_found" };
  if (order.status !== "pending") return { ok: false, error: "already_processed" };

  const { error: updateError } = await ctx.supabase
    .from("store_orders")
    .update({ status: "paid" })
    .eq("id", orderId);
  if (updateError) return { ok: false, error: updateError.message };

  // Credit wallet: gross sale + platform fee (5%)
  const fee = Math.round(order.amount * 0.05 * 100) / 100;
  await ctx.supabase.from("wallet_transactions").insert([
    {
      organization_id: ctx.orgId,
      type: "sale",
      amount: order.amount,
      currency: order.currency,
      status: "cleared",
      description: "بيع من المتجر",
      reference_type: "store_order",
      reference_id: order.id,
      available_at: new Date(Date.now() + 10 * 86400000).toISOString(),
    },
    {
      organization_id: ctx.orgId,
      type: "platform_fee",
      amount: -fee,
      currency: order.currency,
      status: "cleared",
      description: "عمولة منصة وصلة (5%)",
      reference_type: "store_order",
      reference_id: order.id,
    },
  ]);

  revalidatePath("/dashboard/store");
  revalidatePath("/dashboard/wallet");
  return { ok: true };
}
