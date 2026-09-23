"use client";

import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types/database";

/** Client-side thread fetch (keeps chat interactive without full reloads). */
export async function getThreadMessages(threadKey: string): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_key", threadKey)
    .order("created_at", { ascending: true })
    .limit(200);
  return (data ?? []) as ChatMessage[];
}
