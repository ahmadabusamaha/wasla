import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "العروض",
  robots: { index: false },
};

export default async function OffersPage() {
  const t = await getDictionary();
  return (
    <EmptyState
      title={t.dashboard.offersSoon}
      description={t.common.comingSoon}
      className="mt-8"
    />
  );
}
