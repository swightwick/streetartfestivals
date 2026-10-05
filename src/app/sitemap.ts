import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { getAllFestivals, REGIONS, siteUrl } from "@/lib/festivals";
import { regionSlug } from "@/lib/regions";

// All festival content lives in this one file, so its mtime is a reasonable
// stand-in for "when did any festival/region page last change" — better
// signal for crawl priority than a build-time timestamp that's the same on
// every deploy regardless of whether the data actually moved.
function dataLastModified(): Date {
  const dataPath = path.join(process.cwd(), "src", "data", "data.json");
  return fs.statSync(dataPath).mtime;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const festivals = getAllFestivals();
  const lastModified = dataLastModified();

  return [
    {
      url: siteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...REGIONS.map((region) => ({
      url: siteUrl(`/regions/${regionSlug(region)}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...festivals.map((f) => ({
      url: siteUrl(`/festivals/${f.id}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
