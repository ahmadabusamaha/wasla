import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { getUserContext } from "@/features/dashboard/queries";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "الملف الشخصي",
  robots: { index: false },
};

export default async function ProfilePage() {
  const t = await getDictionary();
  const ctx = await getUserContext();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.editProfile}</h1>
      </header>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t.dashboard.profile}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            fullName={ctx.profile.full_name}
            phone={ctx.profile.phone ?? ""}
            bio={ctx.profile.bio ?? ""}
            email={ctx.email}
          />
        </CardContent>
      </Card>
    </div>
  );
}
