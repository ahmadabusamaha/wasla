"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createOfferSchema, offerDecisionSchema } from "@/schemas/offers";

export interface OfferResult {
  ok: boolean;
  error?: string;
}

async function myOrg(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; orgId: string; orgType: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(type)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;
  const rawOrg = membership.organizations as unknown;
  const org = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;

  return {
    supabase,
    orgId: membership.organization_id,
    orgType: (org as { type?: string })?.type ?? "",
  };
}

/** Company sends a new offer to a creator. */
export async function sendOfferAction(input: unknown): Promise<OfferResult> {
  const parsed = createOfferSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (ctx.orgType !== "company") return { ok: false, error: "only_companies_send" };

  const { data: offer, error: offerError } = await ctx.supabase
    .from("offers")
    .insert({
      company_organization_id: ctx.orgId,
      creator_organization_id: parsed.data.creatorOrganizationId,
      title: parsed.data.title,
      message: parsed.data.message ?? null,
      currency: parsed.data.currency,
      status: "sent",
    })
    .select("id")
    .single();

  if (offerError || !offer) return { ok: false, error: offerError?.message ?? "insert_failed" };

  const { error: itemsError } = await ctx.supabase.from("offer_items").insert(
    parsed.data.items.map((item) => ({
      offer_id: offer.id,
      type: item.type,
      label: item.label,
      amount: item.amount ?? null,
      quantity: item.quantity ?? null,
      percentage: item.percentage ?? null,
    }))
  );

  if (itemsError) return { ok: false, error: itemsError.message };
  revalidatePath("/dashboard/offers");
  return { ok: true };
}

/** Creator accepts or rejects an offer. */
export async function respondToOfferAction(
  offerId: string,
  decision: "accepted" | "rejected"
): Promise<OfferResult> {
  const parsed = offerDecisionSchema.safeParse({ offerId, decision });
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (ctx.orgType !== "creator") return { ok: false, error: "only_creators_respond" };

  const { data: offer } = await ctx.supabase
    .from("offers")
    .select("id, creator_organization_id, status")
    .eq("id", offerId)
    .maybeSingle();

  if (!offer) return { ok: false, error: "not_found" };
  if (offer.creator_organization_id !== ctx.orgId) return { ok: false, error: "not_yours" };
  if (offer.status !== "sent" && offer.status !== "viewed" && offer.status !== "negotiating")
    return { ok: false, error: "already_responded" };

  const { error } = await ctx.supabase
    .from("offers")
    .update({ status: decision })
    .eq("id", offerId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/offers");
  return { ok: true };
}

/** Company withdraws a sent offer. */
export async function withdrawOfferAction(offerId: string): Promise<OfferResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (ctx.orgType !== "company") return { ok: false, error: "only_companies_withdraw" };

  const { error } = await ctx.supabase
    .from("offers")
    .update({ status: "withdrawn" })
    .eq("id", offerId)
    .eq("company_organization_id", ctx.orgId)
    .in("status", ["sent", "viewed", "negotiating"]);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/offers");
  return { ok: true };
}
