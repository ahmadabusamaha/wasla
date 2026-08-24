import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { getUserContext } from "@/features/dashboard/queries";
import { getMyOrders, getMyProducts } from "@/features/store/queries";
import { StoreManager } from "@/components/store/store-manager";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "متجري",
  robots: { index: false },
};

export default async function StorePage() {
  const t = await getDictionary();
  const ctx = await getUserContext();

  if (ctx.organization.type !== "creator") {
    return <EmptyState title={t.store.title} description={t.store.creatorOnly} className="mt-8" />;
  }

  const [products, orders] = await Promise.all([getMyProducts(), getMyOrders()]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.store.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.store.subtitle}</p>
      </header>
      <StoreManager products={products} orders={orders} />
    </div>
  );
}
