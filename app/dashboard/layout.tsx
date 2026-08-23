import { getUserContext } from "@/features/dashboard/queries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getUserContext();
  const displayName =
    ctx.profile.full_name || ctx.organization.name || ctx.email;

  return (
    <DashboardShell
      userName={displayName}
      userEmail={ctx.email}
      orgName={ctx.organization.name}
    >
      {children}
    </DashboardShell>
  );
}
