"use client";

import { useSearchParams } from "next/navigation";
import type { NearbyFestival } from "@/lib/festivals";
import { regionFromSlug } from "@/lib/regions";
import { backAndNext, nearbyItem } from "./FestivalLinks";

// Reading ?region= needs useSearchParams, which only works client-side (and
// needs a Suspense boundary to keep the festival page statically
// prerenderable) — so these two render the same markup as FestivalLinks'
// plain functions, just with the live region instead of the Suspense
// fallback's null.
function useRegionSlug(): string | null {
  const searchParams = useSearchParams();
  const regionParam = searchParams.get("region");
  return regionParam && regionFromSlug(regionParam) ? regionParam : null;
}

export function RegionAwareNearby({ nearby }: { nearby: NearbyFestival[] }) {
  const regionSlug = useRegionSlug();
  return <>{nearby.map((n, i) => nearbyItem(n, i, regionSlug))}</>;
}

export function RegionAwareBackAndNext({ festivalId, nextId }: { festivalId: string; nextId: string }) {
  const regionSlug = useRegionSlug();
  return <>{backAndNext(festivalId, nextId, regionSlug)}</>;
}
