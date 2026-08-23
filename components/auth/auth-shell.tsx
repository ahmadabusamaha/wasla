import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { Logo } from "@/components/shared/logo";

interface AuthShellProps {
  children: React.ReactNode;
}

export async function AuthShell({ children }: AuthShellProps) {
  const t = await getDictionary();
  const locale = await getLocale();

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-60"
      />
      <Link href="/" className="mb-8 transition-opacity hover:opacity-80" aria-label={t.meta.title}>
        <Logo />
      </Link>
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        {locale === "ar"
          ? `${t.meta.title} — ${t.landing.footerTagline}`
          : `Wasla — ${t.landing.footerTagline}`}
      </p>
    </div>
  );
}
