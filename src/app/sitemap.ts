import type { MetadataRoute } from "next";
import { getAllFestivals, siteUrl } from "@/lib/festivals";

export default function sitemap(): MetadataRoute.Sitemap {
  const festivals = getAllFestivals();

  return [
    {
      url: siteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...festivals.map((f) => ({
      url: siteUrl(`/festivals/${f.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
