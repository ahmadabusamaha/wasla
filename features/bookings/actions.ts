"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface BookingResult {
  ok: boolean;
  error?: string;
}

async function myOrg() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return null;
  return { supabase, userId: user.id, orgId: membership.organization_id };
}

/** Creator generates open slots for a coaching product. */
export async function generateSlotsAction(
  productId: string,
  date: string,
  startHour: number,
  endHour: number,
  durationMinutes: number,
  meetingLink?: string
): Promise<BookingResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (startHour < 0 || endHour > 24 || startHour >= endHour)
    return { ok: false, error: "invalid_hours" };
  if (durationMinutes < 15 || durationMinutes > 240)
    return { ok: false, error: "invalid_duration" };

  const slots: Array<{
    product_id: string;
    organization_id: string;
    starts_at: string;
    ends_at: string;
    status: string;
    meeting_link: string | null;
  }> = [];
  const cursor = new Date(`${date}T${String(startHour).padStart(2, "0")}:00:00`);
  const end = new Date(`${date}T${String(endHour).padStart(2, "0")}:00:00`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime()))
    return { ok: false, error: "invalid_date" };

  while (cursor < end) {
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000);
    if (slotEnd > end) break;
    slots.push({
      product_id: productId,
      organization_id: ctx.orgId,
      starts_at: cursor.toISOString(),
      ends_at: slotEnd.toISOString(),
      status: "open",
      meeting_link: meetingLink?.trim() || null,
    });
    cursor.setTime(slotEnd.getTime());
  }

  if (!slots.length) return { ok: false, error: "no_slots" };

  const { error } = await ctx.supabase.from("booking_slots").insert(slots);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "slots_overlap" };
    return { ok: false, error: error.message };
  }
  revalidatePath("/dashboard/bookings");
  return { ok: true };
}

/** Public books an open slot (no login required). */
export async function bookSlotAction(
  slotId: string,
  buyerName: string,
  buyerEmail: string
): Promise<BookingResult> {
  if (!buyerName.trim() || !buyerEmail.includes("@"))
    return { ok: false, error: "invalid_input" };

  const supabase = await createClient();
  const { data: slot } = await supabase
    .from("booking_slots")
    .select("id, status")
    .eq("id", slotId)
    .eq("status", "open")
    .maybeSingle();
  if (!slot) return { ok: false, error: "slot_unavailable" };

  const { error } = await supabase
    .from("booking_slots")
    .update({
      status: "booked",
      buyer_name: buyerName.trim(),
      buyer_email: buyerEmail.trim(),
    })
    .eq("id", slotId)
    .eq("status", "open");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Creator cancels a slot. */
export async function cancelSlotAction(slotId: string): Promise<BookingResult> {
  const ctx = await myOrg();
  if (!ctx) return { ok: false, error: "unauthorized" };
  const { error } = await ctx.supabase
    .from("booking_slots")
    .update({ status: "cancelled" })
    .eq("id", slotId)
    .eq("organization_id", ctx.orgId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/bookings");
  return { ok: true };
}
