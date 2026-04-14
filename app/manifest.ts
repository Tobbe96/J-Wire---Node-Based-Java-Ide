import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevFlow — Visual Java IDE",
    short_name: "DevFlow",
    description:
      "A node-based visual IDE for building Java programs through drag-and-drop flowcharts",
    start_url: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#1a1a1a",
    theme_color: "#1a1a1a",
    categories: ["developer tools", "education", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
