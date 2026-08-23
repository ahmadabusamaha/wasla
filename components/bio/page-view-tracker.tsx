"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track";

/** Fires a single bio_page_view per mount (deduped per session). */
export function BioPageViewTracker({ bioPageId }: { bioPageId: string }) {
  useEffect(() => {
    const KEY = `wasla_viewed_${bioPageId}`;
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      // Private mode without storage — still count the view.
    }
    trackEvent({ event_type: "bio_page_view", bio_page_id: bioPageId });
  }, [bioPageId]);

  return null;
}
