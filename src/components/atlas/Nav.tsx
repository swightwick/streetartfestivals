"use client";

import Link from "next/link";
import { SITE, REGIONS } from "@/lib/festivals";
import Logo from "@/components/Logo";

export const STATUS_FILTERS = ["All", "2026 dates", "TBC", "No 2026"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

interface NavProps {
  q: string;
  onQ: (v: string) => void;
  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  region: string;
  onRegion: (v: string) => void;
  onOpenList: () => void;
}

function chipStyle(active: boolean) {
  return {
    borderColor: active ? "var(--color-accent)" : "var(--color-divider)",
    background: active ? "var(--color-accent)" : "transparent",
    color: active ? "var(--color-bg)" : "var(--color-text)",
  };
}

export default function Nav({ q, onQ, status, onStatus, region, onRegion, onOpenList }: NavProps) {
  return (
    <nav className="relative z-[600] flex min-w-0 items-center gap-4 px-[18px] py-[11px] shadow-[0_1px_0_rgba(0,0,0,.14),0_5px_14px_-4px_rgba(0,0,0,.34)]">
      <div className="flex min-w-0 flex-none items-center gap-3 overflow-hidden">
        <Link href="/" className="group no-underline">
          <Logo hover />
        </Link>
        <span className="hidden min-w-0 text-[11px] leading-[1.2] text-[color-mix(in_srgb,var(--color-text)_70%,transparent)] sm:block">
          {SITE.tagline}
        </span>
      </div>

      {/* Desktop controls — full inline filters + search */}
      <div className="ml-auto hidden min-w-0 flex-1 items-center justify-end gap-1.5 lg:flex">
        <div className="flex flex-none gap-[3px]">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatus(s)}
              className="inline-flex h-8 items-center whitespace-nowrap border px-[9px] font-[600] text-[9.5px] uppercase tracking-[.08em] transition-all duration-150 hover:border-accent-500"
              style={chipStyle(status === s)}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          className="input select-arrow h-8 min-h-8 flex-none cursor-pointer pl-2 pr-6 font-[600] text-[9.5px] uppercase tracking-[.06em]"
          value={region}
          onChange={(e) => onRegion(e.target.value)}
          aria-label="Filter by region"
        >
          <option value="All">All regions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          className="input h-8 min-h-8 max-w-[260px] min-w-0 flex-[1_1_130px] px-2 font-[600] text-[9.5px] uppercase tracking-[.06em]"
          type="text"
          placeholder="Search festival, city, postcode"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          aria-label="Search festivals"
        />
      </div>

      {/* Mobile / tablet — filters float over the map (top-left); this is just the list opener */}
      <div className="ml-auto flex flex-none items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={onOpenList}
          aria-label="Open festival list"
          className="grid h-8 w-8 flex-none place-items-center border transition-all duration-150 hover:border-accent-500"
          style={{ borderColor: "var(--color-divider)" }}
        >
          <span className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-[14px]" style={{ background: "var(--color-text)" }} />
            <span className="block h-[2px] w-[14px]" style={{ background: "var(--color-text)" }} />
            <span className="block h-[2px] w-[14px]" style={{ background: "var(--color-text)" }} />
          </span>
        </button>
      </div>
    </nav>
  );
}
