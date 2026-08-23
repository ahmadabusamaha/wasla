"use client";

import { toast } from "sonner";
import { CheckIcon, CopyIcon, TagIcon } from "lucide-react";
import type { BioBlock } from "@/types/database";
import { useT } from "@/components/providers/locale-provider";
import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";

/** Discount code chip with tap-to-copy. */
export function DiscountCodeChip({ block }: { block: BioBlock }) {
  const t = useT();
  const { copied, copy } = useCopy();

  const code =
    typeof block.settings === "object" &&
    block.settings !== null &&
    "code" in block.settings
      ? String((block.settings as Record<string, unknown>).code ?? "")
      : "";

  if (!code) return null;

  async function handleCopy() {
    const ok = await copy(code);
    if (ok) toast.success(`${t.common.copied}: ${code}`);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-primary/10"
      aria-label={`${code} — ${t.bio.copyCode}`}
    >
      <span className="flex items-center gap-2 text-primary" dir="ltr">
        <TagIcon className="size-4" />
        {code}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium",
          copied ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground group-hover:text-primary"
        )}
      >
        {copied ? (
          <>
            <CheckIcon className="size-3.5" /> {t.common.copied}
          </>
        ) : (
          <>
            <CopyIcon className="size-3.5" /> {t.common.copy}
          </>
        )}
      </span>
    </button>
  );
}
