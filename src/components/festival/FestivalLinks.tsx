import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import { isDated, isPast, type NearbyFestival } from "@/lib/festivals";

const badgeStyle = (status: string, passed: boolean) =>
  status === "confirmed" && !passed
    ? { background: "var(--color-accent)", color: "var(--color-bg)" }
    : { border: "1px solid var(--color-accent)", color: "var(--color-accent-500)" };

// Plain functions (not components) rather than client components — they're
// called from both the festival page's server-rendered Suspense fallback
// (regionSlug: null) and RegionAwareLinks's client-rendered version, so the
// markup can't live behind "use client" without breaking the former. See
// RegionAwareLinks for why the region-aware render has to happen client-side
// at all (reading ?region= needs useSearchParams).
export function nearbyItem({ festival: r, distanceKm }: NearbyFestival, i: number, regionSlug: string | null) {
  const dot = isDated(r) ? { background: "var(--color-accent)" } : { border: "2px solid var(--color-accent)" };
  return (
    <Link
      key={r.id}
      href={regionSlug ? `/festivals/${r.id}?region=${regionSlug}` : `/festivals/${r.id}`}
      className="sa-fade flex items-start gap-2.5 border-0 py-[18px] pl-0.5 pr-1 text-left text-text no-underline transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
      style={{
        borderBottom: "1px solid var(--color-divider)",
        animationDelay: `${Math.min(i, 14) * 18}ms`,
        animationDuration: "0.25s",
      }}
    >
      <span className="mt-[5px] block h-[9px] w-[9px] flex-none" style={dot} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-[7px]">
          <span className="font-[800] text-[15px] leading-[1.2] tracking-[-0.01em] text-white">{r.name}</span>
          <span
            className="hidden px-[5px] py-[2px] font-[600] text-[8px] uppercase leading-none tracking-[.1em] lg:inline-block"
            style={badgeStyle(r.status, isPast(r))}
          >
            {isPast(r) ? "Passed" : r.badge}
          </span>
        </span>
        <span className="mt-1 block font-[600] text-[9px] uppercase leading-none tracking-[.1em] text-[color-mix(in_srgb,var(--color-text)_42%,transparent)] text-white">
          {r.city} · {r.region}
        </span>
      </span>
      <span className="flex flex-none flex-col items-end gap-1 self-center text-right">
        <span
          className="px-[5px] py-[2px] font-[600] text-[8px] uppercase leading-none tracking-[.1em] lg:hidden"
          style={badgeStyle(r.status, isPast(r))}
        >
          {isPast(r) ? "Passed" : r.badge}
        </span>
        <span
          className="line-clamp-2 text-[11px] leading-[1.45] text-[color-mix(in_srgb,var(--color-text)_62%,transparent)]"
          style={{ maxWidth: "34ch" }}
        >
          {r.dateShort}
        </span>
        <span className="font-[600] text-[10px] leading-none text-accent-500">{Math.round(distanceKm)} km</span>
      </span>
      <span className="self-center font-[800] text-[13px] leading-none text-accent-500">&#8250;</span>
    </Link>
  );
}

export function backAndNext(festivalId: string, nextId: string, regionSlug: string | null) {
  return (
    <>
      {/* Fixed to the bottom of the viewport on mobile/tablet, so it stays
          reachable without scrolling the whole page; back to being a normal
          inline button once the two-column desktop layout kicks in at lg. */}
      <Link
        href={regionSlug ? `/regions/${regionSlug}` : "/"}
        className="fixed inset-x-0 bottom-0 z-[500] flex items-center justify-center gap-2 border-t px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] font-[800] text-[11px] uppercase leading-none tracking-[.1em] text-text no-underline transition-all duration-150 [border-color:var(--color-divider)] hover:bg-accent hover:!text-white lg:static lg:inset-auto lg:border lg:px-24 lg:py-3 lg:[border-color:var(--color-accent)] lg:inline-flex"
        style={{ background: "var(--color-bg)" }}
      >
        <ArrowIcon size={20} flip />
        Back to map
      </Link>
      {nextId !== festivalId && (
        <Link
          href={regionSlug ? `/festivals/${nextId}?region=${regionSlug}` : `/festivals/${nextId}`}
          className="flex items-center justify-center gap-2 border px-24 py-6 md:py-3 font-[800] text-[11px] uppercase leading-none tracking-[.1em] text-text no-underline transition-all duration-150 [border-color:var(--color-divider)] hover:bg-accent hover:!text-white lg:[border-color:var(--color-accent)] lg:inline-flex"
        >
          Next event &#8250;
        </Link>
      )}
    </>
  );
}
