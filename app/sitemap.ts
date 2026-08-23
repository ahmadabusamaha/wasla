import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/** Home + all published bio pages. Degrades gracefully without a DB. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  ];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bio_pages")
      .select("slug, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(500);

    if (error || !data) return base;

    return [
      ...base,
      ...data.map((row) => ({
        url: `${siteConfig.url}/${row.slug}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return base;
  }
}
