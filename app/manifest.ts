import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SENS MASTER PRO",
    short_name: "SENS MASTER",
    description: "BGMI Sensitivity Calculator and Gaming News",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0e14",
    theme_color: "#00ffcc",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
