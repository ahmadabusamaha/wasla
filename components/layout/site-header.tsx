import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isRtl = locale === "ar";

  const links = [
    { href: "/#how-it-works", label: t.nav.howItWorks },
    { href: "/signup?type=creator", label: t.nav.forCreators },
    { href: "/signup?type=company", label: t.nav.forCompanies },
    { href: "/creators/leaderboard", label: "🏆 لوحة الصدارة" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" aria-label={t.meta.title} className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher current={locale} className="hidden sm:inline-flex" />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">{t.nav.login}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">{t.nav.signup}</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label={t.common.menu}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRtl ? "right" : "left"} className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border" role="presentation" />
                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-sm text-muted-foreground">{t.common.language}</span>
                  <LanguageSwitcher current={locale} />
                </div>
                <Button asChild variant="outline" className="mt-2 w-full">
                  <Link href="/login">{t.nav.login}</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
