import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrophyIcon, FlameIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "لوحة الصدارة",
  description: "أقوى صناع المحتوى على منصة وصلة.",
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, slug, creator_profiles(display_name, city, verified)")
    .eq("type", "creator")
    .limit(100);
  const { data: socials } = await supabase
    .from("social_accounts")
    .select("organization_id, followers_count, engagement_rate");
  const { data: pages } = await supabase
    .from("bio_pages")
    .select("organization_id")
    .eq("published", true);

  const socialMap = new Map<string, { followers: number; engagement: number }>();
  for (const s of socials ?? []) {
    const prev = socialMap.get(s.organization_id) ?? { followers: 0, engagement: 0 };
    socialMap.set(s.organization_id, {
      followers: prev.followers + (s.followers_count ?? 0),
      engagement: Math.max(prev.engagement, s.engagement_rate ?? 0),
    });
  }
  const publishedSet = new Set((pages ?? []).map((p) => p.organization_id));

  const scored = (orgs ?? [])
    .map((org) => {
      const profile = org.creator_profiles as unknown as
        | { display_name: string; city: string | null; verified: boolean }
        | null;
      const social = socialMap.get(org.id) ?? { followers: 0, engagement: 0 };
      let score = 0;
      score += Math.min(social.followers / 1000, 50);
      score += social.engagement * 2;
      score += publishedSet.has(org.id) ? 15 : 0;
      score += profile?.verified ? 15 : 0;
      return {
        name: profile?.display_name || org.name,
        slug: org.slug,
        city: profile?.city,
        verified: profile?.verified ?? false,
        followers: social.followers,
        engagement: social.engagement,
        score: Math.round(score),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-4 py-12">
          <div className="mb-10 text-center">
            <TrophyIcon className="mx-auto size-10 text-amber-500" />
            <h1 className="mt-3 text-3xl font-extrabold">لوحة الصدارة</h1>
            <p className="mt-2 text-muted-foreground">
              أقوى صناع المحتوى — مرتبون حسب النشاط والتفاعل والتوثيق
            </p>
          </div>
          <div className="space-y-2">
            {scored.map((c, i) => (
              <Link key={c.slug} href={`/creators/${c.slug}`}
                className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
                <span className="w-10 text-center text-xl font-extrabold">
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </span>
                <Avatar className="size-12">
                  <AvatarFallback className="bg-gradient-to-br from-teal-600 to-emerald-500 font-bold text-white">
                    {c.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-semibold">
                    {c.name}
                    {c.verified ? <span className="text-xs text-sky-500">✓</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.followers > 0 ? `${(c.followers / 1000).toFixed(0)}K متابع` : ""}
                    {c.engagement > 0 ? ` · ${c.engagement}% تفاعل` : ""}
                    {c.city ? ` · ${c.city}` : ""}
                  </p>
                </div>
                <div className="text-end">
                  <p className="flex items-center gap-1 text-lg font-extrabold text-primary">
                    <FlameIcon className="size-4" /> {c.score}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Wasla Score</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
