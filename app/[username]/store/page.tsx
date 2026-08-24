import type { Metadata } from "next";
import Link from "next/link";
import { getPublicStore } from "@/features/store/queries";
import { getDictionary } from "@/lib/i18n/server";
import { Logo } from "@/components/shared/logo";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const store = await getPublicStore(username);
  if (!store) return {};
  return {
    title: `${store.orgName} — المتجر`,
    description: `تسوق من متجر ${store.orgName} على وصلة`,
  };
}

export default async function PublicStore({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const store = await getPublicStore(username);
  const t = await getDictionary();

  if (!store || store.products.length === 0) {
    return (
      <div className="grid min-h-svh place-items-center px-4">
        <div className="text-center">
          <p className="text-4xl">🛍️</p>
          <h1 className="mt-3 text-lg font-bold">المتجر غير متاح حالياً</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-muted/20">
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
        <header className="text-center">
          <h1 className="text-2xl font-extrabold">🛍️ متجر {store.orgName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.store.publicSubtitle}</p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {store.products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {p.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumbnail_url} alt={p.title} className="h-40 w-full object-cover" />
              ) : (
                <div className="grid h-28 place-items-center bg-gradient-to-br from-teal-600/10 to-emerald-500/10 text-4xl">
                  {p.type === "coaching_call" ? "📅" : p.type === "course" ? "🎓" : "📦"}
                </div>
              )}
              <CardContent className="space-y-2 p-4">
                <p className="font-semibold">{p.title}</p>
                {p.description ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                ) : null}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-lg font-extrabold text-primary">
                    {p.price === 0 ? "مجاني" : `${p.price} ${p.currency}`}
                  </p>
                  {p.payment_link_url ? (
                    <a href={p.payment_link_url} target="_blank" rel="noopener noreferrer"
                      className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                      {t.store.buyNow}
                    </a>
                  ) : (
                    <Link href={`/order/${p.id}`}
                      className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                      {t.store.buyNow}
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <footer className="mt-14 flex justify-center opacity-60">
          <Link href="/"><Logo withWordmark={false} className="scale-90" /></Link>
        </footer>
      </main>
    </div>
  );
}
