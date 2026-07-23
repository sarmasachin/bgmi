import { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/siteUrl";

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = getSiteUrl();

  return {
    id: `${baseUrl}/`,
    name: "Sensitivity Settings",
    short_name: "Sensitivity",
    description:
      "Free Fire, BGMI, and PUBG Mobile sensitivity calculator with presets and gaming news.",
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
        src: "/favicon.ico?v=3",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon.png?v=3",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png?v=3",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
