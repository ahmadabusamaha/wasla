"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LanguagesIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TranslationsEditor({
  pageId,
  current,
}: {
  pageId: string;
  current: { en?: { title?: string; description?: string } };
}) {
  const t = useT();
  const router = useRouter();
  const [titleEn, setTitleEn] = useState(current.en?.title ?? "");
  const [descEn, setDescEn] = useState(current.en?.description ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("bio_pages")
      .update({
        translations: {
          ...(current as object),
          en: { title: titleEn.trim() || undefined, description: descEn.trim() || undefined },
        },
      })
      .eq("id", pageId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t.studio.saved);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <LanguagesIcon className="size-4" />
          {t.studio.translationsTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Title (English)</Label>
          <Input
            dir="ltr" className="text-start" value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)} maxLength={60}
            placeholder="Your display name in English"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Description (English)</Label>
          <Textarea
            dir="ltr" className="text-start" rows={2} value={descEn}
            onChange={(e) => setDescEn(e.target.value)} maxLength={160}
            placeholder="Short bio in English"
          />
        </div>
        <Button onClick={save} disabled={saving} size="sm" className="rounded-xl">
          {saving ? t.common.saving : t.common.save}
        </Button>
      </CardContent>
    </Card>
  );
}
