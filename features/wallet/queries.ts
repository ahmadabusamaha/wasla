import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PayoutRequest, WalletTransaction } from "@/types/database";

export interface WalletSummary {
  available: number;
  pending: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
}

export async function getWalletData(): Promise<{
  summary: WalletSummary;
  transactions: WalletTransaction[];
  payouts: PayoutRequest[];
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

  const { data: txns } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: payouts } = await supabase
    .from("payout_requests")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false });

  const list = txns ?? [];
  const now = Date.now();
  let available = 0, pending = 0, totalEarned = 0, totalWithdrawn = 0;
  let currency = "USD";

  for (const t of list) {
    currency = t.currency;
    if (t.type === "payout") { totalWithdrawn += Math.abs(t.amount); continue; }
    if (t.type === "platform_fee") continue;
    if (t.amount <= 0) continue;
    totalEarned += t.amount;
    if (t.status === "paid_out") continue;
    if (t.available_at && new Date(t.available_at).getTime() > now) pending += t.amount;
    else available += t.amount;
  }

  return {
    summary: { available, pending, totalEarned, totalWithdrawn, currency },
    transactions: list,
    payouts: payouts ?? [],
  };
}
