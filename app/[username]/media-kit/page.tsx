import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/server";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PrinterIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `Media Kit — @${username}`, robots: { index: false } };
}

/**
 * Auto-generated Media Kit: stats, socials, categories, contact CTA.
 * Print-friendly (Ctrl/Cmd+P → PDF).
 */
export default async function MediaKitPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const t = await getDictionary();
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("bio_pages")
    .select("id, organization_id, slug, title, description, avatar_url")
    .eq("slug", username)
    .eq("published", true)
    .maybeSingle();
  if (!page) notFound();

  const [{ data: creator }, { data: socials }, { data: cats }, { count: viewCount }] =
    await Promise.all([
      supabase
        .from("creator_profiles")
        .select("display_name, bio, city, verified")
        .eq("organization_id", page.organization_id)
        .maybeSingle(),
      supabase
        .from("social_accounts")
        .select("platform, username, url, followers_count, engagement_rate, average_views")
        .eq("organization_id", page.organization_id)
        .order("followers_count", { ascending: false }),
      supabase
        .from("creator_categories")
        .select("categories(name_ar, name_en)")
        .eq(
          "creator_profile_id",
          (
            await supabase
              .from("creator_profiles")
              .select("id")
              .eq("organization_id", page.organization_id)
              .maybeSingle()
          ).data?.id ?? ""
        ),
      supabase
        .from("analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", page.organization_id)
        .eq("event_type", "bio_page_view"),
    ]);

  const totalFollowers = (socials ?? []).reduce(
    (sum, s) => sum + (s.followers_count ?? 0),
    0
  );
  const bestEngagement = Math.max(
    0,
    ...((socials ?? []).map((s) => s.engagement_rate ?? 0) as number[])
  );
  const name = creator?.display_name ?? page.title;

  return (
    <div className="min-h-svh bg-muted/20 print:bg-white">
      <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-10 print:pt-4">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link href={`/${page.slug}`} className="text-sm text-primary hover:underline">
            ← {t.common.back}
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <PrinterIcon className="size-4" />
            {t.mediakit.print}
          </button>
        </div>

        <Card className="overflow-hidden print:shadow-none">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-500 px-6 py-8 text-white print:py-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 border-2 border-white/60">
                {page.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={page.avatar_url} alt={name} className="size-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-white/20 text-3xl font-bold text-white">
                    {name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold">
                  {name}
                  {creator?.verified ? <span className="text-lg">✓</span> : null}
                </h1>
                <p className="mt-0.5 text-sm text-white/85">
                  {creator?.city ? `${creator.city} · ` : ""}@{page.slug}
                </p>
              </div>
            </div>
            {creator?.bio || page.description ? (
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/90">
                {creator?.bio ?? page.description}
              </p>
            ) : null}
          </div>

          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xl font-extrabold">
                  {totalFollowers >= 1000
                    ? `${(totalFollowers / 1000).toFixed(1)}K`
                    : totalFollowers}
                </p>
                <p className="text-xs text-muted-foreground">{t.mediakit.followers}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xl font-extrabold">{bestEngagement}%</p>
                <p className="text-xs text-muted-foreground">{t.mediakit.engagement}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xl font-extrabold">{viewCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">{t.mediakit.pageViews}</p>
              </div>
            </div>

            {(socials ?? []).length > 0 ? (
              <div>
                <h2 className="mb-2 text-sm font-bold">{t.mediakit.platforms}</h2>
                <div className="space-y-1.5">
                  {(socials ?? []).map((s) => (
                    <div
                      key={s.platform + s.url}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <span className="font-medium capitalize">
                        {s.platform}
                        {s.username ? (
                          <span className="ms-2 text-xs text-muted-foreground" dir="ltr">
                            {s.username}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(s.followers_count ?? 0).toLocaleString()} متابع
                        {s.engagement_rate ? ` · ${s.engagement_rate}%` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {(cats ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {(cats ?? []).map((c, i) => {
                  const cat = c.categories as unknown as { name_ar: string } | null;
                  return cat ? (
                    <Badge key={i} variant="secondary">{cat.name_ar}</Badge>
                  ) : null;
                })}
              </div>
            ) : null}

            <div className="rounded-xl border border-dashed p-4 text-center print:hidden">
              <p className="text-sm font-semibold">{t.mediakit.collabCta}</p>
              <Link
                href="/signup?type=company"
                className="mt-2 inline-block rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
              >
                {t.mediakit.sendOffer}
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-2 text-muted-foreground/70">
              <Logo withWordmark={false} className="scale-75" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
