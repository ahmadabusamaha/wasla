"use client";

import { useState } from "react";
import Link from "next/link";
import type { BioBlock, BioPage } from "@/types/database";
import { getBioBackground, getAccent, getFontClass } from "@/lib/bio-theme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/shared/logo";
import { BioBlockItem } from "@/components/bio/block-renderer";
import { BioPageViewTracker } from "@/components/bio/page-view-tracker";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/providers/locale-provider";

interface PublicBioPageProps {
  page: BioPage;
  blocks: BioBlock[];
}

/**
 * The public creator page served at wasla.com/{username}.
 * Mobile-first, RTL/LTR aware, and fully driven by database content.
 * Supports the creator's English translation when available.
 */
export function PublicBioPageView({ page, blocks }: PublicBioPageProps) {
  const t = useT();
  const background = getBioBackground(page.background);

  const translations =
    typeof page.translations === "object" && page.translations !== null
      ? (page.translations as { en?: { title?: string; description?: string } })
      : {};
  const hasEn = Boolean(translations.en?.title || translations.en?.description);
  const [lang, setLang] = useState<"ar" | "en">("ar");

  const title = lang === "en" && translations.en?.title ? translations.en.title : page.title;
  const description =
    lang === "en" && translations.en?.description
      ? translations.en.description
      : page.description;

  return (
    <div className={`min-h-svh ${background.className}`}>
      <BioPageViewTracker bioPageId={page.id} />

      <main className={`mx-auto w-full max-w-md px-4 pb-16 pt-12 ${getFontClass(page.font_choice)}`}>
        {hasEn ? (
          <div className="mb-4 flex justify-center">
            <div className="inline-flex items-center rounded-full border bg-card p-0.5 text-xs font-semibold">
              {(["ar", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`cursor-pointer rounded-full px-3 py-1 transition-colors ${
                    lang === l
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l === "ar" ? "عربي" : "EN"}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Identity header */}
        <header className="flex flex-col items-center text-center">
          <Avatar className="size-24 border-2 border-background shadow-md">
            {page.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.avatar_url}
                alt={title}
                className="size-full object-cover"
              />
            ) : (
              <AvatarFallback className={`bg-gradient-to-br ${getAccent(page.accent_color).from} ${getAccent(page.accent_color).to} text-3xl font-bold text-white`}>
                {title.trim().charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>

          <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </header>

        {/* Blocks */}
        <div className="mt-8 space-y-3">
          {blocks.length > 0 ? (
            blocks.map((block) => (
              <BioBlockItem key={block.id} block={block} bioPageId={page.id} page={page} />
            ))
          ) : (
            <p className="pt-6 text-center text-sm text-muted-foreground">
              —
            </p>
          )}
        </div>

        {/* Store CTA */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href={`/${page.slug}/store`}>🛍️ المتجر</Link>
          </Button>
        </div>

        {/* Powered by */}
        <footer className="mt-14 flex justify-center">
          <Link
            href="/"
            className="flex flex-col items-center gap-1.5 rounded-xl px-4 py-2 text-muted-foreground/70 transition-colors hover:text-foreground"
            aria-label={`${t.bio.poweredBy} ${t.meta.title}`}
          >
            <Logo withWordmark={false} className="scale-90" />
            <span className="text-[10px] font-medium">{t.bio.poweredBy}</span>
          </Link>
        </footer>
      </main>
    </div>
  );
}
