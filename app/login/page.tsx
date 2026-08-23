import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "سجّل دخولك إلى وصلة لإدارة صفحتك وعروضك.",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { next } = await searchParams;
  const t = await getDictionary();
  const safeNext =
    typeof next === "string" && next.startsWith("/") ? next : undefined;

  return (
    <AuthShell>
      <div className="mb-6 space-y-1.5 text-center">
        <h1 className="text-xl font-bold">{t.auth.loginTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.loginSubtitle}</p>
      </div>
      <LoginForm next={safeNext} />
    </AuthShell>
  );
}
