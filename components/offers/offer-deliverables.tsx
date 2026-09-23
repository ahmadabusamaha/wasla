import { getOfferDeliverables } from "@/features/deliverables/actions";
import { DeliverableActions } from "@/components/offers/deliverable-actions";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  submitted: "مُسلّم — بانتظار المراجعة",
  approved: "معتمد ✓",
  revision_requested: "مطلوب تعديل",
  rejected: "مرفوض",
  published: "منشور",
};

export async function OfferDeliverables({
  offerId,
  offerStatus,
  isCompany,
}: {
  offerId: string;
  offerStatus: string;
  isCompany: boolean;
}) {
  const deliverables = await getOfferDeliverables(offerId);
  const canSubmit = !isCompany && offerStatus === "accepted";

  return (
    <div className="space-y-2 border-t pt-3">
      <p className="text-xs font-bold text-muted-foreground">📦 تسليم المحتوى</p>
      {deliverables.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {canSubmit ? "لم تُسلّم أي عمل بعد — ابدأ من الزر أدناه" : "لا أعمال مسلّمة بعد"}
        </p>
      ) : (
        deliverables.map((d) => (
          <div key={d.id} className="rounded-lg border bg-muted/30 p-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="font-semibold">{d.title}</span>
              <Badge variant="secondary" className="text-[10px]">
                {STATUS_LABEL[d.status] ?? d.status}
              </Badge>
            </div>
            {d.content_url ? (
              <a
                href={d.content_url}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="mt-1 block truncate text-start text-primary hover:underline"
              >
                {d.content_url}
              </a>
            ) : null}
            {d.feedback ? (
              <p className="mt-1 text-muted-foreground">💬 {d.feedback}</p>
            ) : null}
            {isCompany && d.status === "submitted" ? (
              <div className="mt-2">
                <DeliverableActions deliverableId={d.id} />
              </div>
            ) : null}
          </div>
        ))
      )}
      {canSubmit ? <DeliverableActions offerId={offerId} mode="submit" /> : null}
    </div>
  );
}
