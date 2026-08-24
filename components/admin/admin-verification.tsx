"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "lucide-react";
import { updateVerificationStatusAction } from "@/features/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export function AdminVerification({
  requests,
}: {
  requests: Array<{
    id: string;
    org_name: string;
    org_slug: string;
    org_type: string;
    documents: { links?: string; notes?: string } | null;
    created_at: string;
  }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function review(id: string, status: "approved" | "rejected") {
    if (!confirm(status === "approved" ? "اعتماد التوثيق؟" : "رفض الطلب؟")) return;
    startTransition(async () => {
      const res = await updateVerificationStatusAction(id, status);
      if (res.ok) { toast.success("تم ✓"); router.refresh(); }
      else toast.error(res.error ?? "خطأ");
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">طلبات التوثيق المعلقة</h1>
      {requests.length === 0 ? (
        <EmptyState title="لا طلبات معلقة" />
      ) : (
        requests.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {r.org_name}{" "}
                  <Badge variant="secondary" className="ms-1">{r.org_type}</Badge>
                </p>
                <code dir="ltr" className="text-xs text-muted-foreground">/{r.org_slug}</code>
              </div>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {r.documents?.links || "—"}
              </p>
              {r.documents?.notes ? (
                <p className="text-sm">{r.documents.notes}</p>
              ) : null}
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  disabled={pending} onClick={() => review(r.id, "approved")}>
                  <CheckIcon className="size-4" /> اعتماد
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg text-destructive"
                  disabled={pending} onClick={() => review(r.id, "rejected")}>
                  <XIcon className="size-4" /> رفض
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
