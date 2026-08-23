import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBioPage } from "@/features/bio/queries";
import { getDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { PublicBioPageView } from "@/components/bio/public-bio-page";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  try {
    const result = await getPublicBioPage(username);
    if (!result) return {};

    const { page } = result;
    const title = `${page.title} (@${page.slug})`;
    const description =
      page.description ??
      `${page.title} on ${siteConfig.name} — ${siteConfig.taglineEn}`;

    return {
      title,
      description,
      alternates: {
        canonical: `${siteConfig.url}/${page.slug}`,
      },
      openGraph: {
        title,
        description,
        url: `${siteConfig.url}/${page.slug}`,
        type: "profile",
        ...(page.avatar_url ? { images: [{ url: page.avatar_url }] } : {}),
      },
      twitter: {
        card: page.avatar_url ? "summary_large_image" : "summary",
        title,
        description,
        ...(page.avatar_url ? { images: [page.avatar_url] } : {}),
      },
    };
  } catch {
    return {};
  }
}

export const dynamic = "force-dynamic";

export default async function UsernameBioPage({ params }: Props) {
  const { username } = await params;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,49}$/.test(username)) notFound();

  let result = null;
  try {
    result = await getPublicBioPage(username);
  } catch {
    // Supabase unreachable / not configured yet → friendly state below.
  }

  if (!result) {
    const t = await getDictionary();
    return (
      <div className="grid min-h-svh place-items-center bg-background px-4">
        <div className="text-center">
          <p className="text-5xl font-extrabold text-primary">404</p>
          <h1 className="mt-3 text-lg font-bold">{t.bio.notFoundTitle}</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            {t.bio.notFoundDesc}
          </p>
        </div>
      </div>
    );
  }

  return <PublicBioPageView page={result.page} blocks={result.blocks} />;
}
