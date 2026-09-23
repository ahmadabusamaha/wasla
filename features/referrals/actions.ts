"use server";

import { createClient } from "@/lib/supabase/server";

export interface ReferralResult {
  ok: boolean;
  error?: string;
}

/**
 * Credits the $5 referral reward when a referred user finishes onboarding.
 * Called at the end of completeOnboardingAction (best-effort, never blocks).
 */
export async function creditReferralReward(
  newUserId: string
): Promise<void> {
  try {
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", newUserId)
      .maybeSingle();
    if (!profile?.referred_by) return;

    // Resolve referrer's org
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", profile.referred_by)
      .limit(1)
      .maybeSingle();
    if (!membership) return;

    // Avoid double-credit
    const { data: existing } = await supabase
      .from("referral_rewards")
      .select("id")
      .eq("referred_user_id", newUserId)
      .maybeSingle();
    if (existing) return;

    const { data: reward } = await supabase
      .from("referral_rewards")
      .insert({
        referrer_org_id: membership.organization_id,
        referred_user_id: newUserId,
        reward_amount: 5,
        currency: "USD",
        status: "credited",
      })
      .select("id")
      .single();
    if (!reward) return;

    await supabase.from("wallet_transactions").insert({
      organization_id: membership.organization_id,
      type: "affiliate_commission",
      amount: 5,
      currency: "USD",
      status: "cleared",
      description: "مكافأة إحالة مستخدم جديد",
      reference_type: "referral_reward",
      reference_id: reward.id,
    });

    // Notify referrer
    await supabase.from("notifications").insert({
      user_id: profile.referred_by,
      type: "general",
      title: "🎉 انضم صديق عبر رابطك! +$5",
      body: "أُضيفت مكافأة الإحالة إلى محفظتك.",
      link_url: "/dashboard/wallet",
    });
  } catch {
    // best-effort: never break onboarding
  }
}

export async function getMyReferralData(): Promise<{
  code: string;
  referredCount: number;
  earnedTotal: number;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.referral_code) return null;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return { code: profile.referral_code, referredCount: 0, earnedTotal: 0 };

  const { data: rewards } = await supabase
    .from("referral_rewards")
    .select("reward_amount")
    .eq("referrer_org_id", membership.organization_id)
    .eq("status", "credited");

  return {
    code: profile.referral_code,
    referredCount: rewards?.length ?? 0,
    earnedTotal: (rewards ?? []).reduce((s, r) => s + (r.reward_amount ?? 0), 0),
  };
}
