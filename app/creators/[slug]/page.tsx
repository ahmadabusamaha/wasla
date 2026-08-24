
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLinkIcon, UsersIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CreatorPublicProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, description, creator_profiles(display_name, bio, city, verified)")
    .eq("slug", slug)
    .eq("type", "creator")
    .maybeSingle();

  if (!org) notFound();

  const profile = org.creator_profiles as unknown as {
    display_name: string;
    bio: string | null;
    city: string | null;
    verified: boolean;
  } | null;

  const { data: socials } = await supabase
    .from("social_accounts")
    .select("platform, url, followers_count")
    .eq("organization_id", org.id);

  const name = profile?.display_name || org.name;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-4 py-12">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar className="size-24 border-2 shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-teal-600 to-emerald-500 text-3xl font-bold text-white">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-2 text-2xl font-extrabold">
                {name}
                {profile?.verified ? (
                  <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400" variant="secondary">
                    ✓ موثّق
                  </Badge>
                ) : null}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile?.city ? `${profile.city} · ` : ""}@{org.slug}
              </p>
            </div>
            <Button asChild className="rounded-xl">
              <Link href={`/signup?type=company`}>أرسل عرض تعاون</Link>
            </Button>
          </div>

          {profile?.bio || org.description ? (
            <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
              {profile?.bio ?? org.description}
            </p>
          ) : null}

          {socials && socials.length > 0 ? (
            <Card className="mt-8">
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <UsersIcon className="size-4" />
                  منصات التواصل
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {socials.map((s) => (
                    <a key={s.platform + s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border p-3 text-sm transition-colors hover:bg-accent">
                      <span className="font-medium capitalize">{s.platform}</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        {s.followers_count > 0
                          ? `${(s.followers_count / 1000).toFixed(0)}K`
                          : ""}
                        <ExternalLinkIcon className="size-3.5" />
                      </span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
