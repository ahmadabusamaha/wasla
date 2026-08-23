import { z } from "zod";

const slugPattern = /^[a-z0-9](?:[a-z0-9_-]{0,47}[a-z0-9])?$/;

export const onboardingSchema = z
  .object({
    accountType: z.enum(["creator", "company"]),
    orgName: z.string().trim().min(2, "اسم المؤسسة مطلوب").max(120),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, "الرابط قصير جدًا")
      .max(50)
      .regex(
        slugPattern,
        "الحروف الإنجليزية والأرقام والشرطة فقط (يبدأ وينتهي بحرف أو رقم)"
      ),
    displayName: z.string().trim().max(80).optional(),
  })
  .refine(
    (data) =>
      data.accountType === "company" ||
      (data.displayName && data.displayName.length >= 2),
    { message: "الاسم الظاهر مطلوب لصناع المحتوى", path: ["displayName"] }
  );

export type OnboardingInput = z.infer<typeof onboardingSchema>;
