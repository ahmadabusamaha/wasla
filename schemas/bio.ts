import { z } from "zod";

export const BIO_BACKGROUNDS = ["aurora", "rose", "ocean", "sand"] as const;
export const BIO_THEMES = ["default"] as const;

export const SOCIAL_PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "x",
  "website",
] as const;

export const BLOCK_TYPES = [
  "link",
  "social",
  "heading",
  "text",
  "image",
  "video",
  "brand",
  "affiliate",
  "discount",
  "email_capture",
] as const;

export type BlockTypeInput = (typeof BLOCK_TYPES)[number];

const urlField = z.string().trim().url("رابط غير صالح").max(500);

/** Page-level settings. */
export const BIO_BUTTON_STYLES = ["solid", "outline", "soft", "shadow"] as const;
export const BIO_ACCENTS = ["teal", "emerald", "purple", "rose", "amber", "blue", "slate"] as const;

export const bioPageSettingsSchema = z.object({
  title: z.string().trim().min(2, "العنوان قصير").max(60),
  description: z.string().trim().max(160, "الوصف طويل").optional(),
  avatar_url: z.string().trim().max(600).optional(),
  theme: z.enum(BIO_THEMES),
  background: z.enum(BIO_BACKGROUNDS),
  button_style: z.enum(BIO_BUTTON_STYLES).default("solid"),
  accent_color: z.enum(BIO_ACCENTS).default("teal"),
  published: z.boolean(),
});

export type BioPageSettingsInput = z.infer<typeof bioPageSettingsSchema>;

/**
 * Block create/update input. Validation is type-aware but intentionally
 * forgiving for unknown/future types (settings carries extras).
 */
export const bioBlockInputSchema = z.object({
  id: z.uuid().optional(), // present when updating
  type: z.enum(BLOCK_TYPES),
  title: z.string().trim().max(120).optional(),
  content: z.string().trim().max(280).optional(),
  url: urlField.optional(),
  image_url: z.string().trim().max(600).optional(),
  visible: z.boolean().optional(),
  platform: z.enum(SOCIAL_PLATFORMS).optional(),
  code: z.string().trim().max(40).optional(),
}).superRefine((v, ctx) => {
  if ((v.type === "link" || v.type === "social" || v.type === "affiliate" || v.type === "video") && !v.url) {
    ctx.addIssue({ code: "custom", path: ["url"], message: "الرابط مطلوب لهذا النوع" });
  }
  if ((v.type === "heading" || v.type === "link" || v.type === "social") && !v.title) {
    ctx.addIssue({ code: "custom", path: ["title"], message: "العنوان مطلوب لهذا النوع" });
  }
  if (v.type === "text" && !v.content) {
    ctx.addIssue({ code: "custom", path: ["content"], message: "النص مطلوب" });
  }
});

export type BioBlockInput = z.infer<typeof bioBlockInputSchema>;

/** Maps validated input into a bio_blocks row payload. */
export function toBlockRow(input: BioBlockInput): Record<string, unknown> {
  const settings: Record<string, unknown> = {};
  if (input.platform) settings.platform = input.platform;
  if (input.code) settings.code = input.code;
  if (input.type === "affiliate") settings.badge = settings.badge ?? "Affiliate";
  return {
    type: input.type,
    title: input.title ?? null,
    content: input.content ?? null,
    url: input.url ?? null,
    image_url: input.image_url ?? null,
    visible: input.visible ?? true,
    settings,
  };
}

export const avatarFileSchema = z.instanceof(File)
  .refine((f) => f.size <= 2 * 1024 * 1024, "الحد الأقصى 2MB")
  .refine(
    (f) => ["image/png", "image/jpeg", "image/webp"].includes(f.type),
    "صيغ مسموحة: PNG / JPG / WEBP"
  );
