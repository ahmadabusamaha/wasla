import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "اكتشف صناع المحتوى",
  description: "دليل صناع المحتوى على منصة وصلة — ابحث واكتشف المبدعين.",
};

export const dynamic = "force-dynamic";

export default async function CreatorsDirectory({
  searchParams,
}: PageProps<"/creators">) {
  const { q } = await searchParams;
  const t = await getDictionary();
  const supabase = await createClient();

  let query = supabase
    .from("organizations")
    .select("id, name, slug, description, creator_profiles(display_name, city, verified)")
    .eq("type", "creator")
    .limit(48);

  if (typeof q === "string" && q.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }

  const { data: creators } = await query;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t.discover.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{t.discover.subtitle}</p>

          <form action="/creators" className="mt-6 flex max-w-md gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" defaultValue={q ?? ""} placeholder={t.discover.searchPlaceholder}
                className="ps-9 rounded-xl" />
            </div>
            <Button type="submit" className="rounded-xl">{t.discover.search}</Button>
          </form>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(creators ?? []).map((c) => {
              const profile = c.creator_profiles as unknown as
                | { display_name: string; city: string | null; verified: boolean }
                | null;
              return (
                <Link key={c.id} href={`/creators/${c.slug}`}
                  className="group rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-gradient-to-br from-teal-600 to-emerald-500 font-bold text-white">
                        {c.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate font-semibold">
                        {profile?.display_name || c.name}
                        {profile?.verified ? <span className="text-sky-500">✓</span> : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {profile?.city ?? c.slug}
                      </p>
                    </div>
                  </div>
                  {c.description ? (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  ) : null}
                </Link>
              );
            })}
          </div>

          {(creators ?? []).length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">{t.discover.noResults}</p>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
