"use server";

export interface BriefResult {
  ok: boolean;
  brief?: string;
  suggestedBudget?: string;
  suggestedFormats?: string[];
  error?: string;
}

/**
 * AI Campaign Brief Generator (rule-based engine v1).
 * Takes a goal + budget + market → produces a structured brief.
 * Future: swap internals for LLM call with server-only API key.
 */
export async function generateCampaignBriefAction(
  goal: string,
  budget: number,
  market: string
): Promise<BriefResult> {
  if (!goal.trim() || budget <= 0 || !market.trim()) {
    return { ok: false, error: "أكمل الحقول الثلاثة" };
  }

  const goalLower = goal.toLowerCase();
  const isAwareness = /وعي|awareness|براند|brand|انتشار/.test(goalLower);
  const isSales = /بيع|sales|تحويل|conversion|متجر|store/.test(goalLower);
  const isLaunch = /إطلاق|launch|منتج جديد|new product/.test(goalLower);

  const creatorCount = Math.max(3, Math.min(Math.floor(budget / 500), 20));
  const microCount = Math.ceil(creatorCount * 0.6);
  const macroCount = creatorCount - microCount;
  const microBudget = Math.round(budget * 0.4);
  const macroBudget = budget - microBudget;

  const contentType = isSales
    ? ["فيديو مراجعة منتج", "Unboxing", "رابط أفلييت في البايو", "كود خصم حصري"]
    : isLaunch
      ? ["فيديو تشويقي Teaser", "Unboxing حصري", "بث مباشر للإطلاق", "ستوري تفاعلي"]
      : isAwareness
        ? ["فيديو قصير TikTok/Reels", "منشور دائم Instagram", "إشارة في فيديو YouTube", "تحدي Hashtag"]
        : ["فيديو مخصص", "منشور مدفوع", "Story تسويقي"];

  const timeline = creatorCount > 10 ? "3-4 أسابيع" : "2 أسبوع";
  const platforms = isSales
    ? ["Instagram Reels", "TikTok", "YouTube Shorts"]
    : ["TikTok", "Instagram", "YouTube"];

  const brief = [
    `📋 Brief الحملة`,
    ``,
    `🎯 الهدف: ${goal}`,
    `💰 الميزانية: $${budget.toLocaleString()}`,
    `🌍 السوق المستهدف: ${market}`,
    ``,
    `── استراتيجية الصناع ──`,
    `📊 إجمالي الصانعين المقترحين: ${creatorCount}`,
    `   • ${microCount} صانع Micro (10K-100K) — ميزانية $${microBudget.toLocaleString()}`,
    `   • ${macroCount} صانع Macro (100K+) — ميزانية $${macroBudget.toLocaleString()}`,
    ``,
    `── صيغ المحتوى ──`,
    ...contentType.map((f) => `   • ${f}`),
    ``,
    `── المنصات الأولوية ──`,
    ...platforms.map((p) => `   • ${p}`),
    ``,
    `── الجدول الزمني ──`,
    `   • المدة: ${timeline}`,
    `   • الأسبوع 1: إرسال العروض + تأكيد الصانعين`,
    `   • الأسبوع 2-${timeline.includes("4") ? "3" : "2"}: نشر المحتوى`,
    `   • الأسبوع الأخير: قياس النتائج + تحسين`,
    ``,
    `── مؤشرات النجاح ──`,
    `   • المشاهدات المتوقعة: ${(budget * 800).toLocaleString()}+`,
    `   • معدل التفاعل المستهدف: 5%+`,
    isSales ? `   • التحويلات: تتبع عبر أكواد الخصم` : `   • الوصول: ${Math.round(budget * 500).toLocaleString()}+ حساب`,
    ``,
    `── نصائح ──`,
    `   • امنح الصانع حرية إبداعية — المحتوى الطبيعي يتفوق`,
    `   • اطلب استخدام Hashtag موحد للحملة`,
    `   • راقب الأداء يومياً من لوحة وصلة`,
  ].join("\n");

  return {
    ok: true,
    brief,
    suggestedBudget: `$${budget.toLocaleString()}`,
    suggestedFormats: contentType,
  };
}
