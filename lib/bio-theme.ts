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

export const ACCENT_COLORS: Record<string, { from: string; to: string; solid: string; softBg: string; text: string }> = {
  teal:    { from: "from-teal-600", to: "to-emerald-500", solid: "bg-teal-600 hover:bg-teal-700 text-white", softBg: "bg-teal-600/10 text-teal-700 dark:text-teal-300", text: "text-teal-600" },
  emerald: { from: "from-emerald-600", to: "to-teal-500", solid: "bg-emerald-600 hover:bg-emerald-700 text-white", softBg: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300", text: "text-emerald-600" },
  purple:  { from: "from-purple-600", to: "to-fuchsia-500", solid: "bg-purple-600 hover:bg-purple-700 text-white", softBg: "bg-purple-600/10 text-purple-700 dark:text-purple-300", text: "text-purple-600" },
  rose:    { from: "from-rose-600", to: "to-pink-500", solid: "bg-rose-600 hover:bg-rose-700 text-white", softBg: "bg-rose-600/10 text-rose-700 dark:text-rose-300", text: "text-rose-600" },
  amber:   { from: "from-amber-500", to: "to-orange-500", solid: "bg-amber-500 hover:bg-amber-600 text-white", softBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300", text: "text-amber-600" },
  blue:    { from: "from-blue-600", to: "to-indigo-500", solid: "bg-blue-600 hover:bg-blue-700 text-white", softBg: "bg-blue-600/10 text-blue-700 dark:text-blue-300", text: "text-blue-600" },
  slate:   { from: "from-slate-700", to: "to-slate-500", solid: "bg-slate-700 hover:bg-slate-800 text-white", softBg: "bg-slate-700/10 text-slate-700 dark:text-slate-300", text: "text-slate-700" },
};

export function getAccent(key: string) {
  return ACCENT_COLORS[key] ?? ACCENT_COLORS.teal;
}

export function getButtonClasses(style: string, accent: string): string {
  const a = getAccent(accent);
  switch (style) {
    case "outline":
      return `border-2 ${a.text} bg-transparent hover:${a.softBg.split(" ")[0]}`;
    case "soft":
      return `${a.softBg} border border-transparent`;
    case "shadow":
      return `${a.solid} shadow-lg`;
    default:
      return a.solid;
  }
}

export const FONT_STACKS: Record<string, string> = {
  default: "",
  cairo: "[font-family:var(--font-arabic),sans-serif]",
  tajawal: "[font-family:'Tajawal',var(--font-arabic),sans-serif]",
  almarai: "[font-family:'Almarai',var(--font-arabic),sans-serif]",
};

export function getFontClass(key: string): string {
  return FONT_STACKS[key] ?? "";
}
