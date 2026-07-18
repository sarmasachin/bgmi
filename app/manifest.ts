import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sensitivity Settings",
    short_name: "Sensitivity",
    description: "BGMI Sensitivity Calculator and Gaming News",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0e14",
    theme_color: "#45c4b0",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
