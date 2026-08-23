import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLinkIcon, SparklesIcon } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { getUserContext } from "@/features/dashboard/queries";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "صفحتي العامة",
  robots: { index: false },
};

export default async function BioDashboardPage() {
  const t = await getDictionary();
  const ctx = await getUserContext();

  if (ctx.organization.type !== "creator") {
    return (
      <EmptyState
        icon={SparklesIcon}
        title={t.dashboard.bioPage}
        description={t.common.comingSoon}
      />
    );
  }

  if (!ctx.bioPage) redirect("/onboarding");

  const page = ctx.bioPage;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.bioPage}</h1>
      </header>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
            <span>{page.title}</span>
            {page.published ? (
              <Badge
                variant="secondary"
                className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              >
                {t.dashboard.bioPublished}
              </Badge>
            ) : (
              <Badge variant="secondary">{t.dashboard.bioDraft}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <code dir="ltr" className="rounded-md bg-muted px-3 py-1.5 text-sm">
              wasla.com/{page.slug}
            </code>
            <Button asChild size="sm" variant="outline">
              <Link href={`/${page.slug}`} className="inline-flex items-center gap-1.5">
                {t.common.viewPage}
                <ExternalLinkIcon className="size-3.5" />
              </Link>
            </Button>
          </div>

          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            🎨 Bio Builder — {t.common.comingSoon}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
