"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { avatarFileSchema, bioBlockInputSchema, bioPageSettingsSchema, toBlockRow } from "@/schemas/bio";

export interface StudioResult {
  ok: boolean;
  error?: string;
}

async function ownedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, userId: null, page: null } as const;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const { data: page } = await supabase
    .from("bio_pages")
    .select("id")
    .eq("organization_id", membership!.organization_id)
    .maybeSingle();

  return { supabase, userId: user.id, page } as const;
}

/** Saves page-level settings (identity + appearance + publish state). */
export async function saveBioSettingsAction(
  input: unknown
): Promise<StudioResult> {
  const parsed = bioPageSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: z_message(parsed.error) };
  }

  const { supabase, page } = await ownedPage();
  if (!page) return { ok: false, error: "unauthorized" };

  const { error } = await supabase
    .from("bio_pages")
    .update(parsed.data)
    .eq("id", page.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/bio");
  return { ok: true };
}

const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Uploads an avatar to the caller's private storage folder and returns its public URL. */
export async function uploadBioAvatarAction(
  formData: FormData
): Promise<StudioResult & { url?: string }> {
  const file = formData.get("file");
  const parsedFile = avatarFileSchema.safeParse(file);
  if (!parsedFile.success || !(file instanceof File)) {
    return { ok: false, error: z_message(parsedFile.error ?? undefined) };
  }

  const { supabase, userId } = await ownedPage();
  if (!userId || !userId.length) return { ok: false, error: "unauthorized" };

  const ext = AVATAR_EXTENSIONS[file.type] ?? "png";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  if (!data?.publicUrl) return { ok: false, error: "public_url_failed" };

  // Persist onto the page in one step.
  const { page } = await ownedPage();
  if (page) {
    const { error } = await supabase
      .from("bio_pages")
      .update({ avatar_url: data.publicUrl })
      .eq("id", page.id);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/bio");
  return { ok: true, url: data.publicUrl };
}

/** Creates a new block positioned last. */
export async function addBioBlockAction(
  input: unknown
): Promise<StudioResult> {
  const parsed = bioBlockInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: z_message(parsed.error) };

  const { supabase, page } = await ownedPage();
  if (!page) return { ok: false, error: "unauthorized" };

  const { data: last } = await supabase
    .from("bio_blocks")
    .select("position")
    .eq("bio_page_id", page.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("bio_blocks").insert({
    bio_page_id: page.id,
    position: (last?.position ?? 0) + 10,
    ...toBlockRow(parsed.data),
  } as import("@/types/database").Database["public"]["Tables"]["bio_blocks"]["Insert"]);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/bio");
  return { ok: true };
}

/** Updates an existing block's editable fields. */
export async function updateBioBlockAction(
  id: string,
  input: unknown
): Promise<StudioResult> {
  const parsed = bioBlockInputSchema.safeParse({ ...((input as object) ?? {}), id });
  if (!parsed.success) return { ok: false, error: z_message(parsed.error) };

  const { supabase, page } = await ownedPage();
  if (!page) return { ok: false, error: "unauthorized" };

  const { error } = await supabase
    .from("bio_blocks")
    .update(toBlockRow(parsed.data) as import("@/types/database").Database["public"]["Tables"]["bio_blocks"]["Update"])
    .eq("id", id)
    .eq("bio_page_id", page.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/bio");
  return { ok: true };
}

export async function toggleBioBlockVisibleAction(
  id: string,
  visible: boolean
): Promise<StudioResult> {
  const { supabase, page } = await ownedPage();
  if (!page) return { ok: false, error: "unauthorized" };

  const { error } = await supabase
    .from("bio_blocks")
    .update({ visible })
    .eq("id", id)
    .eq("bio_page_id", page.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/bio");
  return { ok: true };
}

export async function deleteBioBlockAction(id: string): Promise<StudioResult> {
  const { supabase, page } = await ownedPage();
  if (!page) return { ok: false, error: "unauthorized" };

  const { error } = await supabase
    .from("bio_blocks")
    .delete()
    .eq("id", id)
    .eq("bio_page_id", page.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/bio");
  return { ok: true };
}

/** Moves a block one slot up/down by swapping positions with its neighbor. */
export async function moveBioBlockAction(
  id: string,
  direction: "up" | "down"
): Promise<StudioResult> {
  const { supabase, page } = await ownedPage();
  if (!page) return { ok: false, error: "unauthorized" };

  const { data: blocks } = await supabase
    .from("bio_blocks")
    .select("id, position")
    .eq("bio_page_id", page.id)
    .order("position", { ascending: true });

  if (!blocks || blocks.length < 2) return { ok: true };

  const index = blocks.findIndex((b) => b.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= blocks.length) return { ok: true };

  await Promise.all([
    supabase.from("bio_blocks").update({ position: blocks[swapWith].position }).eq("id", blocks[index].id),
    supabase.from("bio_blocks").update({ position: blocks[index].position }).eq("id", blocks[swapWith].id),
  ]);

  revalidatePath("/dashboard/bio");
  return { ok: true };
}

// zod v4 helper — keeps action returns small and user-facing.
function z_message(error?: { issues: Array<{ message: string }> }): string {
  if (!error?.issues?.length) return "invalid";
  return error.issues.map((i) => i.message).join(" · ");
}
