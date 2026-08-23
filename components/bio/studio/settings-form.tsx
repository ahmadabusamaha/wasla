"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CameraIcon, Loader2Icon } from "lucide-react";
import {
  saveBioSettingsAction,
  uploadBioAvatarAction,
} from "@/features/bio/studio-actions";
import type { BioPage } from "@/types/database";
import { useT } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const BG_LABELS: Record<string, string> = {
  aurora: "Aurora",
  rose: "Rose",
  ocean: "Ocean",
  sand: "Sand",
};

export function SettingsForm({ page }: { page: BioPage }) {
  const t = useT();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(page.title);
  const [description, setDescription] = useState(page.description ?? "");
  const [avatarUrl, setAvatarUrl] = useState(page.avatar_url ?? "");
  const [background, setBackground] = useState<string>(page.background);
  const [published, setPublished] = useState(page.published);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadBioAvatarAction(fd);
    setUploading(false);
    if (res.ok && res.url) {
      setAvatarUrl(res.url);
      toast.success(t.studio.saved);
      router.refresh();
    } else {
      toast.error(res.error ?? t.errors.errorTitle);
    }
  }

  async function handleSave() {
    setSaving(true);
    const res = await saveBioSettingsAction({
      title,
      description: description || undefined,
      avatar_url: avatarUrl || undefined,
      theme: "default",
      background,
      published,
    });
    setSaving(false);
    if (res.ok) {
      toast.success(t.studio.saved);
      router.refresh();
    } else {
      toast.error(res.error ?? t.errors.errorTitle);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label={t.studio.changeAvatar}
          className="group relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-full border bg-muted"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-xl font-bold text-muted-foreground">
              {title.trim().charAt(0) || "?"}
            </span>
          )}
          <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
            {uploading ? (
              <Loader2Icon className="size-5 animate-spin text-white" />
            ) : (
              <CameraIcon className="size-5 text-white" />
            )}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleUpload(f);
            e.target.value = "";
          }}
        />
        <div>
          <Label>{t.studio.avatar}</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.studio.avatarHint}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bio-title">{t.studio.pageTitle}</Label>
          <Input
            id="bio-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio-bg">{t.studio.background}</Label>
          <Select value={background} onValueChange={setBackground}>
            <SelectTrigger id="bio-bg" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BG_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio-desc">{t.studio.description}</Label>
        <Textarea
          id="bio-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={160}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border p-4">
        <div>
          <p className="text-sm font-semibold">{t.studio.publish}</p>
          <p className="text-xs text-muted-foreground">
            {published ? t.dashboard.bioPublished : t.dashboard.bioDraft}
          </p>
        </div>
        <Switch checked={published} onCheckedChange={setPublished} />
      </div>

      <Button onClick={handleSave} disabled={saving} className="rounded-xl">
        {saving ? t.common.saving : t.common.save}
      </Button>
    </div>
  );
}
