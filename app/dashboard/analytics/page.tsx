import type { Metadata } from "next";
import { EyeIcon, MousePointerClickIcon, Share2Icon, BadgePercentIcon } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { getUserContext } from "@/features/dashboard/queries";
import { getCreatorAnalytics } from "@/features/dashboard/analytics-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "الإحصائيات",
  robots: { index: false },
};

export default async function AnalyticsPage() {
  const t = await getDictionary();
  const ctx = await getUserContext();

  if (!ctx.bioPage) {
    return (
      <EmptyState
        title={t.dashboard.analyticsSoon}
        description={t.dashboard.bioNotCreated}
        className="mt-8"
      />
    );
  }

  const data = await getCreatorAnalytics(ctx.bioPage.id, ctx.organization.id);
  const maxDaily = Math.max(...data.dailyViews.map((d) => d.count), 1);

  const stats = [
    { label: "زيارات الصفحة (14 يوم)", value: data.totalViews, icon: EyeIcon },
    { label: "نقرات الروابط", value: data.totalClicks, icon: MousePointerClickIcon },
    { label: "نقرات السوشيال", value: data.socialClicks, icon: Share2Icon },
    { label: "نقرات الأفلييت", value: data.affiliateClicks, icon: BadgePercentIcon },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.analyticsSoon}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          /{ctx.bioPage.slug} — آخر ١٤ يومًا
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold">{s.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">الزيارات اليومية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-36 items-end gap-1.5" dir="ltr">
            {data.dailyViews.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {d.count > 0 ? d.count : ""}
                </span>
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all"
                  style={{ height: `${Math.max((d.count / maxDaily) * 100, 3)}%` }}
                />
                <span className="text-[9px] text-muted-foreground">
                  {new Date(d.day).toLocaleDateString("ar", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.topBlocks.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">أكثر المكونات نقرًا</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topBlocks.map((b, i) => (
              <div key={b.blockId} className="flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(b.clicks / data.topBlocks[0].clicks) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-end text-sm font-semibold">{b.clicks}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
