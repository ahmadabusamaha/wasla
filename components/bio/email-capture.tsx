"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EmailCaptureBlock({
  organizationId,
  blockTitle,
}: {
  organizationId: string;
  blockTitle: string;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    if (!email.includes("@")) return;
    await createClient().from("fan_contacts").insert({
      organization_id: organizationId,
      email: email.trim(),
      name: name.trim() || null,
      source: "bio_page",
    });
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          ✓ تم الاشتراك — شكراً لك!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border bg-card p-4">
      <p className="text-center text-sm font-semibold">{blockTitle}</p>
      <Input value={name} onChange={(e) => setName(e.target.value)}
        placeholder="اسمك (اختياري)" maxLength={60} />
      <Input type="email" dir="ltr" className="text-start" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="بريدك الإلكتروني" />
      <Button onClick={submit} disabled={!email.includes("@")} className="w-full rounded-lg" size="sm">
        اشترك
      </Button>
    </div>
  );
}
