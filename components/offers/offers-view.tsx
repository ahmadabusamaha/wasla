"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckIcon,
  XIcon,
  SendIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import type { OfferWithItems } from "@/features/offers/queries";
import {
  respondToOfferAction,
  sendOfferAction,
  withdrawOfferAction,
} from "@/features/offers/actions";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  sent: { label: "مرسل", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  viewed: { label: "تم الاطلاع", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  negotiating: { label: "تفاوض", className: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  accepted: { label: "مقبول ✓", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  rejected: { label: "مرفوض", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  withdrawn: { label: "مسحوب", className: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400" },
  expired: { label: "منتهي", className: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400" },
  draft: { label: "مسودة", className: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400" },
};

interface ItemDraft {
  type: string;
  label: string;
  amount: string;
  quantity: string;
}

export function OffersView({
  offers,
  orgType,
  creators,
}: {
  offers: OfferWithItems[];
  orgType: string;
  creators: Array<{ id: string; name: string; slug: string }>;
  myOrgId: string;
}) {
  const t = useT();
  const router = useRouter();
  const isCompany = orgType === "company";
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function act(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(t.studio.saved);
        router.refresh();
      } else {
        toast.error(res.error ?? t.errors.errorTitle);
      }
    });
  }

  return (
    <div className="space-y-4">
      {isCompany ? (
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <PlusIcon className="size-4" />
                {t.offers.sendNew}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t.offers.sendNew}</DialogTitle>
              </DialogHeader>
              <ComposeOfferForm
                creators={creators}
                onDone={(ok) => {
                  if (ok) {
                    setOpen(false);
                    router.refresh();
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : null}

      {offers.length === 0 ? (
        <EmptyState
          title={t.offers.empty}
          description={isCompany ? t.offers.emptyCompanyHint : t.offers.emptyCreatorHint}
        />
      ) : (
        offers.map((offer) => {
          const status = STATUS_STYLE[offer.status] ?? STATUS_STYLE.draft;
          const canRespond =
            !isCompany && ["sent", "viewed", "negotiating"].includes(offer.status);
          const canWithdraw =
            isCompany && ["sent", "viewed", "negotiating"].includes(offer.status);

          return (
            <Card key={offer.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{offer.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {isCompany
                        ? `${t.offers.to}: ${offer.counterpartyName}`
                        : `${t.offers.from}: ${offer.counterpartyName}`}
                    </p>
                  </div>
                  <Badge className={status.className} variant="secondary">
                    {status.label}
                  </Badge>
                </div>

                {offer.message ? (
                  <p className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
                    {offer.message}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {offer.items.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1 text-xs font-medium"
                    >
                      {item.type === "cash"
                        ? `${item.label}: ${item.amount} ${offer.currency}`
                        : item.type === "commission"
                          ? `${item.label}: ${item.percentage ?? "—"}%`
                          : `${item.label}${item.quantity ? ` ×${item.quantity}` : ""}`}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(offer.created_at).toLocaleDateString("ar", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {(canRespond || canWithdraw) && (
                  <div className="flex gap-2 pt-1">
                    {canRespond ? (
                      <>
                        <Button
                          size="sm"
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                          disabled={pending}
                          onClick={() => act(() => respondToOfferAction(offer.id, "accepted"))}
                        >
                          <CheckIcon className="size-4" />
                          {t.offers.accept}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg text-destructive hover:text-destructive"
                          disabled={pending}
                          onClick={() => act(() => respondToOfferAction(offer.id, "rejected"))}
                        >
                          <XIcon className="size-4" />
                          {t.offers.reject}
                        </Button>
                      </>
                    ) : null}
                    {canWithdraw ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() => act(() => withdrawOfferAction(offer.id))}
                      >
                        <Trash2Icon className="size-4" />
                        {t.offers.withdraw}
                      </Button>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

function ComposeOfferForm({
  creators,
  onDone,
}: {
  creators: Array<{ id: string; name: string; slug: string }>;
  onDone: (ok: boolean) => void;
}) {
  const t = useT();
  const [creatorId, setCreatorId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState<ItemDraft[]>([
    { type: "cash", label: "", amount: "", quantity: "" },
  ]);
  const [saving, setSaving] = useState(false);

  function updateItem(index: number, patch: Partial<ItemDraft>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function handleSend() {
    setSaving(true);
    const parsedItems = items.map((item: ItemDraft) => ({
      type: item.type,
      label: item.label,
      amount: item.type === "cash" ? Number(item.amount) || undefined : undefined,
      quantity: item.quantity ? Number(item.quantity) : undefined,
    }));

    const res = await sendOfferAction({
      creatorOrganizationId: creatorId,
      title,
      message: message || undefined,
      currency,
      items: parsedItems,
    });
    setSaving(false);

    if (res.ok) {
      toast.success(t.offers.sentSuccess);
      onDone(true);
    } else {
      toast.error(res.error ?? t.errors.errorTitle);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t.offers.pickCreator}</Label>
        <Select value={creatorId} onValueChange={setCreatorId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t.offers.pickCreatorPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {creators.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>{t.offers.offerTitle}</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.offers.offerTitlePlaceholder}
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t.offers.message}</Label>
        <Textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.offers.messagePlaceholder}
          maxLength={1000}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t.offers.items}</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { type: "product", label: "", amount: "", quantity: "1" },
              ])
            }
            disabled={items.length >= 6}
          >
            <PlusIcon className="size-3.5" />
            {t.offers.addItem}
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="space-y-2 rounded-xl border p-3">
            <div className="flex gap-2">
              <Select
                value={item.type}
                onValueChange={(v) => updateItem(index, { type: v })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t.offers.itemCash}</SelectItem>
                  <SelectItem value="product">{t.offers.itemProduct}</SelectItem>
                  <SelectItem value="commission">{t.offers.itemCommission}</SelectItem>
                  <SelectItem value="affiliate">{t.offers.itemAffiliate}</SelectItem>
                </SelectContent>
              </Select>
              {items.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              ) : null}
            </div>
            <Input
              value={item.label}
              onChange={(e) => updateItem(index, { label: e.target.value })}
              placeholder={t.offers.itemLabelPlaceholder}
              maxLength={120}
            />
            {item.type === "cash" ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  dir="ltr"
                  className="text-start"
                  value={item.amount}
                  onChange={(e) => updateItem(index, { amount: e.target.value })}
                  placeholder="0"
                  min="1"
                />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="ILS">ILS</SelectItem>
                    <SelectItem value="JOD">JOD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : item.type === "commission" ? (
              <Input
                type="number"
                dir="ltr"
                className="text-start"
                value={item.amount}
                onChange={(e) => updateItem(index, { amount: e.target.value })}
                placeholder="10%"
                min="1"
                max="100"
              />
            ) : (
              <Input
                type="number"
                dir="ltr"
                className="text-start"
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: e.target.value })}
                placeholder="1"
                min="1"
              />
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={handleSend}
        disabled={saving || !creatorId || !title}
        className="w-full rounded-xl"
      >
        <SendIcon className="size-4" />
        {saving ? t.common.loading : t.offers.sendNew}
      </Button>
    </div>
  );
}
