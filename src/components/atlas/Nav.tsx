"use client";

import { useEffect, useRef, useState } from "react";
import { SITE, REGIONS } from "@/lib/festivals";

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
    color: active ? "var(--color-bg)" : "color-mix(in srgb, var(--color-text) 72%, transparent)",
  };
}

export default function Nav({ q, onQ, status, onStatus, region, onRegion, onOpenList }: NavProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  const activeFilterCount = (status !== "All" ? 1 : 0) + (region !== "All" ? 1 : 0) + (q.trim() ? 1 : 0);

  return (
    <nav className="relative z-[600] flex min-w-0 items-center gap-4 px-[18px] py-[11px] shadow-[0_1px_0_rgba(0,0,0,.14),0_5px_14px_-4px_rgba(0,0,0,.34)]">
      <div className="flex min-w-0 flex-none items-center gap-3 overflow-hidden">
        <span className="whitespace-nowrap font-[800] text-[24px] leading-[0.9] tracking-[-0.035em] text-accent">
          streetart<span className="text-white">festivals</span>uk
        </span>
        <span className="hidden min-w-0 max-w-[30ch] text-[11px] leading-[1.2] text-[color-mix(in_srgb,var(--color-text)_70%,transparent)] sm:block">
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
          className="input h-8 min-h-8 flex-none cursor-pointer px-2 font-[600] text-[9.5px] uppercase tracking-[.06em]"
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

      {/* Mobile / tablet controls — filters collapse into a dropdown, list opens as an overlay */}
      <div className="ml-auto flex flex-none items-center gap-2 lg:hidden">
        <div ref={panelRef} className="relative">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className="flex h-8 items-center gap-1.5 border px-2.5 font-[600] text-[9.5px] uppercase tracking-[.08em]"
            style={{
              borderColor: filtersOpen || activeFilterCount ? "var(--color-accent)" : "var(--color-divider)",
              color: "var(--color-text)",
            }}
          >
            Filters
            {activeFilterCount > 0 && (
              <span
                className="grid h-[14px] min-w-[14px] place-items-center px-1 font-[800] text-[8px] leading-none"
                style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
              >
                {activeFilterCount}
              </span>
            )}
            <span
              className="text-[8px] leading-none transition-transform"
              style={{ transform: filtersOpen ? "rotate(180deg)" : "none" }}
            >
              &#9662;
            </span>
          </button>

          {filtersOpen && (
            <>
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                onClick={() => setFiltersOpen(false)}
                className="fixed inset-0 z-[640] cursor-default bg-transparent"
              />
              <div
                className="absolute right-0 top-full z-[650] mt-2 flex w-[280px] flex-col gap-3 p-3"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-divider)", boxShadow: "var(--shadow-lg)" }}
              >
                <input
                  className="input h-9 w-full px-2 text-[12px]"
                  type="text"
                  placeholder="Search festival, city, postcode"
                  value={q}
                  onChange={(e) => onQ(e.target.value)}
                  aria-label="Search festivals"
                  autoFocus
                />
                <select
                  className="input h-9 w-full cursor-pointer px-2 font-[600] text-[10px] uppercase tracking-[.06em]"
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
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_FILTERS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onStatus(s)}
                      className="inline-flex h-8 items-center whitespace-nowrap border px-[9px] font-[600] text-[9.5px] uppercase tracking-[.08em]"
                      style={chipStyle(status === s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

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
