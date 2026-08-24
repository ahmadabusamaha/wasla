import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { getWalletData } from "@/features/wallet/queries";
import { WalletView } from "@/components/wallet/wallet-view";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "المحفظة والأرباح",
  robots: { index: false },
};

export default async function WalletPage() {
  const t = await getDictionary();
  const data = await getWalletData();

  if (!data) {
    return <EmptyState title={t.wallet.title} className="mt-8" />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.wallet.title}</h1>
      </header>
      <WalletView summary={data.summary} transactions={data.transactions} payouts={data.payouts} />
    </div>
  );
}
