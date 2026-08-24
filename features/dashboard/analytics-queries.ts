import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  socialClicks: number;
  affiliateClicks: number;
  dailyViews: Array<{ day: string; count: number }>;
  topBlocks: Array<{ blockId: string; clicks: number }>;
}

export async function getCreatorAnalytics(
  bioPageId: string,
  orgId: string
): Promise<AnalyticsData> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 14 * 86400000).toISOString();

  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, bio_block_id, created_at")
    .eq("organization_id", orgId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);

  const all = events ?? [];
  const views = all.filter((e) => e.event_type === "bio_page_view");
  const clicks = all.filter((e) => e.event_type === "link_click");
  const social = all.filter((e) => e.event_type === "social_click");
  const affiliate = all.filter((e) => e.event_type === "affiliate_click");

  // Daily views for last 14 days
  const dailyMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const v of views) {
    const key = v.created_at.slice(0, 10);
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }

  // Top blocks by clicks
  const blockMap = new Map<string, number>();
  for (const c of [...clicks, ...social, ...affiliate]) {
    if (c.bio_block_id) {
      blockMap.set(c.bio_block_id, (blockMap.get(c.bio_block_id) ?? 0) + 1);
    }
  }

  return {
    totalViews: views.length,
    totalClicks: clicks.length,
    socialClicks: social.length,
    affiliateClicks: affiliate.length,
    dailyViews: [...dailyMap.entries()].map(([day, count]) => ({ day, count })),
    topBlocks: [...blockMap.entries()]
      .map(([blockId, clicks]) => ({ blockId, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5),
  };
}
