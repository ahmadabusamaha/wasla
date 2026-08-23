import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { getUserContext } from "@/features/dashboard/queries";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "الإعدادات",
  robots: { index: false },
};

export default async function SettingsPage() {
  const t = await getDictionary();
  const locale = await getLocale();
  const ctx = await getUserContext();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.settings}</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.dashboard.account}</CardTitle>
          <CardDescription>{ctx.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.onboarding.orgName}</span>
            <span className="font-medium">{ctx.organization.name}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Slug</span>
            <code dir="ltr" className="rounded bg-muted px-2 py-0.5">
              /{ctx.organization.slug}
            </code>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Role</span>
            <Badge variant="secondary">{ctx.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.dashboard.appearance}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t.common.language}</span>
          <LanguageSwitcher current={locale} />
        </CardContent>
      </Card>

      <Card className="border-destructive/25">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            {t.dashboard.dangerZone}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">{t.dashboard.deleteAccountSoon}</Badge>
        </CardContent>
      </Card>

      {/* Password reset goes through the existing secure flow */}
      <p className="text-sm text-muted-foreground">
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          {t.auth.forgotPassword}
        </Link>
      </p>
    </div>
  );
}
