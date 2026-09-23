"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/schemas/onboarding";
import type { OnboardingFormState } from "./form-state";

export async function completeOnboardingAction(
  _prev: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const parsed = onboardingSchema.safeParse({
    accountType: formData.get("accountType"),
    orgName: formData.get("orgName"),
    slug: formData.get("slug"),
    displayName: formData.get("displayName") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "not_authenticated" };

  const { accountType, orgName, slug, displayName } = parsed.data;

  // Slug must be free across organizations AND bio pages. RLS hides other
  // users' drafts, so the check runs through a SECURITY DEFINER RPC.
  const { data: slugAvailable, error: slugError } = await supabase.rpc(
    "slug_available",
    { _slug: slug }
  );

  if (slugError) return { status: "error", message: "generic" };

  if (!slugAvailable) {
    return {
      status: "error",
      fieldErrors: { slug: ["slug_taken"] },
    };
  }

  // Generate the id app-side: INSERT..RETURNING re-evaluates the row through
  // the SELECT policy, which cannot see the org before its owner membership
  // exists — a plain insert (minimal return) avoids that trap entirely.
  const orgId = crypto.randomUUID();

  const { error: orgError } = await supabase.from("organizations").insert({
    id: orgId,
    name: orgName,
    slug,
    type: accountType,
  });

  if (orgError) {
    return { status: "error", message: "generic" };
  }

  // Best-effort rollback helper (Supabase JS has no cross-table transactions).
  async function cleanup() {
    await supabase.from("organizations").delete().eq("id", orgId);
  }

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({ organization_id: orgId, user_id: user.id, role: "owner" });

  if (memberError) {
    await cleanup();
    return { status: "error", message: "generic" };
  }

  if (accountType === "creator") {
    const { error: creatorError } = await supabase
      .from("creator_profiles")
      .insert({
        organization_id: orgId,
        display_name: displayName ?? orgName,
      });
    if (creatorError) {
      await cleanup();
      return { status: "error", message: "generic" };
    }

    const { error: bioError } = await supabase.from("bio_pages").insert({
      organization_id: orgId,
      slug,
      title: displayName ?? orgName,
      published: false,
    });
    if (bioError) {
      await cleanup();
      return { status: "error", message: "generic" };
    }
  } else {
    const { error: companyError } = await supabase
      .from("company_profiles")
      .insert({ organization_id: orgId });
    if (companyError) {
      await cleanup();
      return { status: "error", message: "generic" };
    }
  }

  revalidatePath("/dashboard");

  // Best-effort referral credit (never blocks onboarding)
  const { creditReferralReward } = await import("@/features/referrals/actions");
  await creditReferralReward(user.id);

  redirect("/dashboard?welcome=1");
}
