import type { AnalyticsEventType } from "@/types/database";

export interface TrackEventPayload {
  event_type: AnalyticsEventType;
  bio_page_id?: string | null;
  bio_block_id?: string | null;
  organization_id?: string | null;
}

/**
 * Session-scoped anonymous visitor id — no cookies, no PII.
 */
export function getVisitorId(): string {
  const KEY = "wasla_vid";
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

/** Fire-and-forget event tracking via sendBeacon/fetch. Never throws. */
export function trackEvent(payload: TrackEventPayload): void {
  try {
    const body = JSON.stringify({
      ...payload,
      visitor_id: getVisitorId(),
      referrer: document.referrer || null,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/event",
        new Blob([body], { type: "application/json" })
      );
    } else {
      void fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // Analytics must never break the page.
  }
}
