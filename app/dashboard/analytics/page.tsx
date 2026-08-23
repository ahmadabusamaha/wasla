import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "الإحصائيات",
  robots: { index: false },
};

export default async function AnalyticsPage() {
  const t = await getDictionary();
  return (
    <EmptyState
      title={t.dashboard.analyticsSoon}
      description={t.common.comingSoon}
      className="mt-8"
    />
  );
}
