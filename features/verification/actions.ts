"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface VerifyResult {
  ok: boolean;
  error?: string;
}

/** Creator/Company submits a verification request. */
export async function requestVerificationAction(
  links: string,
  notes?: string
): Promise<VerifyResult> {
  if (!links.trim()) return { ok: false, error: "links_required" };

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

  // Prevent duplicate pending requests
  const { data: existing } = await supabase
    .from("verification_requests")
    .select("id")
    .eq("organization_id", membership.organization_id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return { ok: false, error: "already_pending" };

  const { error } = await supabase.from("verification_requests").insert({
    organization_id: membership.organization_id,
    submitted_by: user!.id,
    documents: { links: links.trim(), notes: notes ?? "" },
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

/** Admin approves/rejects verification → updates profile badge. */
export async function reviewVerificationAction(
  requestId: string,
  decision: "approved" | "rejected"
): Promise<VerifyResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: admin } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user!.id)
    .maybeSingle();
  if (!admin?.is_admin) return { ok: false, error: "admin_only" };

  const { data: req } = await supabase
    .from("verification_requests")
    .select("id, organization_id, status")
    .eq("id", requestId)
    .maybeSingle();
  if (!req || req.status !== "pending") return { ok: false, error: "not_pending" };

  const { error: updateError } = await supabase
    .from("verification_requests")
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      review_notes: `بواسطة ${user!.email}`,
    })
    .eq("id", requestId);
  if (updateError) return { ok: false, error: updateError.message };

  if (decision === "approved") {
    await supabase
      .from("creator_profiles")
      .update({ verified: true, verification_status: "approved" })
      .eq("organization_id", req.organization_id);
    await supabase
      .from("company_profiles")
      .update({ verified: true, verification_status: "approved" })
      .eq("organization_id", req.organization_id);
  }

  revalidatePath("/admin/verification");
  return { ok: true };
}

/** Pending requests for admin review. */
export async function getPendingVerifications() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("verification_requests")
    .select("*, organizations(name, slug, type)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return (data ?? []).map((r) => {
    const org = r.organizations as unknown as { name: string; slug: string; type: string } | null;
    return { ...r, org_name: org?.name ?? "—", org_slug: org?.slug ?? "", org_type: org?.type ?? "" };
  });
}
