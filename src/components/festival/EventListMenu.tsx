"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MapFestival } from "@/lib/types";
import { sortedFestivals } from "@/lib/festivals";
import { useFocusTrap } from "@/lib/useFocusTrap";
import ProgrammeList from "@/components/atlas/ProgrammeList";

// Mobile/tablet only — the hamburger that opens the full festival list,
// matching Nav.tsx's "Open festival list" button on the homepage/region
// map, so a visitor who landed straight on an event page (a shared link, a
// search result) isn't stuck without a way to browse the rest of the
// programme short of navigating away first.
export default function EventListMenu({
  festivals,
  currentId,
  region,
}: {
  festivals: MapFestival[];
  currentId: string;
  // Validated region slug carried over from the map (see RegionAwareLinks) —
  // threaded into ProgrammeList so its links keep that region context too.
  region: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const list = sortedFestivals(festivals);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open festival list"
        className="grid h-8 w-8 flex-none place-items-center border transition-all duration-150 hover:border-accent-500 lg:hidden"
        style={{ borderColor: "var(--color-divider)" }}
      >
        <span className="flex flex-col gap-[3px]">
          <span className="block h-[2px] w-[14px]" style={{ background: "var(--color-text)" }} />
          <span className="block h-[2px] w-[14px]" style={{ background: "var(--color-text)" }} />
          <span className="block h-[2px] w-[14px]" style={{ background: "var(--color-text)" }} />
        </span>
      </button>
      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-[1200] flex justify-end transition-opacity duration-300 lg:hidden ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            inert={!open}
          >
            <button
              type="button"
              aria-label="Close festival list"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Festival list"
              tabIndex={-1}
              className={`relative flex h-full w-full min-h-0 flex-col transition-transform duration-300 ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ background: "var(--color-bg)", transitionTimingFunction: "cubic-bezier(0.2,0.7,0.2,1)" }}
            >
              <div
                className="flex flex-none items-center gap-2 px-3 py-2.5"
                style={{ borderBottom: "1px solid var(--color-divider)" }}
              >
                <span className="font-[800] text-[11px] uppercase leading-none tracking-[.12em]">All festivals</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="ml-auto grid h-8 w-8 flex-none place-items-center border transition-all duration-150 hover:border-accent-500"
                  style={{ borderColor: "var(--color-divider)" }}
                >
                  &#10005;
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <ProgrammeList
                  list={list}
                  allCount={list.length}
                  selectedId={currentId}
                  onHover={() => {}}
                  region={region ?? undefined}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
