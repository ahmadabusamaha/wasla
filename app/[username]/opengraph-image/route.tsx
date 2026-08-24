import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("bio_pages")
    .select("title, description, accent_color")
    .eq("slug", username)
    .eq("published", true)
    .maybeSingle();

  const title = page?.title ?? "Wasla";
  const desc = page?.description ?? "رابطك. تأثيرك. فرصك.";
  const accent = page?.accent_color ?? "teal";

  const gradients: Record<string, string> = {
    teal: "linear-gradient(135deg, #0f766e, #14b8a6, #34d399)",
    emerald: "linear-gradient(135deg, #059669, #10b981, #6ee7b7)",
    purple: "linear-gradient(135deg, #7c3aed, #a855f7, #d946ef)",
    rose: "linear-gradient(135deg, #e11d48, #f43f5e, #fb7185)",
    amber: "linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)",
    blue: "linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa)",
    slate: "linear-gradient(135deg, #334155, #64748b, #94a3b8)",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: gradients[accent] ?? gradients.teal,
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 40, right: 40, fontSize: 24, fontWeight: 700, opacity: 0.85, letterSpacing: 4 }}>
          WASLA
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, marginBottom: 16, textAlign: "center", maxWidth: 900 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, opacity: 0.9, textAlign: "center", maxWidth: 700 }}>
          {desc}
        </div>
        <div style={{ position: "absolute", bottom: 40, fontSize: 22, opacity: 0.75 }}>
          wasla.app/{username}
        </div>
      </div>
    ),
    { ...size }
  );
}
