import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/types/database";

export interface ChatThread {
  thread_key: string;
  counterpartyOrgId: string;
  counterpartyName: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
}

export async function getMyThreads(): Promise<{
  threads: ChatThread[];
  myOrgId: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { threads: [], myOrgId: "" };

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return { threads: [], myOrgId: "" };
  const myOrgId = membership.organization_id;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_organization_id.eq.${myOrgId},recipient_organization_id.eq.${myOrgId}`)
    .order("created_at", { ascending: false })
    .limit(300);

  const byThread = new Map<string, typeof messages>();
  for (const m of messages ?? []) {
    const list = byThread.get(m!.thread_key) ?? [];
    list.push(m);
    byThread.set(m!.thread_key, list);
  }

  const counterpartyIds = new Set<string>();
  for (const [, list] of byThread) {
    const latest = list![0]!;
    const other =
      latest.sender_organization_id === myOrgId
        ? latest.recipient_organization_id
        : latest.sender_organization_id;
    if (other) counterpartyIds.add(other);
  }

  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name")
    .in("id", [...counterpartyIds]);
  const nameMap = new Map((orgs ?? []).map((o) => [o.id, o.name]));

  const threads: ChatThread[] = [];
  for (const [key, list] of byThread) {
    const latest = list![0]!;
    const other =
      latest.sender_organization_id === myOrgId
        ? latest.recipient_organization_id
        : latest.sender_organization_id;
    threads.push({
      thread_key: key,
      counterpartyOrgId: other ?? "",
      counterpartyName: nameMap.get(other ?? "") ?? "—",
      lastMessage: latest.content,
      lastAt: latest.created_at,
      unreadCount: list!.filter(
        (m) => m!.recipient_organization_id === myOrgId && !m!.read_at
      ).length,
    });
  }

  threads.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  return { threads, myOrgId };
}

export async function getThreadMessages(threadKey: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_key", threadKey)
    .order("created_at", { ascending: true })
    .limit(200);
  return (data ?? []) as ChatMessage[];
}
