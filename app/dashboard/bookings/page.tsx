import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { getMySlots, getMyCoachingProducts } from "@/features/bookings/queries";
import { BookingsManager } from "@/components/bookings/bookings-manager";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "حجوزات الاستشارات",
  robots: { index: false },
};

export default async function BookingsPage() {
  const t = await getDictionary();
  const [slots, products] = await Promise.all([
    getMySlots(),
    getMyCoachingProducts(),
  ]);

  if (!products.length) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{t.bookings.title}</h1>
        </header>
        <EmptyState
          title={t.bookings.noProduct}
          description={t.bookings.noProductHint}
          className="mt-8"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.bookings.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.bookings.subtitle}</p>
      </header>
      <BookingsManager slots={slots} products={products} />
    </div>
  );
}
