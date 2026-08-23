"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BadgePercentIcon,
  Building2Icon,
  EyeIcon,
  EyeOffIcon,
  Heading1Icon,
  Image as ImageIcon,
  Link2Icon,
  PlusIcon,
  Share2Icon,
  TagIcon,
  Trash2Icon,
  TypeIcon,
  VideoIcon,
} from "lucide-react";
import type { BioBlock } from "@/types/database";
import { useT } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  addBioBlockAction,
  deleteBioBlockAction,
  moveBioBlockAction,
  toggleBioBlockVisibleAction,
  updateBioBlockAction,
} from "@/features/bio/studio-actions";
import { BLOCK_TYPES, SOCIAL_PLATFORMS } from "@/schemas/bio";

const TYPE_ICON = {
  link: Link2Icon,
  social: Share2Icon,
  heading: Heading1Icon,
  text: TypeIcon,
  image: ImageIcon,
  video: VideoIcon,
  brand: Building2Icon,
  affiliate: BadgePercentIcon,
  discount: TagIcon,
} as const;

const NEEDS_URL = new Set(["link", "social", "affiliate", "video"]);
const NEEDS_TITLE = new Set(["link", "social", "heading"]);

interface FieldValues {
  title: string;
  content: string;
  url: string;
  platform: string;
  code: string;
}

function emptyFields(): FieldValues {
  return { title: "", content: "", url: "", platform: "instagram", code: "" };
}

function fieldsFromBlock(b: BioBlock): FieldValues {
  const s =
    typeof b.settings === "object" && b.settings !== null
      ? (b.settings as Record<string, unknown>)
      : {};
  return {
    title: b.title ?? "",
    content: b.content ?? "",
    url: b.url ?? "",
    platform: (s.platform as string) ?? "instagram",
    code: (s.code as string) ?? "",
  };
}

export function BlocksManager({ blocks }: { blocks: BioBlock[] }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function run(key: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(key);
    const res = await fn();
    setBusy(null);
    if (!res.ok) toast.error(res.error ?? t.errors.errorTitle);
    else router.refresh();
  }

  return (
    <div className="space-y-3">
      {blocks.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t.studio.noBlocks}
        </p>
      ) : null}

      {blocks.map((block, index) => (
        <BlockRow
          key={block.id}
          block={block}
          first={index === 0}
          last={index === blocks.length - 1}
          busy={busy === block.id}
          onMove={(d) => run(block.id, () => moveBioBlockAction(block.id, d))}
          onToggle={(v) => run(block.id, () => toggleBioBlockVisibleAction(block.id, v))}
          onDelete={() => run(block.id, () => deleteBioBlockAction(block.id))}
          onSave={(vals) => run(block.id, () => updateBioBlockAction(block.id, { type: block.type, ...vals }))}
        />
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full rounded-xl border-dashed">
            <PlusIcon className="size-4" />
            {t.studio.addBlock}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.studio.addBlock}</DialogTitle>
          </DialogHeader>
          <AddBlockForm
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
  );
}

