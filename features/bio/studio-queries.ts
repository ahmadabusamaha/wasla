import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BioBlock, BioPage } from "@/types/database";

export interface BioStudioData {
  page: BioPage;
  blocks: BioBlock[];
}

/**
 * Loads the signed-in creator's bio page (any publish state) with all
 * blocks for the studio. Company accounts are routed to the dashboard.
 */
export async function getBioStudioData(): Promise<BioStudioData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/bio");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/dashboard");

  const { data: org } = await supabase
    .from("organizations")
    .select("type")
    .eq("id", membership.organization_id)
    .maybeSingle();

  if (!org || org.type !== "creator") redirect("/dashboard");

  const organizationId = membership.organization_id;

  const { data: page } = await supabase
    .from("bio_pages")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!page) redirect("/onboarding");

  const { data: blocks } = await supabase
    .from("bio_blocks")
    .select("*")
    .eq("bio_page_id", page.id)
    .order("position", { ascending: true });

  return { page, blocks: blocks ?? [] };
}
