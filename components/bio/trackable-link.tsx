"use client";

import type { MouseEvent } from "react";
import { trackEvent } from "@/lib/analytics/track";
import type { AnalyticsEventType } from "@/types/database";

interface TrackableLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  bioPageId?: string | null;
  bioBlockId?: string | null;
  eventType: Extract<
    AnalyticsEventType,
    "link_click" | "social_click" | "affiliate_click"
  >;
}

/** Anchor that reports a click event before navigating. */
export function TrackableLink({
  href,
  bioPageId,
  bioBlockId,
  eventType,
  onClick,
  rel,
  ...rest
}: TrackableLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    // Let modified clicks (new tab, download…) pass without extra handling.
    if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
    trackEvent({ event_type: eventType, bio_page_id: bioPageId, bio_block_id: bioBlockId });
  }

  const sponsored = eventType === "affiliate_click";

  return (
    <a
      href={href}
      target="_blank"
      rel={`${rel ? `${rel} ` : ""}noopener noreferrer${sponsored ? " sponsored" : " nofollow"}`}
      onClick={handleClick}
      {...rest}
    />
  );
}