function BlockRow({
  block,
  first,
  last,
  busy,
  onMove,
  onToggle,
  onDelete,
  onSave,
}: {
  block: BioBlock;
  first: boolean;
  last: boolean;
  busy: boolean;
  onMove: (dir: "up" | "down") => void;
  onToggle: (visible: boolean) => void;
  onDelete: () => void;
  onSave: (vals: Partial<FieldValues>) => Promise<void>;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [vals, setVals] = useState<FieldValues>(fieldsFromBlock(block));
  const Icon = TYPE_ICON[block.type as keyof typeof TYPE_ICON] ?? Link2Icon;

  return (
    <div className="rounded-xl border bg-card p-3.5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{block.title || block.type}</p>
          <p dir="ltr" className="truncate text-start text-xs text-muted-foreground">
            {block.url || block.content}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {!block.visible ? (
            <Badge variant="secondary" className="me-1 hidden sm:inline-flex">
              {t.studio.hidden}
            </Badge>
          ) : null}
          <Button variant="ghost" size="icon" className="size-8" disabled={first || busy} aria-label="up"
            onClick={() => onMove("up")}><ArrowUpIcon className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="size-8" disabled={last || busy} aria-label="down"
            onClick={() => onMove("down")}><ArrowDownIcon className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="size-8" aria-label={t.studio.hide}
            onClick={() => onToggle(!block.visible)}>
            {block.visible ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditing((v) => !v)}
            aria-label={t.studio.edit}>
            <TypeIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={busy}
            aria-label={t.studio.delete} onClick={() => { if (confirm(t.studio.deleteConfirm)) onDelete(); }}>
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-3 space-y-3 border-t pt-3">
          {NEEDS_TITLE.has(block.type) || block.title !== null ? (
            <Field label={t.studio.fTitle}>
              <Input value={vals.title} onChange={(e) => setVals({ ...vals, title: e.target.value })} maxLength={120} />
            </Field>
          ) : null}
          {NEEDS_URL.has(block.type) ? (
            <Field label={t.studio.fUrl}>
              <Input dir="ltr" className="text-start" value={vals.url} onChange={(e) => setVals({ ...vals, url: e.target.value })} placeholder="https://" />
            </Field>
          ) : null}
          {block.type === "text" ? (
            <Field label={t.studio.fContent}>
              <Textarea rows={3} value={vals.content} onChange={(e) => setVals({ ...vals, content: e.target.value })} maxLength={280} />
            </Field>
          ) : null}
          {block.type === "discount" ? (
            <>
              <Field label={t.studio.fCode}>
                <Input dir="ltr" className="text-start" value={vals.code} onChange={(e) => setVals({ ...vals, code: e.target.value })} />
              </Field>
              <Field label={t.studio.fUrl}>
                <Input dir="ltr" className="text-start" value={vals.url} onChange={(e) => setVals({ ...vals, url: e.target.value })} placeholder="https://store.example" />
              </Field>
            </>
          ) : null}
          {block.type === "brand" || block.type === "image" ? (
            <Field label={t.studio.fImageUrl}>
              <Input dir="ltr" className="text-start" value={vals.content} onChange={(e) => setVals({ ...vals, content: e.target.value })} placeholder="/storage path or URL" />
            </Field>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setVals(fieldsFromBlock(block)); setEditing(false); }}>
              {t.common.cancel}
            </Button>
            <Button size="sm" className="rounded-lg"
              onClick={async () => { await onSave(vals); setEditing(false); }}>
              {t.common.save}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function AddBlockForm({ onDone }: { onDone: (ok: boolean) => void }) {
  const t = useT();
  const [type, setType] = useState<string>("link");
  const [vals, setVals] = useState<FieldValues>(emptyFields());
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    setSaving(true);
    const res = await addBioBlockAction({
      type,
      title: vals.title || undefined,
      content: vals.content || undefined,
      url: vals.url || undefined,
      platform: type === "social" ? vals.platform : undefined,
      code: vals.code || undefined,
    });
    setSaving(false);
    if (res.ok) onDone(true);
    else toast.error(res.error ?? t.errors.errorTitle);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {BLOCK_TYPES.map((bt) => {
          const Icon = TYPE_ICON[bt];
          return (
            <button key={bt} type="button" onClick={() => setType(bt)}
              aria-pressed={type === bt}
              className={`cursor-pointer rounded-xl border p-3 text-center transition-colors ${type === bt ? "border-primary bg-accent/60 ring-2 ring-primary/20" : "hover:border-primary/40"}`}>
              <Icon className={`mx-auto size-5 ${type === bt ? "text-primary" : "text-muted-foreground"}`} />
              <span className="mt-1.5 block text-xs font-medium">{t.studio[`type_${bt}` as keyof typeof t.studio] as string}</span>
            </button>
          );
        })}
      </div>

      {NEEDS_TITLE.has(type) ? (
        <Field label={t.studio.fTitle}>
          <Input value={vals.title} onChange={(e) => setVals({ ...vals, title: e.target.value })} maxLength={120} />
        </Field>
      ) : null}
      {NEEDS_URL.has(type) ? (
        <Field label={t.studio.fUrl}>
          <Input dir="ltr" className="text-start" value={vals.url} onChange={(e) => setVals({ ...vals, url: e.target.value })} placeholder="https://" />
        </Field>
      ) : null}
      {type === "social" ? (
        <Field label={t.studio.fPlatform}>
          <select
            value={vals.platform}
            onChange={(e) => setVals({ ...vals, platform: e.target.value })}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
      ) : null}
      {type === "text" ? (
        <Field label={t.studio.fContent}>
          <Textarea rows={3} value={vals.content} onChange={(e) => setVals({ ...vals, content: e.target.value })} maxLength={280} />
        </Field>
      ) : null}
      {type === "discount" ? (
        <>
          <Field label={t.studio.fCode}>
            <Input dir="ltr" className="text-start" value={vals.code} onChange={(e) => setVals({ ...vals, code: e.target.value })} />
          </Field>
          <Field label={t.studio.fUrl}>
            <Input dir="ltr" className="text-start" value={vals.url} onChange={(e) => setVals({ ...vals, url: e.target.value })} placeholder="https://store.example" />
          </Field>
        </>
      ) : null}

      <Button onClick={handleAdd} disabled={saving} className="w-full rounded-xl">
        {saving ? t.common.loading : t.studio.addBlock}
      </Button>
    </div>
  );
}
