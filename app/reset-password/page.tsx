import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getDictionary } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "تعيين كلمة مرور جديدة",
  robots: { index: false },
};

export default async function ResetPasswordPage() {
  const t = await getDictionary();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Recovery links grant a session; without one there is nothing to reset.
  if (!user) redirect("/forgot-password");

  return (
    <AuthShell>
      <div className="mb-6 space-y-1.5 text-center">
        <h1 className="text-xl font-bold">{t.auth.resetTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.resetSubtitle}</p>
      </div>
      <ResetPasswordForm />
    </AuthShell>
  );
}
