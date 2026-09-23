import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BioPage, Organization, Profile } from "@/types/database";

export interface UserContext {
  userId: string;
  email: string;
  profile: Profile;
  isAdmin: boolean;
  organization: Organization;
  role: string;
  bioPage: BioPage | null;
}

const EMPTY_PROFILE = (id: string): Profile => ({
  id,
  is_admin: false,
  full_name: "",
  username: "",
  avatar_url: null,
  bio: null,
  phone: null,
  language: "ar",
  timezone: null,
  referral_code: null,
  referred_by: null,
  created_at: "",
  updated_at: "",
});

/**
 * Loads the signed-in user's active context: their profile, their first
 * organization membership, and (for creators) their public bio page.
 *
 * Routing rules (guaranteed before return):
 * - No session            → /login
 * - Admin without an org  → /admin (platform admins don't need an org)
 * - No membership         → /onboarding
 * → organization is ALWAYS non-null on successful return.
 */
export async function getUserContext(): Promise<UserContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("organization_members")
      .select("role, organizations(*), organization_id")
      .eq("user_id", user.id)
      .order("created_at")
      .limit(1)
      .maybeSingle(),
  ]);

  const safeProfile = profile ?? EMPTY_PROFILE(user.id);

  // Platform admins without an organization go to the admin console.
  if (!memberships?.organizations) {
    if (safeProfile.is_admin) {
      redirect("/admin");
    }
    redirect("/onboarding");
  }

  // memberships.organizations is either the org object or a nested array
  // depending on the generated types — normalize it.
  const rawOrg = memberships.organizations as unknown;
  const organization = (
    Array.isArray(rawOrg) ? rawOrg[0] : rawOrg
  ) as Organization;

  let bioPage: BioPage | null = null;
  if (organization.type === "creator") {
    const { data } = await supabase
      .from("bio_pages")
      .select("*")
      .eq("organization_id", organization.id)
      .maybeSingle();
    bioPage = data ?? null;
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    profile: safeProfile,
    isAdmin: safeProfile.is_admin,
    organization,
    role: memberships.role,
    bioPage,
  };
}
