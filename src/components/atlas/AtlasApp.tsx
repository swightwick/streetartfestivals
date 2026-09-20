"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState, ViewTransition } from "react";
import type { Festival } from "@/lib/types";
import { sortedFestivals } from "@/lib/festivals";
import Nav, { STATUS_FILTERS, type StatusFilter } from "./Nav";
import ProgrammeList from "./ProgrammeList";
import CalendarPanel from "./CalendarPanel";

const MapCanvas = dynamic(() => import("./MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center" style={{ background: "#d9d7d4" }}>
      <span className="font-[600] text-[10px] uppercase tracking-[.1em] text-[#7d7979]">Loading map…</span>
    </div>
  ),
});

export default function AtlasApp({ festivals }: { festivals: Festival[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>(STATUS_FILTERS[0]);
  const [region, setRegion] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ id: string; nonce: number } | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "calendar">("list");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return sortedFestivals(
      festivals.filter((f) => {
        if (region !== "All" && f.region !== region) return false;
        if (status === "2026 dates" && !(f.status === "confirmed" || f.status === "month" || f.status === "rolling"))
          return false;
        if (status === "TBC" && f.status !== "tbc") return false;
        if (status === "No 2026" && f.status !== "none") return false;
        if (query && !`${f.name} ${f.city} ${f.region} ${f.postcode} ${f.location}`.toLowerCase().includes(query))
          return false;
        return true;
      })
    );
  }, [festivals, q, status, region]);

  const visibleIds = useMemo(() => new Set(filtered.map((f) => f.id)), [filtered]);

  const focus = (id: string) => {
    setSelectedId(id);
    setFocusRequest({ id, nonce: Date.now() });
  };
  const peek = (id: string) => setSelectedId(id);
  // Tooltip click opens the full record (a real navigation); the pin itself
  // just selects + pans, matching the map's "peek vs open" distinction.
  const goToFestival = (id: string) => router.push(`/festivals/${id}`);
  const focusFromDrawer = (id: string) => {
    focus(id);
    setListOpen(false);
  };

  return (
    <ViewTransition name="atlas-shell" share="auto" default="none">
      <div style={{ height: "100dvh", overflow: "hidden", background: "var(--color-bg)" }}>
        <div className="grid h-full" style={{ gridTemplateRows: "auto minmax(0,1fr)" }}>
          <Nav
            q={q}
            onQ={setQ}
            status={status}
            onStatus={setStatus}
            region={region}
            onRegion={setRegion}
            onOpenList={() => {
              setMobileView("list");
              setListOpen(true);
            }}
          />

          <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[3fr_2fr]">
            <section
              className="relative flex min-h-0 min-w-0 flex-col overflow-hidden"
              style={{ borderRight: "2px solid var(--color-divider)" }}
            >
              <ViewTransition name="atlas-map" share="morph" default="none">
                <div className="min-h-0 flex-1">
                  <MapCanvas
                    festivals={festivals}
                    visibleIds={visibleIds}
                    selectedId={selectedId}
                    focusRequest={focusRequest}
                    onMarkerClick={focus}
                    onTooltipClick={goToFestival}
                  />
                </div>
              </ViewTransition>
              <div
                className="pointer-events-none absolute bottom-5 left-3.5 z-[500] flex flex-col gap-1.5 px-[11px] py-[9px]"
                style={{ background: "var(--color-bg)", border: "1px solid var(--color-divider)" }}
              >
                <span className="flex items-center gap-2 font-[600] text-[10px] uppercase leading-none tracking-[.08em] text-[color-mix(in_srgb,var(--color-text)_75%,transparent)]">
                  <i className="block h-[9px] w-[9px] flex-none" style={{ background: "var(--color-accent)" }} />
                  2026 dates
                </span>
                <span className="flex items-center gap-2 font-[600] text-[10px] uppercase leading-none tracking-[.08em] text-[color-mix(in_srgb,var(--color-text)_75%,transparent)]">
                  <i className="block h-[9px] w-[9px] flex-none border-2" style={{ borderColor: "var(--color-accent)" }} />
                  TBC / no edition
                </span>
              </div>
            </section>

            <section
              className="hidden min-h-0 min-w-0 overflow-hidden lg:grid"
              style={{ gridTemplateRows: "minmax(0,1fr) auto", background: "var(--color-bg)" }}
            >
              <ProgrammeList list={filtered} allCount={festivals.length} selectedId={selectedId} onHover={peek} />
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="flex-none border-0 px-5 py-3 font-[800] text-[11px] uppercase leading-none tracking-[.1em] hover:brightness-110"
                style={{ borderTop: "2px solid var(--color-divider)", background: "var(--color-accent)", color: "var(--color-bg)" }}
              >
                View festival calendar &#8250;
              </button>
            </section>
          </div>
        </div>

        {/* Mobile / tablet: the programme list + calendar open as an overlay over the map. */}
        <div
          className={`fixed inset-0 z-[1200] flex justify-end transition-opacity duration-300 lg:hidden ${
            listOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!listOpen}
        >
          <button
            type="button"
            aria-label="Close festival list"
            onClick={() => setListOpen(false)}
            tabIndex={listOpen ? 0 : -1}
            className="absolute inset-0 bg-black/60"
          />
          <div
            className={`relative flex h-full w-full max-w-[400px] min-h-0 flex-col transition-transform duration-300 ease-out ${
              listOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ background: "var(--color-bg)", borderLeft: "2px solid var(--color-divider)" }}
          >
              <div
                className="flex flex-none items-center gap-2 px-3 py-2.5"
                style={{ borderBottom: "2px solid var(--color-divider)" }}
              >
                <button
                  type="button"
                  onClick={() => setMobileView((v) => (v === "list" ? "calendar" : "list"))}
                  className="flex h-8 items-center gap-1.5 border px-2.5 font-[800] text-[10px] uppercase leading-none tracking-[.09em] hover:border-accent-500"
                  style={{ borderColor: "var(--color-divider)", color: "var(--color-text)" }}
                >
                  {mobileView === "list" ? "Calendar" : "‹ Programme"}
                </button>
                <button
                  type="button"
                  onClick={() => setListOpen(false)}
                  aria-label="Close"
                  className="ml-auto grid h-8 w-8 flex-none place-items-center border hover:border-accent-500"
                  style={{ borderColor: "var(--color-divider)" }}
                >
                  &#10005;
                </button>
              </div>
              <div className="min-h-0 flex-1">
                {mobileView === "list" ? (
                  <ProgrammeList list={filtered} allCount={festivals.length} selectedId={selectedId} onHover={peek} />
                ) : (
                  <CalendarPanel festivals={festivals} onOpen={focusFromDrawer} fillHeight />
                )}
              </div>
          </div>
        </div>
        {calendarOpen && (
          <div className="fixed inset-0 z-[1200] grid place-items-center p-4">
            <button
              type="button"
              aria-label="Close calendar"
              onClick={() => setCalendarOpen(false)}
              className="absolute inset-0 bg-black/70"
            />
            <div
              className="relative flex flex-col overflow-hidden"
              style={{ width: "90vw", height: "90vh", background: "var(--color-bg)", border: "2px solid var(--color-divider)" }}
            >
              <div
                className="flex flex-none items-center gap-2 px-4 py-2.5"
                style={{ borderBottom: "2px solid var(--color-divider)" }}
              >
                <span className="font-[800] text-[11px] uppercase leading-none tracking-[.12em]">
                  Festival calendar
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarOpen(false)}
                  aria-label="Close"
                  className="ml-auto grid h-8 w-8 flex-none place-items-center border hover:border-accent-500"
                  style={{ borderColor: "var(--color-divider)" }}
                >
                  &#10005;
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <CalendarPanel
                  festivals={festivals}
                  onOpen={(id) => {
                    focus(id);
                    setCalendarOpen(false);
                  }}
                  fillHeight
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ViewTransition>
  );
}
