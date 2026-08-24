import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminVerification } from "@/components/admin/admin-verification";

export const metadata: Metadata = {
  title: "طلبات التوثيق",
  robots: { index: false },
};

export default async function AdminVerificationPage() {
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

  const { data: requests } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const orgIds = [...new Set((requests ?? []).map((r) => r.organization_id))];
  const { data: orgs } = orgIds.length
    ? await supabase.from("organizations").select("id, name, slug, type").in("id", orgIds)
    : { data: [] };
  const orgMap = new Map((orgs ?? []).map((o) => [o.id, o]));

  const list = (requests ?? []).map((r) => {
    const org = orgMap.get(r.organization_id);
    const docs = r.documents as { links?: string; notes?: string } | null;
    return {
      id: r.id,
      org_name: org?.name ?? "—",
      org_slug: org?.slug ?? "",
      org_type: org?.type ?? "",
      documents: docs,
      created_at: r.created_at,
    };
  });

  return <AdminVerification requests={list} />;
}
