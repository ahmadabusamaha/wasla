import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "إعداد الحساب",
  robots: { index: false },
};

export default async function OnboardingPage({
  searchParams,
}: PageProps<"/onboarding">) {
  const { type } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  // Already onboarded → go straight to the dashboard.
  const { data: membership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (membership) redirect("/dashboard");

  const initialType =
    type === "creator" || type === "company" ? type : undefined;

  return (
    <AuthShell>
      <OnboardingForm initialType={initialType} />
    </AuthShell>
  );
}
