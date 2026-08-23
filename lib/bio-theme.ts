/** Visual presets for public bio pages — keyed by the `background` column. */
export interface BioBackgroundPreset {
  label: string;
  className: string;
}

const PRESETS: Record<string, BioBackgroundPreset> = {
  aurora: {
    label: "Aurora",
    className:
      "bg-[radial-gradient(60rem_30rem_at_50%_-10%,--theme(--color-teal-200/70%,transparent),transparent)] bg-slate-50",
  },
  rose: {
    label: "Rose",
    className:
      "bg-[radial-gradient(60rem_30rem_at_50%_-10%,--theme(--color-rose-200/70%,transparent),transparent)] bg-rose-50",
  },
  ocean: {
    label: "Ocean",
    className:
      "bg-[radial-gradient(60rem_30rem_at_50%_-10%,--theme(--color-sky-200/70%,transparent),transparent)] bg-sky-50",
  },
  sand: {
    label: "Sand",
    className:
      "bg-[radial-gradient(60rem_30rem_at_50%_-10%,--theme(--color-amber-100/80%,transparent),transparent)] bg-amber-50",
  },
};

export function getBioBackground(key: string): BioBackgroundPreset {
  return PRESETS[key] ?? PRESETS.aurora;
}

/** Maps a YouTube URL to an embeddable src, or null when unsupported. */
export function toYouTubeEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1);
      if (/^[\w-]{6,}$/.test(id))
        return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}
