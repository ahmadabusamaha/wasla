import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Show the wordmark next to the mark. */
  withWordmark?: boolean;
}

export function Logo({ className, withWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 shadow-sm"
      >
        <Link2 className="size-5 text-white" strokeWidth={2.4} />
      </span>
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight">وصلة</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Wasla
          </span>
        </span>
      ) : null}
    </span>
  );
}
