import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ReminderItem {
  id: string;
  kind: "offer_expiry" | "campaign_end" | "pending_application" | "pending_payout";
  title: string;
  detail: string;
  dueAt: string;
  link: string;
  urgent: boolean;
}

/** Upcoming deadlines for the current org (offers expiring, campaigns ending). */
export async function getMyReminders(): Promise<ReminderItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(type)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return [];

  const rawOrg = membership.organizations as unknown;
  const org = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;
  const orgType = (org as { type?: string })?.type ?? "";
  const orgId = membership.organization_id;
  const isCompany = orgType === "company";
  const now = Date.now();
  const soon = now + 7 * 86400000;
  const items: ReminderItem[] = [];

  // Offers expiring within 7 days (active statuses)
  const { data: offers } = await supabase
    .from("offers")
    .select("id, title, expires_at, status")
    .eq(isCompany ? "company_organization_id" : "creator_organization_id", orgId)
    .in("status", ["sent", "viewed", "negotiating"])
    .not("expires_at", "is", null)
    .order("expires_at");

  for (const o of offers ?? []) {
    const due = new Date(o.expires_at!).getTime();
    if (due > now && due <= soon + 30 * 86400000) {
      items.push({
        id: `offer-${o.id}`,
        kind: "offer_expiry",
        title: o.title ?? "عرض",
        detail: isCompany ? "ينتهي قريبًا" : "بانتظار ردّك — ينتهي قريبًا",
        dueAt: o.expires_at!,
        link: "/dashboard/offers",
        urgent: due <= soon,
      });
    }
  }

  if (isCompany) {
    // Pending applications count per campaign
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title")
      .eq("organization_id", orgId)
      .eq("status", "active");
    if (campaigns?.length) {
      const { data: apps } = await supabase
        .from("campaign_applications")
        .select("id, campaign_id")
        .in(
          "campaign_id",
          campaigns.map((c) => c.id)
        )
        .eq("status", "pending");
      const pendingCount = apps?.length ?? 0;
      if (pendingCount > 0) {
        items.push({
          id: "pending-apps",
          kind: "pending_application",
          title: `${pendingCount} طلب تعاون بانتظار المراجعة`,
          detail: "راجع الطلبات قبل انتهاء الحملات",
          dueAt: new Date().toISOString(),
          link: "/dashboard/campaigns",
          urgent: true,
        });
      }
    }
  }

  items.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  return items.slice(0, 8);
}
