"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MegaphoneIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import type { CampaignWithStats } from "@/features/campaigns/queries";
import type { Campaign, CampaignApplication } from "@/types/database";
import {
  applyToCampaignAction,
  createCampaignAction,
  updateCampaignStatusAction,
} from "@/features/campaigns/actions";
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

const CAMPAIGN_STATUS: Record<string, { label: string; className: string }> = {
  draft: { label: "مسودة", className: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400" },
  active: { label: "نشطة", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  paused: { label: "متوقفة", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  completed: { label: "مكتملة", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  cancelled: { label: "ملغاة", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

const APP_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "قيد المراجعة", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  accepted: { label: "مقبول ✓", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  rejected: { label: "مرفوض", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  shortlisted: { label: "مرشح", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  withdrawn: { label: "منسحب", className: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400" },
};

export function CampaignsView({
  isCompany,
  myCampaigns,
  discoverable,
  myApplications,
}: {
  isCompany: boolean;
  myCampaigns: CampaignWithStats[];
  discoverable: Array<Campaign & { company_name: string }>;
  myApplications: Array<CampaignApplication & { campaign_title: string; company_name: string }>;
}) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function act(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(t.studio.saved);
        router.refresh();
      } else {
        toast.error(res.error === "already_applied" ? t.campaigns.alreadyApplied : (res.error ?? t.errors.errorTitle));
      }
    });
  }

  return (
    <div className="space-y-6">
      {isCompany ? (
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <PlusIcon className="size-4" />
                {t.campaigns.createNew}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t.campaigns.createNew}</DialogTitle>
              </DialogHeader>
              <CreateCampaignForm
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

      {isCompany ? (
        myCampaigns.length === 0 ? (
          <EmptyState
            icon={MegaphoneIcon}
            title={t.campaigns.empty}
            description={t.campaigns.emptyHint}
          />
        ) : (
          myCampaigns.map((c) => {
            const status = CAMPAIGN_STATUS[c.status] ?? CAMPAIGN_STATUS.draft;
            return (
              <Card key={c.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{c.title}</p>
                      {c.description ? (
                        <p className="text-sm text-muted-foreground">{c.description}</p>
                      ) : null}
                    </div>
                    <Badge className={status.className} variant="secondary">
                      {status.label}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {c.budget ? (
                      <span className="font-medium text-foreground">
                        {c.budget.toLocaleString()} {c.currency}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <UsersIcon className="size-4" />
                      {c.applications_count} {t.campaigns.applications}
                      {c.accepted_count > 0 ? ` (${c.accepted_count} ✓)` : ""}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {c.status !== "active" && c.status !== "completed" && c.status !== "cancelled" ? (
                      <Button size="sm" variant="outline" className="rounded-lg"
                        disabled={pending}
                        onClick={() => act(() => updateCampaignStatusAction(c.id, "active"))}>
                        {t.campaigns.activate}
                      </Button>
                    ) : null}
                    {c.status === "active" ? (
                      <Button size="sm" variant="outline" className="rounded-lg"
                        disabled={pending}
                        onClick={() => act(() => updateCampaignStatusAction(c.id, "paused"))}>
                        {t.campaigns.pause}
                      </Button>
                    ) : null}
                    {c.status === "active" || c.status === "paused" ? (
                      <Button size="sm" variant="outline" className="rounded-lg"
                        disabled={pending}
                        onClick={() => act(() => updateCampaignStatusAction(c.id, "completed"))}>
                        {t.campaigns.complete}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )
      ) : (
        <>
          {myApplications.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">{t.campaigns.myApplications}</h2>
              {myApplications.map((app) => {
                const status = APP_STATUS[app.status] ?? APP_STATUS.pending;
                return (
                  <Card key={app.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                      <div>
                        <p className="text-sm font-semibold">{app.campaign_title}</p>
                        <p className="text-xs text-muted-foreground">{app.company_name}</p>
                      </div>
                      <Badge className={status.className} variant="secondary">
                        {status.label}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          ) : null}

          <section className="space-y-3">
            <h2 className="text-lg font-bold">{t.campaigns.discover}</h2>
            {discoverable.length === 0 ? (
              <EmptyState icon={MegaphoneIcon} title={t.campaigns.noDiscoverable} />
            ) : (
              discoverable.map((c) => {
                const applied = myApplications.some((a) => a.campaign_id === c.id);
                return (
                  <Card key={c.id}>
                    <CardContent className="space-y-2 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{c.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {c.company_name}
                            {c.budget ? ` · ${c.budget.toLocaleString()} ${c.currency}` : ""}
                          </p>
                        </div>
                        {applied ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            {t.campaigns.applied}
                          </Badge>
                        ) : (
                          <Button size="sm" className="rounded-lg"
                            disabled={pending}
                            onClick={() => act(() => applyToCampaignAction(c.id))}>
                            {t.campaigns.apply}
                          </Button>
                        )}
                      </div>
                      {c.description ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </section>
        </>
      )}
    </div>
  );
}

function CreateCampaignForm({ onDone }: { onDone: (ok: boolean) => void }) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);
    const res = await createCampaignAction({
      title,
      description: description || undefined,
      budget: budget ? Number(budget) : undefined,
      currency,
      status,
    });
    setSaving(false);
    if (res.ok) {
      toast.success(t.studio.saved);
      onDone(true);
    } else {
      toast.error(res.error ?? t.errors.errorTitle);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t.campaigns.fTitle}</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </div>
      <div className="space-y-1.5">
        <Label>{t.campaigns.fDescription}</Label>
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t.campaigns.fBudget}</Label>
          <Input type="number" dir="ltr" className="text-start" value={budget}
            onChange={(e) => setBudget(e.target.value)} min="0" placeholder="0" />
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
      <div className="space-y-1.5">
        <Label>{t.campaigns.fStatus}</Label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50">
          <option value="draft">{CAMPAIGN_STATUS.draft.label}</option>
          <option value="active">{CAMPAIGN_STATUS.active.label}</option>
        </select>
      </div>
      <Button onClick={handleCreate} disabled={saving || !title} className="w-full rounded-xl">
        {saving ? t.common.loading : t.campaigns.createNew}
      </Button>
    </div>
  );
}
