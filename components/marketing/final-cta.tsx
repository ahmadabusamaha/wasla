import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";

export async function FinalCta() {
  const t = await getDictionary();

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 px-6 py-14 text-center text-white shadow-lg md:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_25%,white_1px,transparent_1px)] [background-size:22px_22px]"
          />
          <div className="relative space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {t.landing.finalCtaTitle}
            </h2>
            <p className="mx-auto max-w-md text-white/85">{t.landing.finalCtaSubtitle}</p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-3 rounded-xl bg-white text-teal-900 hover:bg-white/90"
            >
              <Link href="/signup">{t.landing.ctaCreatePage}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
