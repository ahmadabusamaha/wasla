"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface WalletResult {
  ok: boolean;
  error?: string;
}

export async function requestPayoutAction(
  amount: number,
  method: string,
  accountDetails: string
): Promise<WalletResult> {
  if (!amount || amount <= 0) return { ok: false, error: "invalid_amount" };
  if (!accountDetails.trim()) return { ok: false, error: "account_details_required" };

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

  // Verify available balance
  const { data: txns } = await supabase
    .from("wallet_transactions")
    .select("amount, status, type, available_at")
    .eq("organization_id", membership.organization_id);

  let available = 0;
  const now = Date.now();
  for (const t of txns ?? []) {
    if (t.type === "payout" || t.type === "platform_fee") continue;
    if (t.amount <= 0 || t.status === "paid_out") continue;
    if (t.available_at && new Date(t.available_at).getTime() > now) continue;
    available += t.amount;
  }

  if (amount > available) return { ok: false, error: "insufficient_balance" };

  const { error } = await supabase.from("payout_requests").insert({
    organization_id: membership.organization_id,
    amount,
    method,
    account_details: accountDetails.trim(),
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/wallet");
  return { ok: true };
}
