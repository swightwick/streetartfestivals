"use client";

import { useEffect, useRef, useState } from "react";
import { REGIONS } from "@/lib/festivals";
import { STATUS_FILTERS, type StatusFilter } from "./Nav";

interface MapFiltersProps {
  q: string;
  onQ: (v: string) => void;
  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  region: string;
  onRegion: (v: string) => void;
}

function chipStyle(active: boolean) {
  return {
    borderColor: active ? "var(--color-accent)" : "var(--color-divider)",
    background: active ? "var(--color-accent)" : "transparent",
    color: active ? "var(--color-bg)" : "var(--color-text)",
  };
}

// Floats over the top-left corner of the map on mobile/tablet — the desktop
// nav carries its own inline filters at lg+, so this is hidden there.
export default function MapFilters({ q, onQ, status, onStatus, region, onRegion }: MapFiltersProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const activeFilterCount = (status !== "All" ? 1 : 0) + (region !== "All" ? 1 : 0) + (q.trim() ? 1 : 0);

  return (
    <div ref={panelRef} className="absolute left-3 top-3 z-[500] lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-8 items-center gap-1.5 border px-2.5 font-[600] text-[9.5px] uppercase tracking-[.08em]"
        style={{
          background: "var(--color-bg)",
          borderColor: open || activeFilterCount ? "var(--color-accent)" : "var(--color-divider)",
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
        <span className="text-[8px] leading-none transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          &#9662;
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[640] cursor-default bg-transparent"
          />
          <div
            className="sa-rise absolute left-0 top-full z-[650] mt-2 flex w-[280px] max-w-[calc(100vw-1.5rem)] flex-col gap-3 p-3"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-divider)", boxShadow: "var(--shadow-lg)" }}
          >
            <input
              // autoFocus (not zoom-triggering — iOS/Android only zoom on
              // focus when the input's font-size is under 16px, hence
              // text-[16px] here rather than the 12px used elsewhere).
              autoFocus
              className="input h-9 w-full px-2 text-[16px]"
              type="text"
              placeholder="Search festival, city, postcode"
              value={q}
              onChange={(e) => onQ(e.target.value)}
              aria-label="Search festivals"
            />
            <select
              className="input select-arrow h-9 w-full cursor-pointer pl-2 pr-6 font-[600] text-[10px] uppercase tracking-[.06em]"
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
  );
}
