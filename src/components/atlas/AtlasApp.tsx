"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, ViewTransition } from "react";
import { createPortal } from "react-dom";
import type { Festival } from "@/lib/types";
import { sortedFestivals, SITE } from "@/lib/festivals";
import { useFocusTrap } from "@/lib/useFocusTrap";
import MapSpinner from "@/components/MapSpinner";
import Logo from "@/components/Logo";
import Nav, { STATUS_FILTERS, type StatusFilter } from "./Nav";
import ProgrammeList from "./ProgrammeList";
import CalendarPanel from "./CalendarPanel";

const MapCanvas = dynamic(() => import("./MapCanvas"), {
  ssr: false,
  loading: () => <MapSpinner />,
});

// A stable "has this hydrated on the client yet" flag for gating the
// drawer's portal — server and the client's first render must agree there's
// nothing to portal yet, or React flags a hydration mismatch. Modelled as an
// external store (server snapshot false, client snapshot true) rather than
// state-set-in-an-effect, so the flip doesn't cost an extra render pass.
const subscribeNever = () => () => {};

function useHasMounted() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}

const WELCOME_SEEN_KEY = "streetartfestivals:welcome-seen";
const welcomeSeenListeners = new Set<() => void>();

function getWelcomeSeenSnapshot(): boolean {
  try {
    return window.localStorage.getItem(WELCOME_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

function subscribeWelcomeSeen(listener: () => void) {
  welcomeSeenListeners.add(listener);
  return () => welcomeSeenListeners.delete(listener);
}

function markWelcomeSeen() {
  try {
    window.localStorage.setItem(WELCOME_SEEN_KEY, "1");
  } catch {
    // Ignore — worst case the welcome reappears next visit.
  }
  welcomeSeenListeners.forEach((listener) => listener());
}

// A real external store (rather than a plain render-time localStorage read)
// so dismissing the welcome modal — which doesn't otherwise change any
// React state, since `infoOpen` stays false throughout — still triggers the
// re-render that hides it.
function useWelcomeSeen() {
  return useSyncExternalStore(subscribeWelcomeSeen, getWelcomeSeenSnapshot, () => true);
}

export default function AtlasApp({ festivals }: { festivals: Festival[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>(STATUS_FILTERS[0]);
  const [region, setRegion] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ id: string; nonce: number } | null>(null);
  const [resetRequest, setResetRequest] = useState<number | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "calendar">("list");
  const mounted = useHasMounted();

  // Server snapshot is "seen" (true) — matching the server's markup, which
  // never includes the auto-opened welcome modal — so this only reflects
  // the real flag once we're safely past hydration and `mounted` is true.
  const welcomeSeenStore = useWelcomeSeen();
  const welcomeSeen = mounted ? welcomeSeenStore : true;
  // Manual opens (the "more info" buttons) go through infoOpen; the welcome
  // modal instead opens itself the first time mounted flips true and the
  // flag hasn't been set yet.
  const effectiveInfoOpen = infoOpen || (mounted && !welcomeSeen);

  const closeInfo = () => {
    setInfoOpen(false);
    markWelcomeSeen();
  };

  const listPanelRef = useRef<HTMLDivElement>(null);
  const calendarPanelRef = useRef<HTMLDivElement>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(listOpen, listPanelRef);
  useFocusTrap(calendarOpen, calendarPanelRef);
  useFocusTrap(effectiveInfoOpen, infoPanelRef);

  useEffect(() => {
    if (!listOpen && !calendarOpen && !effectiveInfoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (effectiveInfoOpen) closeInfo();
      else if (calendarOpen) setCalendarOpen(false);
      else if (listOpen) setListOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [listOpen, calendarOpen, effectiveInfoOpen]);

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
  const resetView = () => {
    setSelectedId(null);
    setResetRequest(Date.now());
  };
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
        <div
          className="grid h-full"
          style={{ gridTemplateRows: "auto minmax(0,1fr)" }}
          // Both the drawer (portalled to <body>, so unaffected by this) and
          // the calendar modal (rendered as a sibling below) sit outside
          // this wrapper — inerting it while either is open keeps Tab from
          // walking a keyboard user out of the open dialog into the map/nav
          // underneath it.
          inert={listOpen || calendarOpen || effectiveInfoOpen}
        >
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

          <main id="main-content" tabIndex={-1} className="grid min-h-0 grid-cols-1 lg:grid-cols-[3fr_2fr]">
            <section
              className="relative flex min-h-0 min-w-0 flex-col overflow-hidden"
              style={{ borderRight: "2px solid var(--color-divider)" }}
            >
              <ViewTransition name="atlas-map" share="morph" default="none">
                <div className="relative min-h-0 flex-1">
                  <MapCanvas
                    festivals={festivals}
                    visibleIds={visibleIds}
                    selectedId={selectedId}
                    focusRequest={focusRequest}
                    resetRequest={resetRequest}
                    onMarkerClick={focus}
                    onTooltipClick={goToFestival}
                  />
                  {selectedId && (
                    <button
                      type="button"
                      onClick={resetView}
                      className="absolute left-3 top-3 z-[500] flex-none whitespace-nowrap border px-4 py-2.5 font-[800] text-[11px] uppercase leading-none tracking-[.1em] transition-all duration-150 hover:!bg-accent hover:!text-[var(--color-bg)]"
                      style={{ background: "var(--color-bg)", borderColor: "var(--color-accent)", color: "#fff" }}
                    >
                      View full map
                    </button>
                  )}
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
              <ProgrammeList list={filtered} allCount={festivals.length} selectedId={selectedId} onHover={peek} onOpenInfo={() => setInfoOpen(true)} />
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="flex-none border-0 px-5 py-3 font-[800] text-[11px] uppercase leading-none tracking-[.1em] transition-all duration-150 hover:brightness-110"
                style={{ borderTop: "2px solid var(--color-divider)", background: "var(--color-accent)", color: "var(--color-bg)" }}
              >
                View festival calendar &#8250;
              </button>
            </section>
          </main>
        </div>

        {/* Mobile / tablet: the programme list + calendar open as an overlay over the map.
            Rendered through a portal straight onto <body> — nesting a scrollable
            fixed-position overlay inside this app's own overflow-hidden/100dvh
            shell is a known source of broken touch-scrolling on iOS Safari. */}
        {mounted &&
          createPortal(
            <div
              className={`fixed inset-0 z-[1200] flex justify-end transition-opacity duration-300 lg:hidden ${
                listOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              // `inert` (rather than aria-hidden) also pulls every focusable
              // descendant — the header buttons, the programme list's links —
              // out of the tab order while the drawer is closed, so it can't
              // be focused via keyboard while hidden from the a11y tree.
              inert={!listOpen}
            >
              <button
                type="button"
                aria-label="Close festival list"
                onClick={() => setListOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <div
                ref={listPanelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Festival list and calendar"
                tabIndex={-1}
                className="relative flex h-full w-full min-h-0 flex-col"
                style={{ background: "var(--color-bg)" }}
              >
                <div
                  className="flex flex-none items-center gap-2 px-3 py-2.5"
                  style={{ borderBottom: "2px solid var(--color-divider)" }}
                >
                  <button
                    type="button"
                    onClick={() => setMobileView((v) => (v === "list" ? "calendar" : "list"))}
                    className="flex h-8 items-center gap-1.5 border px-2.5 font-[800] text-[10px] uppercase leading-none tracking-[.09em] transition-all duration-150 hover:border-accent-500"
                    style={{ borderColor: "var(--color-divider)", color: "var(--color-text)" }}
                  >
                    {mobileView === "list" ? "Calendar" : "‹ Programme"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoOpen(true)}
                    className="flex h-8 items-center gap-1.5 border px-2.5 font-[800] text-[10px] uppercase leading-none tracking-[.09em] transition-all duration-150 hover:border-accent-500"
                    style={{ borderColor: "var(--color-divider)", color: "var(--color-text)" }}
                  >
                    <span aria-hidden className="text-[12px] leading-none">
                      &#9432;
                    </span>
                    Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setListOpen(false)}
                    aria-label="Close"
                    className="ml-auto grid h-8 w-8 flex-none place-items-center border transition-all duration-150 hover:border-accent-500"
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
            </div>,
            document.body
          )}
        {calendarOpen && (
          <div className="fixed inset-0 z-[1200] grid place-items-center p-4">
            <button
              type="button"
              aria-label="Close calendar"
              onClick={() => setCalendarOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <div
              ref={calendarPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Festival calendar"
              tabIndex={-1}
              className="relative flex flex-col overflow-hidden"
              style={{ width: "90vw", height: "90vh", background: "var(--color-bg)", boxShadow: "var(--shadow-lg)" }}
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
                  className="ml-auto grid h-8 w-8 flex-none place-items-center border transition-all duration-150 hover:border-accent-500"
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
        {effectiveInfoOpen && (
          // z-[1300] — above the mobile list drawer's portalled z-[1200]
          // overlay (this "more information" button also lives inside that
          // drawer), which otherwise stacks on top since it's portalled
          // straight onto <body>, later in DOM order than this modal's
          // unportalled ancestor.
          <div className="fixed inset-0 z-[1300] grid place-items-center p-4">
            <button
              type="button"
              aria-label="Close more information"
              onClick={closeInfo}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <div
              ref={infoPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label={welcomeSeen ? "More information" : `Welcome to ${SITE.name}`}
              tabIndex={-1}
              className="relative flex w-full max-w-[420px] flex-col overflow-hidden"
              style={{ background: "var(--color-bg)", boxShadow: "var(--shadow-lg)" }}
            >
              <div
                className="flex flex-none items-center gap-2 px-4 py-2.5"
                style={{ borderBottom: "2px solid var(--color-divider)" }}
              >
                <span className="font-[800] text-[11px] uppercase leading-none tracking-[.12em]">
                  {welcomeSeen ? "More information" : `Welcome to ${SITE.name}`}
                </span>
                <button
                  type="button"
                  onClick={closeInfo}
                  aria-label="Close"
                  className="ml-auto grid h-8 w-8 flex-none place-items-center border transition-all duration-150 hover:border-accent-500"
                  style={{ borderColor: "var(--color-divider)" }}
                >
                  &#10005;
                </button>
              </div>
              {welcomeSeen ? (
                <div className="flex flex-col items-start gap-4 px-5 py-6">
                  <Logo iconSize={44} textSize="22px" gapClassName="gap-2.5" />
                  <p className="m-0 text-[13.5px] leading-[1.6] text-[color-mix(in_srgb,var(--color-text)_88%,transparent)]">
                    {SITE.name} is an independent, non-commercial guide to every street art and graffiti festival in
                    the UK and Ireland — plotted, dated and kept up to date so you don&rsquo;t miss one.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <div className="mb-2 font-[700] text-[10px] uppercase leading-none tracking-[.1em] text-[color-mix(in_srgb,var(--color-text)_58%,transparent)]">
                        Get in touch
                      </div>
                      <a
                        href={`mailto:streetartfestivals@samwightwick.co.uk?subject=${encodeURIComponent("Enquiry from StreetArtFestivalsUK")}`}
                        className="inline-flex items-center gap-1.5 border-0 px-4 py-2.5 font-[800] text-[11px] uppercase leading-none tracking-[.08em] no-underline transition-all duration-150 hover:brightness-110"
                        style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
                      >
                        Email us &#8250;
                      </a>
                    </div>
                    <div>
                      <div className="mb-2 font-[700] text-[10px] uppercase leading-none tracking-[.1em] text-[color-mix(in_srgb,var(--color-text)_58%,transparent)]">
                        Support this site
                      </div>
                      <a
                        href="https://www.buymeacoffee.com/sjw87"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border-0 px-4 py-2.5 font-[800] text-[11px] uppercase leading-none tracking-[.08em] no-underline transition-all duration-150 hover:brightness-110"
                        style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
                      >
                        ☕ Buy me a coffee
                      </a>
                    </div>
                  </div>
                  <p
                    className="m-0 text-[11.5px] leading-[1.5] text-[color-mix(in_srgb,var(--color-text)_50%,transparent)]"
                    style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 14 }}
                  >
                    Built by {" "}
                    <a href="https://samwightwick.co.uk" target="_blank" rel="noopener noreferrer">
                      samwightwick.co.uk
                    </a>
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-start gap-4 px-5 py-6">
                    <Logo iconSize={44} textSize="22px" gapClassName="gap-2.5" />
                    <p className="m-0 text-[13.5px] leading-[1.6] text-[color-mix(in_srgb,var(--color-text)_88%,transparent)]">
                      {SITE.name} is an independent, non-commercial guide to every street art and graffiti festival
                      in the UK and Ireland — plotted, dated and kept up to date so you don&rsquo;t miss one.
                    </p>
                    <div className="w-full" style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 14 }}>
                      <div className="mb-2 font-[700] text-[10px] uppercase leading-none tracking-[.1em] text-[color-mix(in_srgb,var(--color-text)_58%,transparent)]">
                        How to use this site
                      </div>
                      <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[13px] leading-[1.5] text-[color-mix(in_srgb,var(--color-text)_85%,transparent)]">
                        <li className="flex gap-2.5">
                          <span aria-hidden className="flex-none font-[800]" style={{ color: "var(--color-accent)" }}>
                            &#8250;
                          </span>
                          <span>Search or filter by status and region to narrow down the map.</span>
                        </li>
                        <li className="flex gap-2.5">
                          <span aria-hidden className="flex-none font-[800]" style={{ color: "var(--color-accent)" }}>
                            &#8250;
                          </span>
                          <span>Click a pin to preview a festival, then click it again to open the full listing.</span>
                        </li>
                        <li className="flex gap-2.5">
                          <span aria-hidden className="flex-none font-[800]" style={{ color: "var(--color-accent)" }}>
                            &#8250;
                          </span>
                          <span>Browse the programme list alongside the map, sorted soonest first.</span>
                        </li>
                        <li className="flex gap-2.5">
                          <span aria-hidden className="flex-none font-[800]" style={{ color: "var(--color-accent)" }}>
                            &#8250;
                          </span>
                          <span>Open the festival calendar for a month-by-month view of every date.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeInfo}
                    className="flex-none border-0 px-5 py-3 font-[800] text-[11px] uppercase leading-none tracking-[.1em] transition-all duration-150 hover:brightness-110"
                    style={{ borderTop: "2px solid var(--color-divider)", background: "var(--color-accent)", color: "var(--color-bg)" }}
                  >
                    Start exploring &#8250;
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ViewTransition>
  );
}
