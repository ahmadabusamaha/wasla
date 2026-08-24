import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Affiliate click tracker: /go/{linkCode}
 * Increments the click counter and redirects to the destination.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("affiliate_links")
    .select("id, destination_url")
    .eq("code", code)
    .maybeSingle();

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Best-effort click count via RPC
  void supabase.rpc("increment_affiliate_click", { _link_id: link.id });

  return NextResponse.redirect(link.destination_url, 302);
}
