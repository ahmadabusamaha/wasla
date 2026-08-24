import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} | ${siteConfig.nameEn}`,
    short_name: "Wasla",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f0fdfa",
    theme_color: "#0f766e",
    icons: [
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
