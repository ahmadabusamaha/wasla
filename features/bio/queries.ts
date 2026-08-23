import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BioBlock, BioPage } from "@/types/database";

export interface PublicBioPage {
  page: BioPage;
  blocks: BioBlock[];
}

/**
 * Loads a published bio page with its visible ordered blocks.
 * Returns null when the slug is unknown or the page isn't published.
 */
export async function getPublicBioPage(
  username: string
): Promise<PublicBioPage | null> {
  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from("bio_pages")
    .select("*")
    .eq("slug", username)
    .eq("published", true)
    .maybeSingle();

  if (error) throw error;
  if (!page) return null;

  const { data: blocks } = await supabase
    .from("bio_blocks")
    .select("*")
    .eq("bio_page_id", page.id)
    .eq("visible", true)
    .order("position", { ascending: true });

  return { page, blocks: blocks ?? [] };
}
