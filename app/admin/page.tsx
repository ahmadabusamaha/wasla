import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2Icon,
  UsersIcon,
  SparklesIcon,
  BarChart3Icon,
  WalletIcon,
  ShieldCheckIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "لوحة الأدمن",
  robots: { index: false },
};

export default async function AdminPage() {
  const supabase = await createClient();

  const [users, orgs, pages, events, pendingPayouts, pendingVerifications] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("organizations").select("id", { count: "exact", head: true }),
      supabase
        .from("bio_pages")
        .select("id", { count: "exact", head: true })
        .eq("published", true),
      supabase.from("analytics_events").select("id", { count: "exact", head: true }),
      supabase
        .from("payout_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "requested"),
      supabase
        .from("verification_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const [{ data: recentOrgs }, { data: recentProfiles }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug, type, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("id, full_name, username, is_admin, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const stats = [
    { label: "المستخدمون", value: users.count ?? 0, icon: UsersIcon },
    { label: "المؤسسات", value: orgs.count ?? 0, icon: Building2Icon },
    { label: "صفحات منشورة", value: pages.count ?? 0, icon: SparklesIcon },
    { label: "أحداث التتبع", value: events.count ?? 0, icon: BarChart3Icon },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">لوحة تحكم المنصة</h1>
      </header>

      {/* Action cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/payouts"
          className="group rounded-2xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
              <WalletIcon className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold">طلبات السحب</p>
              <p className="text-xs text-muted-foreground">{pendingPayouts.count ?? 0} طلب معلق</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/verification"
          className="group rounded-2xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-sky-500/15 text-sky-600">
              <ShieldCheckIcon className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold">طلبات التوثيق</p>
              <p className="text-xs text-muted-foreground">{pendingVerifications.count ?? 0} طلب معلق</p>
            </div>
          </div>
        </Link>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">أحدث المؤسسات</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الرابط</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentOrgs ?? []).map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell><Badge variant="secondary">{org.type}</Badge></TableCell>
                    <TableCell><code dir="ltr" className="text-xs">/{org.slug}</code></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">أحدث المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المعرّف</TableHead>
                  <TableHead>الدور</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentProfiles ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                    <TableCell><code dir="ltr" className="text-xs">@{p.username}</code></TableCell>
                    <TableCell>
                      {p.is_admin ? (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" variant="secondary">admin</Badge>
                      ) : (
                        <Badge variant="secondary">user</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
