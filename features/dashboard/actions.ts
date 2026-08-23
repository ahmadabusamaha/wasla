"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ProfileFormState } from "./form-state";

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional(),
  bio: z.string().trim().max(500).optional(),
});

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "not_authenticated" };

  // Keep auth metadata in sync with the profile row.
  await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      bio: parsed.data.bio ?? null,
    })
    .eq("id", user.id);

  if (profileError) return { status: "error", message: "generic" };

  revalidatePath("/dashboard/profile");
  return { status: "success" };
}
