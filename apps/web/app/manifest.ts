import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flow",
    short_name: "Flow",
    description: "The private card for limitless freedom.",
    // The root is now the public landing page, so an installed app opens at
    // the product itself rather than at marketing
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f2ee",
    theme_color: "#f4f2ee",
    categories: ["finance"],
    icons: [
      {
        src: "/icons/app-icon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
      {
        // The mark sits well inside the safe zone, so the same file survives
        // the circular/squircle crop launchers apply to maskable icons
        src: "/icons/app-icon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
