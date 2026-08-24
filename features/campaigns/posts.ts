"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface PostResult {
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
    orgId: membership.organization_id,
    orgType: (org as { type?: string })?.type ?? "",
  };
}

const PLATFORMS = ["tiktok", "instagram", "youtube", "facebook", "x"] as const;

/** Creator adds a campaign post with its metrics. */
export async function addCampaignPostAction(
  campaignId: string,
  platform: string,
  postUrl: string,
  views: number,
  likes: number,
  comments: number,
  shares: number
): Promise<PostResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (ctx.orgType !== "creator") return { ok: false, error: "only_creators" };
  if (!(PLATFORMS as readonly string[]).includes(platform)) return { ok: false, error: "invalid_platform" };
  if (!postUrl.startsWith("http")) return { ok: false, error: "invalid_url" };

  // Must have an accepted application for this campaign
  const { data: app } = await ctx.supabase
    .from("campaign_applications")
    .select("id")
    .eq("campaign_id", campaignId)
    .eq("creator_organization_id", ctx.orgId)
    .eq("status", "accepted")
    .maybeSingle();
  if (!app) return { ok: false, error: "not_accepted" };

  const { error } = await ctx.supabase.from("campaign_posts").insert({
    campaign_id: campaignId,
    creator_organization_id: ctx.orgId,
    platform,
    post_url: postUrl,
    views: Math.max(0, views),
    likes: Math.max(0, likes),
    comments: Math.max(0, comments),
    shares: Math.max(0, shares),
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/campaigns");
  return { ok: true };
}

/** Company approves/rejects a post. */
export async function reviewCampaignPostAction(
  postId: string,
  approved: boolean
): Promise<PostResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (ctx.orgType !== "company") return { ok: false, error: "only_companies" };

  const { data: post } = await ctx.supabase
    .from("campaign_posts")
    .select("id, campaign_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return { ok: false, error: "not_found" };

  const { data: campaign } = await ctx.supabase
    .from("campaigns")
    .select("organization_id")
    .eq("id", post.campaign_id)
    .maybeSingle();
  if (campaign?.organization_id !== ctx.orgId) return { ok: false, error: "not_yours" };

  const { error } = await ctx.supabase
    .from("campaign_posts")
    .update({ approved })
    .eq("id", postId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/campaigns");
  return { ok: true };
}

/** Posts for a campaign (company view). */
export async function getCampaignPosts(campaignId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaign_posts")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
