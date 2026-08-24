import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AppNotification } from "@/types/database";

export async function getMyNotifications(limit = 20): Promise<{
  items: AppNotification[];
  unreadCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], unreadCount: 0 };

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  const items = data ?? [];
  return {
    items,
    unreadCount: items.filter((n) => !n.read_at).length,
  };
}

export async function notifyUsers(
  userIds: string[],
  type: AppNotification["type"],
  title: string,
  body?: string,
  linkUrl?: string
): Promise<void> {
  if (!userIds.length) return;
  const supabase = await createClient();
  await supabase.from("notifications").insert(
    userIds.map((user_id) => ({
      user_id,
      type,
      title,
      body: body ?? null,
      link_url: linkUrl ?? null,
    }))
  );
}
