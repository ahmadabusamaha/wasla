import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { Logo } from "@/components/shared/logo";

export async function SiteFooter() {
  const t = await getDictionary();
  const locale = await getLocale();

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row">
        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-start">
          <Logo />
          <p className="text-sm text-muted-foreground">{t.landing.footerTagline}</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Footer">
          <Link href="/#how-it-works" className="transition-colors hover:text-foreground">
            {t.nav.howItWorks}
          </Link>
          <Link href="/signup?type=creator" className="transition-colors hover:text-foreground">
            {t.nav.forCreators}
          </Link>
          <Link href="/signup?type=company" className="transition-colors hover:text-foreground">
            {t.nav.forCompanies}
          </Link>
          <Link href="/ahmad" className="transition-colors hover:text-foreground">
            {t.landing.demoHint}
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name} | {siteConfig.nameEn}.{" "}
          {t.landing.footerRights}
          {locale === "ar" ? "" : "."}
        </p>
      </div>
    </footer>
  );
}
