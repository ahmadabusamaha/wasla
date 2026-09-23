"use client";

import { toast } from "sonner";
import { CopyIcon, GiftIcon, UsersIcon } from "lucide-react";
import { useT } from "@/components/providers/locale-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";

export function ReferralCard({
  code,
  referredCount,
  earnedTotal,
  siteUrl,
}: {
  code: string;
  referredCount: number;
  earnedTotal: number;
  siteUrl: string;
}) {
  const t = useT();
  const { copy } = useCopy();
  const link = `${siteUrl}/signup?ref=${code}`;

  async function handleCopy() {
    const ok = await copy(link);
    if (ok) toast.success(t.referral.copied);
  }

  return (
    <Card className="border-emerald-500/25 bg-emerald-50/40 dark:bg-emerald-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GiftIcon className="size-4 text-emerald-600" />
          {t.referral.title}
        </CardTitle>
        <CardDescription>{t.referral.howItWorks}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <code dir="ltr" className="rounded-lg bg-muted px-3 py-2 text-sm font-bold">
            {code}
          </code>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={handleCopy}>
            <CopyIcon className="size-3.5" />
            {t.referral.copyLink}
          </Button>
        </div>
        <div className="flex gap-6 text-sm">
          <span className="flex items-center gap-1.5">
            <UsersIcon className="size-4 text-muted-foreground" />
            <strong>{referredCount}</strong> {t.referral.referredCount}
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            +${earnedTotal.toFixed(0)} {t.referral.earnedTotal}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
