import { NextResponse, type NextRequest } from "next/server";
import { analyticsEventSchema } from "@/schemas/analytics";
import { createClient } from "@/lib/supabase/server";

/**
 * Public analytics ingestion endpoint.
 * Event types are whitelisted by Zod here and by a CHECK constraint in the
 * database; RLS allows anonymous INSERTs only for this table.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const supabase = await createClient();

  // Attribute the event to the owning organization so RLS lets the org
  // read its own analytics later.
  let organizationId = parsed.data.organization_id ?? null;
  if (!organizationId && parsed.data.bio_page_id) {
    const { data: page } = await supabase
      .from("bio_pages")
      .select("organization_id")
      .eq("id", parsed.data.bio_page_id)
      .maybeSingle();
    organizationId = page?.organization_id ?? null;
  }

  const { error } = await supabase.from("analytics_events").insert({
    event_type: parsed.data.event_type,
    bio_page_id: parsed.data.bio_page_id ?? null,
    bio_block_id: parsed.data.bio_block_id ?? null,
    organization_id: organizationId,
    visitor_id: parsed.data.visitor_id ?? null,
    referrer: parsed.data.referrer ?? null,
  });

  if (error) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
