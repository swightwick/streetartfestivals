import { REGIONS } from "@/lib/festivals";

// "N. Ireland" -> "n-ireland", "South West" -> "south-west". Kept as an
// explicit map (rather than a generic slugify) since REGIONS is a short,
// fixed list and a couple of entries (the "N." abbreviation) don't slugify
// cleanly on their own.
const SLUGS: Record<string, string> = {
  "South West": "south-west",
  Midlands: "midlands",
  East: "east",
  London: "london",
  Wales: "wales",
  Scotland: "scotland",
  "N. Ireland": "northern-ireland",
};

export function regionSlug(region: string): string {
  return SLUGS[region] ?? region.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function regionFromSlug(slug: string): string | undefined {
  return REGIONS.find((r) => regionSlug(r) === slug);
}
