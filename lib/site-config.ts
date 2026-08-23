export const siteConfig = {
  name: "وصلة",
  nameEn: "Wasla",
  tagline: "رابطك. تأثيرك. فرصك.",
  taglineEn: "Your Link. Your Influence. Your Opportunities.",
  description:
    "وصلة هي منصة تربط صناع المحتوى بالعلامات التجارية، وتساعدهم على بناء حضورهم الرقمي واستقبال فرص التعاون وتحويل تأثيرهم إلى دخل.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),
};
