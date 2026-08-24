"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface PremiumResult {
  ok: boolean;
  error?: string;
}

export async function getMySubscription(): Promise<{
  active: boolean;
  planCode: string;
  periodEnd: string | null;
} | null> {
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
  if (!membership) return null;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, plans(code)")
    .eq("organization_id", membership.organization_id)
    .maybeSingle();

  if (!sub || sub.status !== "active") return { active: false, planCode: "free", periodEnd: null };
  const plan = sub.plans as unknown as { code: string } | null;
  return {
    active: plan?.code === "pro",
    planCode: plan?.code ?? "free",
    periodEnd: sub.current_period_end,
  };
}

/** Subscribe to Pro (v1: payment link flow → admin/pending activation). */
export async function subscribeProAction(paymentReference: string): Promise<PremiumResult> {
  if (!paymentReference.trim()) return { ok: false, error: "reference_required" };

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
  if (!membership) return { ok: false, error: "unauthorized" };

  const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();

  const { error } = await supabase.from("subscriptions").upsert(
    {
      organization_id: membership.organization_id,
      plan_id: "b2000000-0000-4000-8000-000000000002",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd,
    },
    { onConflict: "organization_id" }
  );

  if (error) return { ok: false, error: error.message };

  await supabase.from("notifications").insert({
    user_id: user!.id,
    type: "general",
    title: "مرحبًا بك في Wasla Pro ⭐",
    body: "تم تفعيل اشتراكك — استمتع بصفر عمولة والمميزات المتقدمة.",
    link_url: "/dashboard/wallet",
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/wallet");
  return { ok: true };
}
