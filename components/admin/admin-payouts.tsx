"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "lucide-react";
import { updatePayoutStatusAction } from "@/features/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

const STATUS: Record<string, { label: string; className: string }> = {
  requested: { label: "مطلوب", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  processing: { label: "قيد المعالجة", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  paid: { label: "مدفوع ✓", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  rejected: { label: "مرفوض", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

export function AdminPayouts({
  payouts,
}: {
  payouts: Array<{
    id: string;
    amount: number;
    currency: string;
    method: string;
    account_details: string;
    status: string;
    org_name: string;
    created_at: string;
  }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function process(id: string, status: "paid" | "rejected") {
    if (!confirm(status === "paid" ? "تأكيد: تم تحويل المبلغ؟" : "رفض الطلب؟")) return;
    startTransition(async () => {
      const res = await updatePayoutStatusAction(id, status);
      if (res.ok) { toast.success("تم ✓"); router.refresh(); }
      else toast.error(res.error ?? "خطأ");
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">طلبات السحب</h1>
      {payouts.length === 0 ? (
        <EmptyState title="لا طلبات سحب بعد" />
      ) : (
        payouts.map((p) => {
          const s = STATUS[p.status] ?? STATUS.requested;
          return (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {p.amount.toLocaleString()} {p.currency} — {p.org_name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground" dir="ltr">
                    {p.method} · {p.account_details}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={s.className} variant="secondary">{s.label}</Badge>
                  {p.status === "requested" ? (
                    <>
                      <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                        disabled={pending} onClick={() => process(p.id, "paid")}>
                        <CheckIcon className="size-4" /> تم الدفع
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg text-destructive"
                        disabled={pending} onClick={() => process(p.id, "rejected")}>
                        <XIcon className="size-4" /> رفض
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
