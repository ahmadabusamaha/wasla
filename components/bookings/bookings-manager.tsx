"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarPlusIcon, Trash2Icon } from "lucide-react";
import type { BookingSlot, StoreProduct } from "@/types/database";
import {
  cancelSlotAction,
  generateSlotsAction,
} from "@/features/bookings/actions";
import { useT } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";

const STATUS_STYLE: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  booked: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400",
};

export function BookingsManager({
  slots,
  products,
}: {
  slots: Array<BookingSlot & { product_title: string }>;
  products: StoreProduct[];
}) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function cancel(id: string) {
    if (!confirm(t.bookings.cancelConfirm)) return;
    startTransition(async () => {
      const res = await cancelSlotAction(id);
      if (res.ok) {
        toast.success(t.studio.saved);
        router.refresh();
      } else {
        toast.error(res.error ?? t.errors.errorTitle);
      }
    });
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("ar", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <CalendarPlusIcon className="size-4" />
              {t.bookings.generate}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.bookings.generate}</DialogTitle>
            </DialogHeader>
            <GenerateForm
              products={products}
              onDone={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {slots.length === 0 ? (
        <EmptyState title={t.bookings.noSlots} description={t.bookings.noSlotsHint} />
      ) : (
        slots.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold">{s.product_title}</p>
                <p className="text-xs text-muted-foreground">{fmt(s.starts_at)}</p>
                {s.status === "booked" ? (
                  <p className="mt-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                    {s.buyer_name} · <span dir="ltr">{s.buyer_email}</span>
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={STATUS_STYLE[s.status]} variant="secondary">
                  {t.bookings[`status_${s.status}` as keyof typeof t.bookings] as string}
                </Badge>
                {s.status === "open" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    disabled={pending}
                    onClick={() => cancel(s.id)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function GenerateForm({
  products,
  onDone,
}: {
  products: StoreProduct[];
  onDone: () => void;
}) {
  const t = useT();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startHour, setStartHour] = useState("10");
  const [endHour, setEndHour] = useState("14");
  const [duration, setDuration] = useState("30");
  const [meetingLink, setMeetingLink] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    setSaving(true);
    const res = await generateSlotsAction(
      productId,
      date,
      Number(startHour),
      Number(endHour),
      Number(duration),
      meetingLink || undefined
    );
    setSaving(false);
    if (res.ok) {
      toast.success(t.studio.saved);
      onDone();
    } else {
      toast.error(
        res.error === "slots_overlap"
          ? t.bookings.overlapError
          : (res.error ?? t.errors.errorTitle)
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t.bookings.pickProduct}</Label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>{t.bookings.date}</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>{t.bookings.from}</Label>
          <Input
            type="number" dir="ltr" className="text-start" min="0" max="23"
            value={startHour} onChange={(e) => setStartHour(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t.bookings.to}</Label>
          <Input
            type="number" dir="ltr" className="text-start" min="1" max="24"
            value={endHour} onChange={(e) => setEndHour(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t.bookings.duration}</Label>
          <Input
            type="number" dir="ltr" className="text-start" min="15" max="240" step="15"
            value={duration} onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>
          {t.bookings.meetingLink} <span className="text-muted-foreground">({t.common.optional})</span>
        </Label>
        <Input
          dir="ltr" className="text-start" value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          placeholder="https://meet.google.com/…"
        />
      </div>
      <Button onClick={handleGenerate} disabled={saving || !productId} className="w-full rounded-xl">
        {saving ? t.common.loading : t.bookings.generate}
      </Button>
    </div>
  );
}
