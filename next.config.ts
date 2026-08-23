import type { NextConfig } from "next";

function supabaseHostname(): string {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co"
    ).hostname;
  } catch {
    return "placeholder.supabase.co";
  }
}

const nextConfig: NextConfig = {
  images: {
    // Avatars/logos live in Supabase Storage — allow the configured project
    // host plus any standard *.supabase.co project (env swaps per deployment).
    remotePatterns: [
      { protocol: "https", hostname: supabaseHostname() },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
