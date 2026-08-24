"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AdminActionResult {
  ok: boolean;
  error?: string;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return null;
  return { supabase, userId: user.id, email: user.email ?? "" };
}

export async function updatePayoutStatusAction(
  payoutId: string,
  status: "paid" | "rejected"
): Promise<AdminActionResult> {
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "admin_only" };

  const { data: payout } = await ctx.supabase
    .from("payout_requests")
    .select("id, organization_id, amount, currency, status")
    .eq("id", payoutId)
    .maybeSingle();
  if (!payout || payout.status !== "requested") return { ok: false, error: "not_pending" };

  const { error } = await ctx.supabase
    .from("payout_requests")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("id", payoutId);
  if (error) return { ok: false, error: error.message };

  if (status === "paid") {
    await ctx.supabase.from("wallet_transactions").insert({
      organization_id: payout.organization_id,
      type: "payout",
      amount: -payout.amount,
      currency: payout.currency,
      status: "paid_out",
      description: "سحب أرباح",
      reference_type: "payout_request",
      reference_id: payout.id,
    });
  }

  revalidatePath("/admin/payouts");
  return { ok: true };
}

export async function updateVerificationStatusAction(
  requestId: string,
  status: "approved" | "rejected"
): Promise<AdminActionResult> {
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "admin_only" };

  const { data: req } = await ctx.supabase
    .from("verification_requests")
    .select("id, organization_id, status")
    .eq("id", requestId)
    .maybeSingle();
  if (!req || req.status !== "pending") return { ok: false, error: "not_pending" };

  const { error } = await ctx.supabase
    .from("verification_requests")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) return { ok: false, error: error.message };

  if (status === "approved") {
    await ctx.supabase
      .from("creator_profiles")
      .update({ verified: true, verification_status: "approved" })
      .eq("organization_id", req.organization_id);
    await ctx.supabase
      .from("company_profiles")
      .update({ verified: true, verification_status: "approved" })
      .eq("organization_id", req.organization_id);
  }

  revalidatePath("/admin/verification");
  return { ok: true };
}
