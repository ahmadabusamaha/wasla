import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "أنشئ حسابك في وصلة وابدأ ببناء صفحتك أو اكتشاف المشاهير.",
};

export default async function SignupPage() {
  const t = await getDictionary();

  return (
    <AuthShell>
      <div className="mb-6 space-y-1.5 text-center">
        <h1 className="text-xl font-bold">{t.auth.signupTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.signupSubtitle}</p>
      </div>
      <SignupForm />
    </AuthShell>
  );
}
