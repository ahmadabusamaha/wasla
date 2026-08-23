"use client";

import { useEffect } from "react";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the digest for support without leaking internals to users.
    console.error("[wasla]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="grid min-h-svh place-items-center px-4" dir="rtl">
      <div className="text-center">
        <p className="text-5xl">⚠️</p>
        <h1 className="mt-4 text-xl font-bold">حدث خطأ ما</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          واجهنا مشكلة غير متوقعة. حاول تحديث الصفحة.
        </p>
        <Button onClick={reset} className="mt-6 rounded-xl">
          <RotateCcwIcon className="size-4" />
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );
}
