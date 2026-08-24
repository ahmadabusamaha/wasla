import { z } from "zod";

const offerItemSchema = z.object({
  type: z.enum(["cash", "product", "commission", "affiliate", "other"]),
  label: z.string().trim().min(1, "وصف البند مطلوب").max(120),
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر").optional(),
  quantity: z.number().int().positive().max(999).optional(),
  percentage: z.number().min(0).max(100).optional(),
}).refine(
  (item) => item.type !== "cash" || (item.amount !== undefined && item.amount > 0),
  { message: "المبلغ المالي مطلوب للبند النقدي", path: ["amount"] }
);

export const createOfferSchema = z.object({
  creatorOrganizationId: z.uuid("اختر صانع محتوى"),
  title: z.string().trim().min(3, "عنوان العرض قصير").max(120),
  message: z.string().trim().max(1000).optional(),
  currency: z.enum(["USD", "ILS", "JOD"]).default("USD"),
  items: z.array(offerItemSchema).min(1, "أضف بندًا واحدًا على الأقل").max(6),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const offerDecisionSchema = z.object({
  offerId: z.uuid(),
  decision: z.enum(["accepted", "rejected"]),
});

export const campaignsSchema = z.object({
  title: z.string().trim().min(3, "عنوان الحملة قصير").max(120),
  description: z.string().trim().max(1000).optional(),
  budget: z.number().positive("الميزانية يجب أن تكون أكبر من صفر").optional(),
  currency: z.enum(["USD", "ILS", "JOD"]).default("USD"),
  status: z.enum(["draft", "active", "paused", "completed"]).default("draft"),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
});

export type CampaignInput = z.infer<typeof campaignsSchema>;
