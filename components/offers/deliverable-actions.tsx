"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon, PencilIcon, SendIcon, XIcon } from "lucide-react";
import {
  reviewDeliverableAction,
  submitDeliverableAction,
} from "@/features/deliverables/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function DeliverableActions({
  offerId,
  deliverableId,
  mode,
}: {
  offerId?: string;
  deliverableId?: string;
  mode?: "submit";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [feedback, setFeedback] = useState("");

  function submit() {
    if (!offerId) return;
    startTransition(async () => {
      const res = await submitDeliverableAction(offerId, title, url);
      if (res.ok) {
        toast.success("تم التسليم ✓");
        setTitle("");
        setUrl("");
        setExpanded(false);
        router.refresh();
      } else {
        toast.error(res.error ?? "خطأ");
      }
    });
  }

  function review(decision: "approved" | "revision_requested" | "rejected") {
    if (!deliverableId) return;
    startTransition(async () => {
      const res = await reviewDeliverableAction(
        deliverableId,
        decision,
        feedback || undefined
      );
      if (res.ok) {
        toast.success("تم ✓");
        router.refresh();
      } else {
        toast.error(res.error ?? "خطأ");
      }
    });
  }

  if (mode === "submit") {
    if (!expanded) {
      return (
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg"
          onClick={() => setExpanded(true)}
        >
          <SendIcon className="size-3.5" />
          تسليم عمل
        </Button>
      );
    }
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان العمل"
          maxLength={120}
        />
        <Input
          dir="ltr" className="text-start" value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https:// رابط المحتوى"
        />
        <div className="flex gap-2">
          <Button size="sm" className="rounded-lg" disabled={pending || !title || !url} onClick={submit}>
            {pending ? "…" : "إرسال للتسليم"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded(false)}>
            إلغاء
          </Button>
        </div>
      </div>
    );
  }

  // Review mode (company)
  if (!expanded) {
    return (
      <div className="flex gap-1.5">
        <Button size="sm" variant="outline" className="h-7 rounded-md text-xs"
          disabled={pending} onClick={() => review("approved")}>
          <CheckIcon className="size-3" /> اعتماد
        </Button>
        <Button size="sm" variant="outline" className="h-7 rounded-md text-xs"
          onClick={() => setExpanded(true)}>
          <PencilIcon className="size-3" /> تعديل/رفض
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Textarea
        rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)}
        placeholder="ملاحظاتك للصانع…"
      />
      <div className="flex gap-1.5">
        <Button size="sm" variant="outline" className="h-7 rounded-md text-xs"
          disabled={pending} onClick={() => review("revision_requested")}>
          طلب تعديل
        </Button>
        <Button size="sm" variant="outline" className="h-7 rounded-md text-xs text-destructive"
          disabled={pending} onClick={() => review("rejected")}>
          <XIcon className="size-3" /> رفض
        </Button>
      </div>
    </div>
  );
}
