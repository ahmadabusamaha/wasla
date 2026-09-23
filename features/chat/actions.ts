"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { threadKeyFor } from "@/features/chat/thread-key";

export interface ChatResult {
  ok: boolean;
  error?: string;
}

async function myIdentity() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return null;
  return { supabase, userId: user.id, orgId: membership.organization_id };
}

export async function sendChatMessageAction(
  recipientOrgId: string,
  content: string,
  offerId?: string
): Promise<ChatResult> {
  const trimmed = content.trim().slice(0, 2000);
  if (!trimmed) return { ok: false, error: "empty_message" };

  const ctx = await myIdentity();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (recipientOrgId === ctx.orgId) return { ok: false, error: "self_message" };

  const { error } = await ctx.supabase.from("messages").insert({
    thread_key: offerId ? `offer:${offerId}` : threadKeyFor(ctx.orgId, recipientOrgId),
    sender_user_id: ctx.userId,
    sender_organization_id: ctx.orgId,
    recipient_organization_id: recipientOrgId,
    content: trimmed,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/messages");
  return { ok: true };
}

export async function markThreadReadAction(threadKey: string): Promise<void> {
  const ctx = await myIdentity();
  if (!ctx) return;
  await ctx.supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_key", threadKey)
    .eq("recipient_organization_id", ctx.orgId)
    .is("read_at", null);
}
