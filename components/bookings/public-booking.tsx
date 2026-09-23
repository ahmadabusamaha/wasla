"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { BookingSlot } from "@/types/database";
import { bookSlotAction } from "@/features/bookings/actions";
import { useT } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PublicBooking({ slots }: { slots: BookingSlot[] }) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function book() {
    if (!selected) return;
    startTransition(async () => {
      const res = await bookSlotAction(selected, name, email);
      if (res.ok) {
        setDone(true);
      } else {
        toast.error(
          res.error === "slot_unavailable"
            ? t.bookings.takenError
            : (res.error ?? t.errors.errorTitle)
        );
      }
    });
  }

  if (slots.length === 0) return null;

  if (done) {
    return (
      <div className="rounded-xl border bg-emerald-50 p-5 text-center dark:bg-emerald-950/30">
        <p className="text-2xl">📅</p>
        <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {t.bookings.bookedSuccess}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <p className="text-sm font-bold">📅 {t.bookings.bookSlot}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {slots.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            aria-pressed={selected === s.id}
            className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${
              selected === s.id
                ? "border-primary bg-accent/60 ring-2 ring-primary/20"
                : "hover:border-primary/40"
            }`}
          >
            {new Date(s.starts_at).toLocaleString("ar", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="space-y-2 border-t pt-3">
          <div className="space-y-1">
            <Label className="text-xs">{t.store.buyerName}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.auth.email}</Label>
            <Input
              type="email" dir="ltr" className="text-start" value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            onClick={book}
            disabled={pending || !name.trim() || !email.includes("@")}
            className="w-full rounded-xl"
          >
            {pending ? t.common.loading : t.bookings.confirmBooking}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
