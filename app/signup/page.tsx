import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "أنشئ حسابك في وصلة وابدأ ببناء صفحتك أو اكتشاف المشاهير.",
};

export default async function SignupPage({
  searchParams,
}: PageProps<"/signup">) {
  const t = await getDictionary();
  const { ref } = await searchParams;
  const referralCode =
    typeof ref === "string" && /^[a-z0-9]{6,12}$/i.test(ref.trim())
      ? ref.trim().toLowerCase()
      : undefined;

  return (
    <AuthShell>
      <div className="mb-6 space-y-1.5 text-center">
        <h1 className="text-xl font-bold">{t.auth.signupTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.signupSubtitle}</p>
        {referralCode ? (
          <p className="mx-auto mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            🎉 {t.referral.title} — {referralCode}
          </p>
        ) : null}
      </div>
      <SignupForm referralCode={referralCode} />
    </AuthShell>
  );
}
