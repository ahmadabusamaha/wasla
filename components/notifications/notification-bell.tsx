"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellIcon } from "lucide-react";
import type { AppNotification } from "@/types/database";
import { markNotificationsReadAction } from "@/features/notifications/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPE_ICONS: Record<string, string> = {
  offer_received: "💼",
  offer_accepted: "✅",
  offer_rejected: "❌",
  offer_withdrawn: "🗑️",
  campaign_invite: "📢",
  application_update: "📋",
  new_sale: "💰",
  payout_processed: "💸",
  verification_update: "✓",
  general: "🔔",
};

export function NotificationBell({
  items,
  unreadCount,
}: {
  items: AppNotification[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && unreadCount > 0) {
          startTransition(async () => {
            await markNotificationsReadAction();
            router.refresh();
          });
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="الإشعارات">
          <BellIcon className="size-4.5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-0.5 -end-0.5 grid size-4.5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">لا إشعارات بعد</p>
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (n.link_url) router.push(n.link_url);
                setOpen(false);
              }}
              className={`flex w-full items-start gap-3 border-b p-3 text-start last:border-0 hover:bg-accent/50 ${!n.read_at ? "bg-accent/30" : ""}`}
            >
              <span className="text-lg leading-none">{TYPE_ICONS[n.type] ?? "🔔"}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{n.title}</span>
                {n.body ? (
                  <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
                ) : null}
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleDateString("ar")}
                </span>
              </span>
            </button>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
