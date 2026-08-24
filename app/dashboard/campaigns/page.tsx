import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { getUserContext } from "@/features/dashboard/queries";
import {
  listMyCampaigns,
  listDiscoverableCampaigns,
  listMyApplications,
} from "@/features/campaigns/queries";
import { CampaignsView } from "@/components/campaigns/campaigns-view";

export const metadata: Metadata = {
  title: "الحملات",
  robots: { index: false },
};

export default async function CampaignsPage() {
  const t = await getDictionary();
  const ctx = await getUserContext();

  const isCompany = ctx.organization.type === "company";
  const [myCampaigns, discoverable, myApplications] = await Promise.all([
    isCompany ? listMyCampaigns() : Promise.resolve([]),
    !isCompany ? listDiscoverableCampaigns() : Promise.resolve([]),
    !isCompany ? listMyApplications() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.campaigns.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isCompany ? t.campaigns.companyDesc : t.campaigns.creatorDesc}
        </p>
      </header>

      <CampaignsView
        isCompany={isCompany}
        myCampaigns={myCampaigns}
        discoverable={discoverable}
        myApplications={myApplications}
      />
    </div>
  );
}
