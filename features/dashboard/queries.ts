import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BioPage, Organization, Profile } from "@/types/database";

export interface UserContext {
  userId: string;
  email: string;
  profile: Profile;
  organization: Organization;
  role: string;
  bioPage: BioPage | null;
}

/**
 * Loads the signed-in user's active context: their profile, their first
 * organization membership, and (for creators) their public bio page.
 * Redirects to onboarding when no membership exists yet.
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

  if (!memberships?.organizations) redirect("/onboarding");

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
    profile: profile ?? {
      id: user.id,
      full_name: "",
      username: "",
      avatar_url: null,
      bio: null,
      phone: null,
      language: "ar",
      timezone: null,
      created_at: "",
      updated_at: "",
    },
    organization,
    role: memberships.role,
    bioPage,
  };
}
