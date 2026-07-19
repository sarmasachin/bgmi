import { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/siteUrl";

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = getSiteUrl();

  return {
    id: `${baseUrl}/`,
    name: "Sensitivity Settings",
    short_name: "Sensitivity",
    description: "BGMI and PUBG Mobile sensitivity calculator with no-recoil presets and gaming news.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "en",
    dir: "ltr",
    orientation: "any",
    background_color: "#0b0e14",
    theme_color: "#45c4b0",
    categories: ["games", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
