"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WalletIcon, ClockIcon, TrendingUpIcon, ArrowUpIcon } from "lucide-react";
import type { PayoutRequest, WalletTransaction } from "@/types/database";
import type { WalletSummary } from "@/features/wallet/queries";
import { requestPayoutAction } from "@/features/wallet/actions";
import { useT } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function WalletView({
  summary,
  transactions,
  payouts,
}: {
  summary: WalletSummary;
  transactions: WalletTransaction[];
  payouts: PayoutRequest[];
}) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();

  function requestPayout() {
    startTransition(async () => {
      const res = await requestPayoutAction(Number(amount), method, details);
      if (res.ok) {
        toast.success(t.wallet.payoutRequested);
        setOpen(false);
        setAmount(""); setDetails("");
        router.refresh();
      } else {
        toast.error(
          res.error === "insufficient_balance" ? t.wallet.insufficient :
          t.errors.errorTitle
        );
      }
    });
  }

  const cards = [
    { label: t.wallet.available, value: summary.available, icon: WalletIcon, highlight: true },
    { label: t.wallet.pending, value: summary.pending, icon: ClockIcon },
    { label: t.wallet.totalEarned, value: summary.totalEarned, icon: TrendingUpIcon },
    { label: t.wallet.totalWithdrawn, value: summary.totalWithdrawn, icon: ArrowUpIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className={c.highlight ? "border-primary/40" : ""}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${c.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                <c.icon className="size-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold">
                  {c.value.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{summary.currency}</span>
                </p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl" disabled={summary.available <= 0}>
              {t.wallet.requestPayout}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.wallet.requestPayout}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t.wallet.amount}</Label>
                <Input type="number" dir="ltr" className="text-start" value={amount}
                  onChange={(e) => setAmount(e.target.value)} min="1"
                  placeholder={`${summary.available}`} />
                <p className="text-xs text-muted-foreground">
                  {t.wallet.available}: {summary.available} {summary.currency}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>{t.wallet.method}</Label>
                <select value={method} onChange={(e) => setMethod(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50">
                  <option value="bank_transfer">{t.wallet.bankTransfer}</option>
                  <option value="wallet">{t.wallet.ewallet}</option>
                  <option value="cash_pickup">{t.wallet.cashPickup}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.wallet.accountDetails}</Label>
                <Textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)}
                  placeholder={t.wallet.accountDetailsPlaceholder} />
              </div>
              <Button onClick={requestPayout} disabled={pending || !amount || !details} className="w-full rounded-xl">
                {pending ? t.common.loading : t.wallet.submitRequest}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {payouts.length > 0 ? (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">{t.wallet.payoutHistory}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <span className="font-semibold">{p.amount} {p.currency}</span>
                <Badge variant="secondary">{p.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{t.wallet.transactions}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t.wallet.noTransactions}</p>
          ) : (
            transactions.slice(0, 30).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <div>
                  <p className="font-medium">{tx.description ?? tx.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString("ar")}
                  </p>
                </div>
                <span className={`font-bold ${tx.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  {tx.amount >= 0 ? "+" : ""}{tx.amount} {tx.currency}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
