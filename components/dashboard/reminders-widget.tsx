"use client";

import Link from "next/link";
import { AlertTriangleIcon, ClockIcon } from "lucide-react";
import type { ReminderItem } from "@/features/dashboard/reminders";
import { useT } from "@/components/providers/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RemindersWidget({ items }: { items: ReminderItem[] }) {
  const t = useT();
  if (!items.length) return null;

  return (
    <Card className="border-amber-500/25">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClockIcon className="size-4 text-amber-600" />
          {t.reminders.title}
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
            {items.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
          >
            {item.urgent ? (
              <AlertTriangleIcon className="size-4 shrink-0 text-amber-600" />
            ) : (
              <ClockIcon className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{item.title}</span>
              <span className="block text-xs text-muted-foreground">{item.detail}</span>
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
