import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Campaign, CampaignApplication } from "@/types/database";

export type CampaignWithStats = Campaign & {
  applications_count: number;
  accepted_count: number;
};

export async function listMyCampaigns(): Promise<CampaignWithStats[]> {
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

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("organization_id", membership!.organization_id)
    .order("created_at", { ascending: false });

  if (!campaigns?.length) return [];

  const ids = campaigns.map((c) => c.id);
  const { data: apps } = await supabase
    .from("campaign_applications")
    .select("campaign_id, status")
    .in("campaign_id", ids);

  const stats = new Map<string, { total: number; accepted: number }>();
  for (const a of apps ?? []) {
    const s = stats.get(a.campaign_id) ?? { total: 0, accepted: 0 };
    s.total++;
    if (a.status === "accepted") s.accepted++;
    stats.set(a.campaign_id, s);
  }

  return campaigns.map((c) => ({
    ...c,
    applications_count: stats.get(c.id)?.total ?? 0,
    accepted_count: stats.get(c.id)?.accepted ?? 0,
  }));
}

/** Active campaigns from other companies (for creators to discover). */
export async function listDiscoverableCampaigns(): Promise<
  Array<Campaign & { company_name: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(type)")
    .eq("user_id", user!.id)
    .limit(1)
    .maybeSingle();

  const rawOrg = membership?.organizations as unknown;
  const orgType = (Array.isArray(rawOrg) ? rawOrg[0] : rawOrg) as { type?: string } | undefined;
  if (orgType?.type !== "creator") return [];

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*, organizations!inner(name)")
    .eq("status", "active")
    .neq("organization_id", membership!.organization_id)
    .order("created_at", { ascending: false });

  return (campaigns ?? []).map((c) => ({
    ...c,
    company_name: (c as unknown as { organizations: { name: string } }).organizations?.name ?? "—",
  }));
}

export async function listMyApplications(): Promise<
  Array<CampaignApplication & { campaign_title: string; company_name: string }>
> {
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

  const { data: apps } = await supabase
    .from("campaign_applications")
    .select("*, campaigns!inner(title, organization_id, organizations!inner(name))")
    .eq("creator_organization_id", membership!.organization_id)
    .order("created_at", { ascending: false });

  return (apps ?? []).map((a) => {
    const campaign = a.campaigns as unknown as {
      title: string;
      organizations: { name: string };
    };
    return {
      ...a,
      campaign_title: campaign?.title ?? "—",
      company_name: campaign?.organizations?.name ?? "—",
    };
  });
}
