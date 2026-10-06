"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { regionFromSlug } from "@/lib/regions";

// Reads ?region= from the URL (set when navigating here from a region-scoped
// map — see ProgrammeList/AtlasApp's goToFestival) and hands back the
// validated region slug, or null for an unrecognised/absent one. A
// render-prop rather than returning JSX directly so callers (wrapped in
// Suspense, since useSearchParams requires it on a statically generated
// page) can supply the same markup as the pre-hydration fallback by calling
// the render function with null, instead of duplicating it.
export default function WithRegionParam({ children }: { children: (regionSlug: string | null) => ReactNode }) {
  const searchParams = useSearchParams();
  const regionParam = searchParams.get("region");
  const regionSlug = regionParam && regionFromSlug(regionParam) ? regionParam : null;
  return <>{children(regionSlug)}</>;
}
