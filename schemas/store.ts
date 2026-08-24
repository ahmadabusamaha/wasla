import { z } from "zod";

export const storeProductSchema = z.object({
  id: z.uuid().optional(),
  type: z.enum(["digital_download", "course", "coaching_call", "membership", "payment_link"]),
  title: z.string().trim().min(2, "العنوان قصير").max(120),
  description: z.string().trim().max(600).optional(),
  price: z.number().min(0, "السعر غير صالح").max(100000),
  currency: z.enum(["USD", "ILS", "JOD"]).default("USD"),
  compare_at_price: z.number().positive().optional(),
  digital_file_url: z.string().trim().url().optional().or(z.literal("")),
  call_duration_minutes: z.number().int().min(15).max(240).optional(),
  payment_link_url: z.string().trim().url().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type StoreProductInput = z.infer<typeof storeProductSchema>;

export const storeOrderSchema = z.object({
  productId: z.uuid(),
  buyerName: z.string().trim().min(2, "الاسم مطلوب").max(80),
  buyerEmail: z.email("بريد غير صالح"),
  buyerPhone: z.string().trim().max(30).optional(),
  paymentReference: z.string().trim().max(200).optional(),
});

export type StoreOrderInput = z.infer<typeof storeOrderSchema>;
