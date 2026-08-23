import { z } from "zod";
import type { AnalyticsEventType } from "@/types/database";

/**
 * Public (unauthenticated) analytics event ingestion — the event_type is
 * additionally constrained by a CHECK constraint in the database.
 */
export const analyticsEventSchema = z.object({
  event_type: z.enum([
    "bio_page_view",
    "link_click",
    "social_click",
    "affiliate_click",
    "campaign_conversion",
  ] satisfies AnalyticsEventType[]),
  bio_page_id: z.uuid().nullable().optional(),
  bio_block_id: z.uuid().nullable().optional(),
  organization_id: z.uuid().nullable().optional(),
  visitor_id: z.string().max(64).nullable().optional(),
  referrer: z.url().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
