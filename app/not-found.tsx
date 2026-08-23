import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getDictionary();

  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden px-4">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid opacity-50" />
      <div className="text-center">
        <p className="text-gradient text-7xl font-extrabold tracking-tight">404</p>
        <h1 className="mt-4 text-xl font-bold">{t.errors.notFoundTitle}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t.errors.notFoundDesc}
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/">{t.common.backHome}</Link>
        </Button>
      </div>
    </div>
  );
}
