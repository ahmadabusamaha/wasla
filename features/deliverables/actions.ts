"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ContentDeliverable } from "@/types/database";

export interface DeliverableResult {
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
    .select("organization_id, organizations(type)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return null;
  const rawOrg = membership.organizations as unknown;
  const org = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;
  return {
    supabase,
    userId: user.id,
    orgId: membership.organization_id,
    orgType: (org as { type?: string })?.type ?? "",
  };
}

/** Creator submits content for an accepted offer. */
export async function submitDeliverableAction(
  offerId: string,
  title: string,
  contentUrl: string,
  description?: string
): Promise<DeliverableResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (ctx.orgType !== "creator") return { ok: false, error: "only_creators" };
  if (!title.trim() || !contentUrl.trim()) return { ok: false, error: "invalid_input" };

  const { data: offer } = await ctx.supabase
    .from("offers")
    .select("id, creator_organization_id, status, company_organization_id")
    .eq("id", offerId)
    .maybeSingle();
  if (!offer || offer.creator_organization_id !== ctx.orgId)
    return { ok: false, error: "not_yours" };
  if (offer.status !== "accepted")
    return { ok: false, error: "offer_not_accepted" };

  const { error } = await ctx.supabase.from("content_deliverables").insert({
    offer_id: offerId,
    creator_organization_id: ctx.orgId,
    title: title.trim(),
    content_url: contentUrl.trim(),
    description: description?.trim() || null,
    status: "submitted",
  });
  if (error) return { ok: false, error: error.message };

  // Notify company
  const { data: members } = await ctx.supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", offer.company_organization_id);
  if (members?.length) {
    await ctx.supabase.from("notifications").insert(
      members.map((m) => ({
        user_id: m.user_id,
        type: "campaign_invite",
        title: "📤 محتوى جديد للمراجعة",
        body: title,
        link_url: "/dashboard/offers",
      }))
    );
  }

  revalidatePath("/dashboard/offers");
  return { ok: true };
}

/** Company reviews a deliverable. */
export async function reviewDeliverableAction(
  deliverableId: string,
  decision: "approved" | "revision_requested" | "rejected",
  feedback?: string
): Promise<DeliverableResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (ctx.orgType !== "company") return { ok: false, error: "only_companies" };

  const { data: d } = await ctx.supabase
    .from("content_deliverables")
    .select("id, offer_id, status")
    .eq("id", deliverableId)
    .maybeSingle();
  if (!d) return { ok: false, error: "not_found" };

  const { data: offer } = await ctx.supabase
    .from("offers")
    .select("company_organization_id, creator_organization_id, title")
    .eq("id", d.offer_id)
    .maybeSingle();
  if (offer?.company_organization_id !== ctx.orgId)
    return { ok: false, error: "not_yours" };

  const { error } = await ctx.supabase
    .from("content_deliverables")
    .update({
      status: decision,
      feedback: feedback?.trim() || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: ctx.userId,
    })
    .eq("id", deliverableId);
  if (error) return { ok: false, error: error.message };

  // Notify creator
  const { data: members } = await ctx.supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", offer.creator_organization_id);
  if (members?.length) {
    const titles: Record<string, string> = {
      approved: "✅ تم اعتماد المحتوى",
      revision_requested: "🔄 طلب تعديل على المحتوى",
      rejected: "❌ تم رفض المحتوى",
    };
    await ctx.supabase.from("notifications").insert(
      members.map((m) => ({
        user_id: m.user_id,
        type: "application_update",
        title: titles[decision],
        body: feedback || offer.title,
        link_url: "/dashboard/offers",
      }))
    );
  }

  revalidatePath("/dashboard/offers");
  return { ok: true };
}

export async function getOfferDeliverables(
  offerId: string
): Promise<ContentDeliverable[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_deliverables")
    .select("*")
    .eq("offer_id", offerId)
    .order("submitted_at", { ascending: false });
  return (data ?? []) as ContentDeliverable[];
}
