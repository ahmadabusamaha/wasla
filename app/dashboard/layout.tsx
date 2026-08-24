import { getUserContext } from "@/features/dashboard/queries";
import { getMyNotifications } from "@/features/notifications/queries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getUserContext();
  const notifications = await getMyNotifications(15);
  const displayName =
    ctx.profile.full_name || ctx.organization.name || ctx.email;

  return (
    <DashboardShell
      userName={displayName}
      userEmail={ctx.email}
      orgName={ctx.organization.name}
      notificationSlot={
        <NotificationBell
          items={notifications.items}
          unreadCount={notifications.unreadCount}
        />
      }
    >
      {children}
    </DashboardShell>
  );
}
