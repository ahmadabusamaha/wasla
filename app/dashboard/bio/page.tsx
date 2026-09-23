import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { getBioStudioData } from "@/features/bio/studio-queries";
import { SettingsForm } from "@/components/bio/studio/settings-form";
import { TranslationsEditor } from "@/components/bio/studio/translations-editor";
import { BlocksManager } from "@/components/bio/studio/blocks-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "صفحتي العامة",
  robots: { index: false },
};

export default async function BioDashboardPage() {
  const t = await getDictionary();
  const { page, blocks } = await getBioStudioData();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.bioPage}</h1>
          <code dir="ltr" className="mt-1 inline-block rounded-md bg-muted px-2 py-0.5 text-xs">
            /{page.slug}
          </code>
        </div>
        <div className="flex items-center gap-2">
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
          <Button asChild size="sm" variant="outline">
            <Link href={`/${page.slug}`} className="inline-flex items-center gap-1.5">
              {t.common.viewPage}
              <ExternalLinkIcon className="size-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t.studio.settingsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm page={page} />
        </CardContent>
      </Card>

      <TranslationsEditor
        pageId={page.id}
        current={(page.translations ?? {}) as { en?: { title?: string; description?: string } }}
      />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t.studio.blocksTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <BlocksManager blocks={blocks} />
        </CardContent>
      </Card>
    </div>
  );
}
