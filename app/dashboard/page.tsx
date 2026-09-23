import Link from "next/link";
import {
  ArrowUpRightIcon,
  BarChart3Icon,
  GiftIcon,
  SparklesIcon,
  UserRoundIcon,
} from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { getUserContext } from "@/features/dashboard/queries";
import { getMyReminders } from "@/features/dashboard/reminders";
import { RemindersWidget } from "@/components/dashboard/reminders-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardOverviewPage() {
  const t = await getDictionary();
  const ctx = await getUserContext();
  const reminders = await getMyReminders();
  const isCreator = ctx.organization.type === "creator";

  const checklist = [
    {
      label: t.dashboard.profile,
      done: Boolean(ctx.profile.full_name),
      href: "/dashboard/profile",
      icon: UserRoundIcon,
    },
    ...(isCreator
      ? [
          {
            label: t.dashboard.bioPage,
            done: Boolean(ctx.bioPage?.published),
            href: "/dashboard/bio",
            icon: SparklesIcon,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {t.dashboard.welcome.replace("{name}", ctx.profile.full_name || ctx.organization.name)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.dashboard.welcomeDesc}
        </p>
      </header>

      <RemindersWidget items={reminders} />

      {/* Getting started checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t.dashboard.stepsTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {checklist.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <div
                className={
                  item.done
                    ? "grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
                    : "grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"
                }
              >
                <item.icon className="size-5" />
              </div>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.done ? (
                <Badge variant="secondary">✓</Badge>
              ) : (
                <ArrowUpRightIcon className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
              )}
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Public page card (creators) */}
      {isCreator && ctx.bioPage ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              {t.dashboard.yourBioPage}
              {ctx.bioPage.published ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" variant="secondary">
                  {t.dashboard.bioPublished}
                </Badge>
              ) : (
                <Badge variant="secondary">{t.dashboard.bioDraft}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <code dir="ltr" className="rounded-md bg-muted px-2.5 py-1.5 text-sm">
              wasla.com/{ctx.bioPage.slug}
            </code>
            <Button asChild size="sm" variant="outline">
              <Link href={`/${ctx.bioPage.slug}`}>{t.common.viewPage}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Coming soon modules */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[t.dashboard.offersSoon, t.dashboard.campaignsSoon].map((label) => (
          <Card key={label} className="opacity-70">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                {label === t.dashboard.offersSoon ? (
                  <GiftIcon className="size-5" />
                ) : (
                  <BarChart3Icon className="size-5" />
                )}
              </div>
              <span className="text-sm font-medium">{label}</span>
              <Badge variant="secondary" className="ms-auto text-[10px]">
                {t.common.comingSoon}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
