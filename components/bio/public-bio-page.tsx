import Link from "next/link";
import type { BioBlock, BioPage } from "@/types/database";
import { getDictionary } from "@/lib/i18n/server";
import { getBioBackground } from "@/lib/bio-theme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/shared/logo";
import { BioBlockItem } from "@/components/bio/block-renderer";
import { BioPageViewTracker } from "@/components/bio/page-view-tracker";

interface PublicBioPageProps {
  page: BioPage;
  blocks: BioBlock[];
}

/**
 * The public creator page served at wasla.com/{username}.
 * Mobile-first, RTL/LTR aware, and fully driven by database content.
 */
export async function PublicBioPageView({ page, blocks }: PublicBioPageProps) {
  const t = await getDictionary();
  const background = getBioBackground(page.background);

  return (
    <div className={`min-h-svh ${background.className}`}>
      <BioPageViewTracker bioPageId={page.id} />

      <main className="mx-auto w-full max-w-md px-4 pb-16 pt-12">
        {/* Identity header */}
        <header className="flex flex-col items-center text-center">
          <Avatar className="size-24 border-2 border-background shadow-md">
            {page.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.avatar_url}
                alt={page.title}
                className="size-full object-cover"
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-teal-600 to-emerald-500 text-3xl font-bold text-white">
                {page.title.trim().charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>

          <h1 className="mt-4 text-2xl font-bold tracking-tight">{page.title}</h1>
          {page.description ? (
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {page.description}
            </p>
          ) : null}
        </header>

        {/* Blocks */}
        <div className="mt-8 space-y-3">
          {blocks.length > 0 ? (
            blocks.map((block) => (
              <BioBlockItem key={block.id} block={block} bioPageId={page.id} />
            ))
          ) : (
            <p className="pt-6 text-center text-sm text-muted-foreground">
              —
            </p>
          )}
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
