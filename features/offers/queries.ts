import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Offer, OfferItem, Organization } from "@/types/database";

export type OfferWithItems = Offer & {
  items: OfferItem[];
  counterpartyName: string;
  counterpartySlug: string;
};

/** Lists offers for the current user's organization (sent or received). */
export async function listMyOffers(): Promise<{
  offers: OfferWithItems[];
  orgType: string;
  orgId: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(type)")
    .eq("user_id", user!.id)
    .limit(1)
    .maybeSingle();

  const rawOrg = membership?.organizations as unknown;
  const org = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;
  const orgType = (org as Organization)?.type ?? "creator";
  const orgId = membership!.organization_id;

  const isCompany = orgType === "company";
  const column = isCompany ? "company_organization_id" : "creator_organization_id";

  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .eq(column, orgId)
    .order("created_at", { ascending: false });

  if (!offers?.length) return { offers: [], orgType, orgId };

  const offerIds = offers.map((o) => o.id);
  const counterpartyColumn = isCompany ? "creator_organization_id" : "company_organization_id";
  const counterpartyIds = [...new Set(offers.map((o) => o[counterpartyColumn as keyof typeof o] as string))];

  const [{ data: items }, { data: counterparties }] = await Promise.all([
    supabase.from("offer_items").select("*").in("offer_id", offerIds),
    supabase.from("organizations").select("id, name, slug").in("id", counterpartyIds),
  ]);

  const itemsByOffer = new Map<string, OfferItem[]>();
  for (const item of items ?? []) {
    const list = itemsByOffer.get(item.offer_id) ?? [];
    list.push(item);
    itemsByOffer.set(item.offer_id, list);
  }

  const orgMap = new Map((counterparties ?? []).map((o) => [o.id, o]));

  const result: OfferWithItems[] = offers.map((offer) => {
    const cp = orgMap.get(offer[counterpartyColumn as keyof typeof offer] as string);
    return {
      ...offer,
      items: itemsByOffer.get(offer.id) ?? [],
      counterpartyName: cp?.name ?? "—",
      counterpartySlug: cp?.slug ?? "",
    };
  });

  return { offers: result, orgType, orgId };
}

/** Lists creator organizations for the offer composer. */
export async function listCreatorsForOffer(): Promise<
  Array<{ id: string; name: string; slug: string }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("type", "creator")
    .order("name");
  return data ?? [];
}
