import type { MetadataRoute } from "next";
import { SITE } from "@/lib/festivals";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — UK & Ireland street art festival guide`,
    short_name: SITE.name,
    description: SITE.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#3e2a47",
    theme_color: "#3e2a47",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
