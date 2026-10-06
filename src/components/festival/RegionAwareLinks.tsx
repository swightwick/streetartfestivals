"use client";

import { useSearchParams } from "next/navigation";
import type { MapFestival } from "@/lib/types";
import type { NearbyFestival } from "@/lib/festivals";
import { regionFromSlug } from "@/lib/regions";
import { backAndNext, nearbyItem } from "./FestivalLinks";
import EventListMenu from "./EventListMenu";

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

export function RegionAwareEventListMenu({ festivals, currentId }: { festivals: MapFestival[]; currentId: string }) {
  const regionSlug = useRegionSlug();
  return <EventListMenu festivals={festivals} currentId={currentId} region={regionSlug} />;
}
