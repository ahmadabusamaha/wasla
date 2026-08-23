import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";

export async function Hero() {
  const t = await getDictionary();
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden">
      {/* Backdrop */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute -top-32 start-1/4 size-[28rem] rounded-full bg-teal-500/15 blur-3xl rtl:start-auto ltr:start-1/4" />
        <div className="absolute top-24 end-0 size-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-20 text-center md:pb-28 md:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent/60 px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">
          <Sparkles className="size-3.5 text-primary" />
          {t.landing.badge}
        </span>

        <h1 className="mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-gradient">{t.landing.heroTitle}</span>
        </h1>

        <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          {t.landing.heroSubtitle}
        </p>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="w-full min-w-44 rounded-xl shadow-sm sm:w-auto">
            <Link href="/signup?type=creator">
              {t.landing.ctaCreatePage}
              <Arrow className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full min-w-44 rounded-xl bg-card/70 backdrop-blur sm:w-auto"
          >
            <Link href="/signup?type=company">{t.landing.ctaImCompany}</Link>
          </Button>
        </div>

        <Link
          href="/ahmad"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          {t.landing.demoHint}
          <Arrow className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}
