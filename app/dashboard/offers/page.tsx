import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { getUserContext } from "@/features/dashboard/queries";
import { listMyOffers, listCreatorsForOffer } from "@/features/offers/queries";
import { OffersView } from "@/components/offers/offers-view";

export const metadata: Metadata = {
  title: "العروض",
  robots: { index: false },
};

export default async function OffersPage() {
  const t = await getDictionary();
  const ctx = await getUserContext();
  const [{ offers, orgType }, creators] = await Promise.all([
    listMyOffers(),
    ctx.organization.type === "company" ? listCreatorsForOffer() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.offers.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orgType === "company" ? t.offers.companyDesc : t.offers.creatorDesc}
        </p>
      </header>

      <OffersView
        offers={offers}
        orgType={orgType}
        creators={creators}
        myOrgId={ctx.organization.id}
      />
    </div>
  );
}
