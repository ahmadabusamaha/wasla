import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPayouts } from "@/components/admin/admin-payouts";

export const metadata: Metadata = {
  title: "طلبات السحب",
  robots: { index: false },
};

export default async function AdminPayoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user!.id)
    .maybeSingle();
  if (!profile?.is_admin) redirect("/dashboard");

  const { data: payouts } = await supabase
    .from("payout_requests")
    .select("*, organizations(name, slug)")
    .order("created_at", { ascending: false })
    .limit(100);

  const list = (payouts ?? []).map((p) => {
    const org = p.organizations as unknown as { name: string; slug: string } | null;
    return { ...p, org_name: org?.name ?? "—", org_slug: org?.slug ?? "" };
  });

  return <AdminPayouts payouts={list} />;
}
