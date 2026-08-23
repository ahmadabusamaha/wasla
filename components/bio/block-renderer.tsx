import { ExternalLinkIcon } from "lucide-react";
import type { BioBlock, SocialPlatform } from "@/types/database";
import { SocialIcon } from "@/components/shared/social-icons";
import { DiscountCodeChip } from "@/components/bio/discount-chip";
import { TrackableLink } from "@/components/bio/trackable-link";
import { toYouTubeEmbed } from "@/lib/bio-theme";
import { cn } from "@/lib/utils";

const LINK_BASE_CLASS =
  "group relative flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md";

function settingsOf(block: BioBlock): Record<string, unknown> {
  return typeof block.settings === "object" && block.settings !== null
    ? (block.settings as Record<string, unknown>)
    : {};
}

function GenericLinkBody({ block }: { block: BioBlock }) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{block.title}</p>
        {block.content ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {block.content}
          </p>
        ) : null}
      </div>
      <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
    </>
  );
}

/**
 * Renders one bio block by `type`.
 * The registry is intentionally open: unknown types fall back to a graceful
 * generic renderer, so new block kinds never break published pages.
 */
export function BioBlockItem({
  block,
  bioPageId,
}: {
  block: BioBlock;
  bioPageId: string;
}) {
  const settings = settingsOf(block);

  switch (block.type) {
    case "heading":
      return block.title ? (
        <h2 className="pt-4 text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {block.title}
        </h2>
      ) : null;

    case "text": {
      const body = (settings.content as string) ?? block.content ?? "";
      return body ? (
        <p className="rounded-xl border bg-card/70 px-4 py-3 text-center text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      ) : null;
    }

    case "social": {
      const platform = ((settings.platform as string) ?? "website") as SocialPlatform;
      return (
        <TrackableLink
          href={block.url ?? "#"}
          eventType="social_click"
          bioPageId={bioPageId}
          bioBlockId={block.id}
          aria-label={block.title ?? platform}
          className="flex items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-md"
        >
          <SocialIcon platform={platform} className="size-5" />
          <span>{block.title}</span>
        </TrackableLink>
      );
    }

    case "affiliate": {
      const badge = settings.badge as string | undefined;
      return (
        <TrackableLink
          href={block.url ?? "#"}
          eventType="affiliate_click"
          bioPageId={bioPageId}
          bioBlockId={block.id}
          className={cn(
            LINK_BASE_CLASS,
            "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{block.title}</p>
            {block.content ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {block.content}
              </p>
            ) : null}
          </div>
          {badge ? (
            <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
              {badge}
            </span>
          ) : null}
        </TrackableLink>
      );
    }

    case "discount":
      return (
        <div className="space-y-2">
          {block.url ? (
            <TrackableLink
              href={block.url}
              eventType="link_click"
              bioPageId={bioPageId}
              bioBlockId={block.id}
              className={LINK_BASE_CLASS}
            >
              <GenericLinkBody block={block} />
            </TrackableLink>
          ) : null}
          <DiscountCodeChip block={block} />
        </div>
      );

    case "image":
      return block.image_url ? (
        // User content may point at arbitrary future hosts; plain img keeps
        // published pages resilient without pre-registering remote patterns.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.image_url}
          alt={block.title ?? ""}
          loading="lazy"
          className="w-full rounded-2xl border object-cover shadow-sm"
        />
      ) : null;

    case "video": {
      if (!block.url) return null;
      const src = toYouTubeEmbed(block.url);
      return src ? (
        <div className="overflow-hidden rounded-2xl border shadow-sm">
          <iframe
            src={src}
            title={block.title ?? "Video"}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full"
          />
        </div>
      ) : null;
    }

    case "brand":
    case "campaign":
      return block.url || block.title ? (
        <TrackableLink
          href={block.url ?? "#"}
          eventType="link_click"
          bioPageId={bioPageId}
          bioBlockId={block.id}
          className={cn(LINK_BASE_CLASS, "bg-gradient-to-br from-card to-accent/50")}
        >
          {block.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.image_url}
              alt=""
              loading="lazy"
              className="size-10 shrink-0 rounded-lg border object-cover"
            />
          ) : null}
          <GenericLinkBody block={block} />
        </TrackableLink>
      ) : null;

    default:
      // Graceful fallback for unknown/future block types.
      if (!block.url && !block.title && !block.content) return null;
      return block.url ? (
        <TrackableLink
          href={block.url}
          eventType="link_click"
          bioPageId={bioPageId}
          bioBlockId={block.id}
          className={LINK_BASE_CLASS}
        >
          <GenericLinkBody block={block} />
        </TrackableLink>
      ) : (
        <p className="text-center text-sm text-muted-foreground">{block.content}</p>
      );
  }
}
