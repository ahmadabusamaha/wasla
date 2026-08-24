"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { campaignsSchema } from "@/schemas/offers";

export interface CampaignResult {
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

export async function createCampaignAction(input: unknown): Promise<CampaignResult> {
  const parsed = campaignsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" · ") };
  }

  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (ctx.orgType !== "company") return { ok: false, error: "only_companies_create" };

  const { error } = await ctx.supabase.from("campaigns").insert({
    organization_id: ctx.orgId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    budget: parsed.data.budget ?? null,
    currency: parsed.data.currency,
    status: parsed.data.status,
    starts_at: parsed.data.starts_at || null,
    ends_at: parsed.data.ends_at || null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/campaigns");
  return { ok: true };
}

export async function updateCampaignStatusAction(
  campaignId: string,
  status: string
): Promise<CampaignResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };

  const valid = ["draft", "active", "paused", "completed", "cancelled"] as const;
  if (!valid.includes(status as typeof valid[number])) return { ok: false, error: "invalid_status" };

  const { error } = await ctx.supabase
    .from("campaigns")
    .update({ status: status as import("@/types/database").CampaignStatus })
    .eq("id", campaignId)
    .eq("organization_id", ctx.orgId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/campaigns");
  return { ok: true };
}

/** Creator applies to an active campaign. */
export async function applyToCampaignAction(
  campaignId: string,
  message?: string
): Promise<CampaignResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (ctx.orgType !== "creator") return { ok: false, error: "only_creators_apply" };

  const { error } = await ctx.supabase.from("campaign_applications").insert({
    campaign_id: campaignId,
    creator_organization_id: ctx.orgId,
    status: "pending",
    message: message ?? null,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "already_applied" };
    return { ok: false, error: error.message };
  }
  revalidatePath("/dashboard/campaigns");
  return { ok: true };
}

/** Company reviews an application (accept/reject). */
export async function reviewApplicationAction(
  applicationId: string,
  decision: "accepted" | "rejected"
): Promise<CampaignResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (ctx.orgType !== "company") return { ok: false, error: "only_companies_review" };

  const { data: app } = await ctx.supabase
    .from("campaign_applications")
    .select("id, campaign_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (!app) return { ok: false, error: "not_found" };

  const { data: campaign } = await ctx.supabase
    .from("campaigns")
    .select("organization_id")
    .eq("id", app.campaign_id)
    .maybeSingle();

  if (campaign?.organization_id !== ctx.orgId) return { ok: false, error: "not_yours" };

  const { error } = await ctx.supabase
    .from("campaign_applications")
    .update({ status: decision })
    .eq("id", applicationId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/campaigns");
  return { ok: true };
}
