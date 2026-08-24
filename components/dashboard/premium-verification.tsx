"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { subscribeProAction } from "@/features/premium/actions";
import { requestVerificationAction } from "@/features/verification/actions";
import { getMySubscription } from "@/features/premium/actions";

function PremiumCard() {
  const [pending, startTransition] = useTransition();
  const [reference, setReference] = useState("");
  const [sub, setSub] = useState<Awaited<ReturnType<typeof getMySubscription>> | null>(null);

  useEffect(() => {
    void getMySubscription().then(setSub);
  }, []);

  async function subscribe() {
    const res = await subscribeProAction(reference);
    if (res.ok) {
      toast.success("تم تفعيل Wasla Pro ⭐");
      const updated = await getMySubscription();
      setSub(updated);
    } else {
      toast.error(res.error ?? "خطأ");
    }
  }

  return (
    <Card className={sub?.active ? "border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          ⭐ Wasla Pro — {sub?.active ? "مشترك ✓" : "$9/شهر"}
        </CardTitle>
        <CardDescription>
          {sub?.active
            ? `صفر عمولة على المتجر + مميزات متقدمة${sub.periodEnd ? ` — حتى ${new Date(sub.periodEnd).toLocaleDateString("ar")}` : ""}`
            : "صفر عمولة على المتجر · تحليلات متقدمة · شارة Pro · أولوية الظهور"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sub?.active ? (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" variant="secondary">
            ⭐ Pro Member
          </Badge>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">رقم إشعار الدفع (PayPal/Paylink → pro@wasla.app)</Label>
              <Input dir="ltr" className="text-start max-w-md" value={reference}
                onChange={(e) => setReference(e.target.value)} placeholder="Transaction ID…" />
            </div>
            <Button size="sm" className="rounded-lg" disabled={pending || !reference}
              onClick={() => startTransition(() => { void subscribe(); })}>
              {pending ? "جارٍ التفعيل…" : "تفعيل الاشتراك"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VerificationCard() {
  const [links, setLinks] = useState("");
  const [pending, startTransition] = useTransition();

  function request() {
    startTransition(async () => {
      const res = await requestVerificationAction(links);
      if (res.ok) { toast.success("تم إرسال طلب التوثيق ✓"); setLinks(""); }
      else toast.error(res.error === "already_pending" ? "لديك طلب قيد المراجعة بالفعل" : (res.error ?? "خطأ"));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">✓ توثيق الحساب</CardTitle>
        <CardDescription>
          احصل على الشارة الزرقاء — أرسل روابط حساباتك للمراجعة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input dir="ltr" className="text-start" value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="https://youtube.com/@… · https://instagram.com/…" />
        <Button size="sm" variant="outline" className="rounded-lg"
          disabled={pending || !links} onClick={request}>
          {pending ? "جارٍ الإرسال…" : "إرسال طلب التوثيق"}
        </Button>
      </CardContent>
    </Card>
  );
}

export { PremiumCard, VerificationCard };
