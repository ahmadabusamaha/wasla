"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3Icon,
  GiftIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  SparklesIcon,
  UserRoundIcon,
} from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { useLocale, useT } from "@/components/providers/locale-provider";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboardIcon;
  soon?: boolean;
}

function useNavItems(): NavItem[] {
  const t = useT();
  return [
    { href: "/dashboard", label: t.dashboard.overview, icon: LayoutDashboardIcon },
    { href: "/dashboard/profile", label: t.dashboard.profile, icon: UserRoundIcon },
    { href: "/dashboard/bio", label: t.dashboard.bioPage, icon: SparklesIcon },
    { href: "/dashboard/offers", label: t.dashboard.offersSoon, icon: GiftIcon, soon: true },
    { href: "/dashboard/analytics", label: t.dashboard.analyticsSoon, icon: BarChart3Icon, soon: true },
    { href: "/dashboard/settings", label: t.dashboard.settings, icon: SettingsIcon },
  ];
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useT();
  const items = useNavItems();

  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        if (item.soon) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60"
            >
              <item.icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              <Badge variant="secondary" className="text-[10px]">
                {t.common.comingSoon}
              </Badge>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard({
  name,
  email,
  orgName,
}: {
  name: string;
  email: string;
  orgName: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <Avatar className="size-9">
        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
          {(name || email).slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{orgName}</p>
        <p dir="ltr" className="truncate text-xs text-muted-foreground">
          {email}
        </p>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  orgName,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  orgName: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRtl = locale === "ar";

  const sidebarBody = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col gap-5 p-4">
      <Link href="/" className="px-1 py-1">
        <Logo />
      </Link>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto space-y-3">
        <UserCard name={userName} email={userEmail} orgName={orgName} />
        <Separator />
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOutIcon className="size-4 ltr:rotate-180" />
            {t.nav.logout}
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 border-e bg-background lg:block">
        {sidebarBody()}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:hidden">
        <Logo withWordmark />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t.common.menu}>
              <MenuIcon className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={isRtl ? "right" : "left"} className="w-72 p-0">
            <SheetTitle className="sr-only">{t.common.menu}</SheetTitle>
            {sidebarBody(() => setMobileOpen(false))}
          </SheetContent>
        </Sheet>
      </header>

      {/* Content */}
      <main className="lg:ps-64">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
