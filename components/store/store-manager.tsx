"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon, CheckIcon, PackageIcon } from "lucide-react";
import type { StoreOrder, StoreProduct } from "@/types/database";
import {
  confirmOrderPaidAction,
  deleteStoreProductAction,
  saveStoreProductAction,
} from "@/features/store/actions";
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
import { EmptyState } from "@/components/shared/empty-state";

const TYPE_LABELS: Record<string, string> = {
  digital_download: "ملف رقمي",
  course: "دورة",
  coaching_call: "استشارة",
  membership: "عضوية",
  payment_link: "رابط دفع",
};

export function StoreManager({
  products,
  orders,
}: {
  products: StoreProduct[];
  orders: Array<StoreOrder & { product_title: string }>;
}) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StoreProduct | null>(null);
  const [pending, startTransition] = useTransition();

  function del(id: string) {
    if (!confirm(t.store.deleteConfirm)) return;
    startTransition(async () => {
      const res = await deleteStoreProductAction(id);
      if (res.ok) { toast.success(t.studio.saved); router.refresh(); }
      else toast.error(res.error ?? t.errors.errorTitle);
    });
  }

  function confirmPaid(orderId: string) {
    startTransition(async () => {
      const res = await confirmOrderPaidAction(orderId);
      if (res.ok) { toast.success(t.store.orderConfirmed); router.refresh(); }
      else toast.error(res.error ?? t.errors.errorTitle);
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{t.store.products}</h2>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl" onClick={() => setEditing(null)}>
                <PlusIcon className="size-4" />
                {t.store.addProduct}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? t.store.editProduct : t.store.addProduct}</DialogTitle>
              </DialogHeader>
              <ProductForm product={editing} onDone={(ok) => { if (ok) { setOpen(false); setEditing(null); router.refresh(); } }} />
            </DialogContent>
          </Dialog>
        </div>

        {products.length === 0 ? (
          <EmptyState icon={PackageIcon} title={t.store.noProducts} description={t.store.noProductsHint} />
        ) : (
          products.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{p.title}</p>
                    <Badge variant="secondary">{TYPE_LABELS[p.type] ?? p.type}</Badge>
                    {!p.is_active ? <Badge variant="secondary">{t.store.inactive}</Badge> : null}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {p.price} {p.currency} · {p.sales_count} {t.store.sales}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="rounded-lg"
                    onClick={() => { setEditing(p); setOpen(true); }}>
                    {t.studio.edit}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive"
                    disabled={pending} onClick={() => del(p.id)}>
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">{t.store.orders}</h2>
        {orders.length === 0 ? (
          <EmptyState title={t.store.noOrders} />
        ) : (
          orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {o.product_title} — {o.amount} {o.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.buyer_name} · {o.buyer_email}
                  </p>
                </div>
                {o.status === "pending" ? (
                  <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                    disabled={pending} onClick={() => confirmPaid(o.id)}>
                    <CheckIcon className="size-4" />
                    {t.store.confirmPaid}
                  </Button>
                ) : (
                  <Badge variant="secondary">{o.status}</Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

function ProductForm({
  product,
  onDone,
}: {
  product: StoreProduct | null;
  onDone: (ok: boolean) => void;
}) {
  const t = useT();
  const [type, setType] = useState<string>(product?.type ?? "digital_download");
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [currency, setCurrency] = useState(product?.currency ?? "USD");
  const [paymentLink, setPaymentLink] = useState(product?.payment_link_url ?? "");
  const [fileUrl, setFileUrl] = useState(product?.digital_file_url ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await saveStoreProductAction({
      id: product?.id,
      type,
      title,
      description: description || undefined,
      price: Number(price) || 0,
      currency,
      digital_file_url: type === "digital_download" ? fileUrl : undefined,
      payment_link_url: paymentLink || undefined,
      is_active: isActive,
    });
    setSaving(false);
    if (res.ok) { toast.success(t.studio.saved); onDone(true); }
    else toast.error(res.error ?? t.errors.errorTitle);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t.store.fType}</Label>
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50">
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>{t.studio.fTitle}</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </div>
      <div className="space-y-1.5">
        <Label>{t.studio.fContent}</Label>
        <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t.store.fPrice}</Label>
          <Input type="number" dir="ltr" className="text-start" value={price}
            onChange={(e) => setPrice(e.target.value)} min="0" />
        </div>
        <div className="space-y-1.5">
          <Label>{t.campaigns.fCurrency}</Label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50">
            <option value="USD">USD</option>
            <option value="ILS">ILS</option>
            <option value="JOD">JOD</option>
          </select>
        </div>
      </div>
      {type === "digital_download" ? (
        <div className="space-y-1.5">
          <Label>{t.store.fFileUrl}</Label>
          <Input dir="ltr" className="text-start" value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)} placeholder="https://drive.google.com/…" />
        </div>
      ) : null}
      <div className="space-y-1.5">
        <Label>{t.store.fPaymentLink}</Label>
        <Input dir="ltr" className="text-start" value={paymentLink}
          onChange={(e) => setPaymentLink(e.target.value)} placeholder="https://paypal.me/… أو رابط Paylink" />
        <p className="text-xs text-muted-foreground">{t.store.paymentLinkHint}</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
          className="size-4 rounded accent-teal-600" />
        {t.store.active}
      </label>
      <Button onClick={handleSave} disabled={saving || !title} className="w-full rounded-xl">
        {saving ? t.common.loading : t.common.save}
      </Button>
    </div>
  );
}
