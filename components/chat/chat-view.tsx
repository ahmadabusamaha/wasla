"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SendIcon, MessageCircleIcon } from "lucide-react";
import type { ChatThread } from "@/features/chat/queries";
import type { ChatMessage } from "@/types/database";
import {
  markThreadReadAction,
  sendChatMessageAction,
} from "@/features/chat/actions";
import { getThreadMessages } from "@/features/chat/queries-client";
import { useT } from "@/components/providers/locale-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";

export function ChatView({
  threads,
  myOrgId,
}: {
  threads: ChatThread[];
  myOrgId: string;
}) {
  const t = useT();
  const router = useRouter();
  const [activeKey, setActiveKey] = useState<string | null>(
    threads[0]?.thread_key ?? null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  async function openThread(key: string, counterpartyOrgId: string) {
    setActiveKey(key);
    setLoading(true);
    const list = await getThreadMessages(key);
    setMessages(list);
    setLoading(false);
    void markThreadReadAction(key);
    void counterpartyOrgId;
  }

  function send(counterpartyOrgId: string) {
    if (!activeKey || !text.trim()) return;
    startTransition(async () => {
      const offerMatch = /^offer:(.+)$/.exec(activeKey);
      const res = await sendChatMessageAction(
        counterpartyOrgId,
        text,
        offerMatch?.[1]
      );
      if (res.ok) {
        setText("");
        const list = await getThreadMessages(activeKey);
        setMessages(list);
        router.refresh();
      } else {
        toast.error(res.error ?? t.errors.errorTitle);
      }
    });
  }

  const active = threads.find((th) => th.thread_key === activeKey) ?? null;

  if (!threads.length) {
    return (
      <EmptyState
        icon={MessageCircleIcon}
        title={t.chat.empty}
        description={t.chat.emptyHint}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <Card className="max-h-[480px] overflow-y-auto p-2">
        {threads.map((th) => (
          <button
            key={th.thread_key}
            type="button"
            onClick={() => openThread(th.thread_key, th.counterpartyOrgId)}
            aria-current={activeKey === th.thread_key ? "true" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl p-3 text-start transition-colors ${
              activeKey === th.thread_key ? "bg-accent" : "hover:bg-accent/50"
            }`}
          >
            <Avatar className="size-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                {th.counterpartyName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold">
                  {th.counterpartyName}
                </span>
                {th.unreadCount > 0 ? (
                  <Badge className="bg-primary text-[10px] text-primary-foreground">
                    {th.unreadCount}
                  </Badge>
                ) : null}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {th.lastMessage}
              </span>
            </span>
          </button>
        ))}
      </Card>

      <Card className="flex min-h-[420px] flex-col p-0">
        {!active ? (
          <p className="m-auto text-sm text-muted-foreground">{t.chat.pickThread}</p>
        ) : (
          <>
            <div className="border-b px-4 py-3">
              <p className="text-sm font-bold">{active.counterpartyName}</p>
            </div>
            <div className="flex max-h-[320px] flex-1 flex-col gap-2 overflow-y-auto p-4">
              {loading ? (
                <p className="m-auto text-sm text-muted-foreground">{t.common.loading}</p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_organization_id === myOrgId;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          mine
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-muted"
                        }`}
                      >
                        {m.content}
                        <span className={`mt-1 block text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleString("ar", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex gap-2 border-t p-3">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.chat.typeMessage}
                maxLength={2000}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(active.counterpartyOrgId);
                  }
                }}
              />
              <Button
                onClick={() => send(active.counterpartyOrgId)}
                disabled={pending || !text.trim()}
                className="shrink-0 rounded-xl"
                size="icon"
                aria-label={t.chat.send}
              >
                <SendIcon className="size-4 rtl:-scale-x-100" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
