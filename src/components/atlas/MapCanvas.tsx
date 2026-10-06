"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, Marker, IControl, Popup, LngLatBoundsLike } from "maplibre-gl";
import type { MapFestival } from "@/lib/types";
import { MAP_STYLE_URL, MAP_ATTRIBUTION, loadMapLibre } from "@/lib/mapTiles";

interface FocusRequest {
  id: string;
  nonce: number;
}

// UK + Ireland extent — also the map's maxBounds, so "View full map" always
// zooms back out to the whole atlas rather than a tight crop around
// whichever markers happen to be visible under the current filters.
// MapLibre bounds are [west, south, east, north] (lng/lat), unlike
// Leaflet's [[lat,lng],[lat,lng]] corner pairs.
const UK_IE_BOUNDS: [number, number, number, number] = [-11.6, 49.2, 3.2, 61.2];

// Below this width, markers get a bigger invisible hit area (see
// applyHitAreaStyle) — matches the lg breakpoint the rest of the atlas
// shell switches its mobile/desktop layout at.
const MOBILE_MARKER_BREAKPOINT = 1024;

// Pure — no per-instance state — so it lives at module scope rather than
// being stashed on the map instance (as the old Leaflet code did) or put in
// a ref (which would be the right tool only if it needed to vary per
// component instance, which it doesn't).
function applyMarkerStyle(el: HTMLElement, solid: boolean, sel: boolean) {
  const size = sel ? 20 : 13;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.background = solid ? "var(--color-accent)" : "transparent";
  el.style.border = solid ? "" : "2.5px solid var(--color-accent)";
  el.style.boxShadow = `0 0 0 2px var(--color-bg)${sel ? ", 0 0 0 7px rgba(223,208,184,.28)" : ""}`;
  // NOT "all" — MapLibre repositions markers every animation frame during
  // pan/zoom by setting this same element's `transform` directly (see
  // Marker's internal `_element.style.transform = ...`). Transitioning
  // "all" eases that repositioning too, so markers visibly lag behind the
  // map during a zoom gesture and "catch up" afterwards instead of moving
  // with it. Only the state-change properties below should ease.
  el.style.transition = "width .18s, height .18s, background-color .18s, border-color .18s, box-shadow .18s";
}

// Padding on the marker's hit-area wrapper (not the visible dot itself,
// see festivals.forEach below) — grows the tappable area around small
// markers on mobile without changing how big they look. Symmetric padding
// keeps the dot centered on its actual lng/lat, same as unpadded.
function applyHitAreaStyle(el: HTMLElement) {
  const mobile = typeof window !== "undefined" && window.innerWidth < MOBILE_MARKER_BREAKPOINT;
  el.style.padding = mobile ? "13px" : "0";
}

// The wrapper's only child is the visible dot applyMarkerStyle styles —
// see festivals.forEach below for why marker.getElement() (the wrapper)
// isn't styled directly.
function getDotEl(marker: Marker): HTMLElement {
  return marker.getElement().firstElementChild as HTMLElement;
}

interface MapCanvasProps {
  festivals: MapFestival[];
  visibleIds: Set<string>;
  selectedId: string | null;
  focusRequest: FocusRequest | null;
  resetRequest?: number | null;
  // Crop the initial view to these bounds instead of the full UK + Ireland
  // extent — used by the regional pages so e.g. /regions/scotland opens
  // already zoomed to Scotland rather than the whole atlas. "View full
  // map" still resets to UK_IE_BOUNDS, and minZoom is still derived from
  // it, so a visitor can always zoom/pan back out to everywhere.
  initialBounds?: [[number, number], [number, number]];
  onMarkerClick: (id: string) => void;
  onTooltipClick: (id: string) => void;
}

export default function MapCanvas({
  festivals,
  visibleIds,
  selectedId,
  focusRequest,
  resetRequest,
  initialBounds,
  onMarkerClick,
  onTooltipClick,
}: MapCanvasProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, { marker: Marker; solid: boolean; addedToMap: boolean }>>({});
  const popupsRef = useRef<Record<string, Popup>>({});
  const tooltipFnsRef = useRef<{ show: (id: string) => void; hide: (id: string) => void } | null>(null);
  const youAreHereRef = useRef<Marker | null>(null);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onTooltipClickRef = useRef(onTooltipClick);
  const selectedIdRef = useRef(selectedId);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
    onTooltipClickRef.current = onTooltipClick;
    selectedIdRef.current = selectedId;
  }, [onMarkerClick, onTooltipClick, selectedId]);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let onWindowResize: (() => void) | null = null;

    (async () => {
      const maplibregl = await loadMapLibre();
      if (cancelled || !elRef.current) return;
      const el = elRef.current;

      const map = new maplibregl.Map({
        container: el,
        style: MAP_STYLE_URL,
        center: [-3.4, 54.6],
        zoom: 5,
        maxZoom: 16,
        maxBounds: UK_IE_BOUNDS,
        renderWorldCopies: false,
        attributionControl: false,
        // No compass control (showCompass: false below) means there's no UI
        // to reset a rotated view — so disable rotation entirely, both
        // mouse-drag (dragRotate) and the touch twist gesture, rather than
        // let mobile users accidentally spin into a stuck orientation.
        dragRotate: false,
        touchPitch: false,
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(
        // compact: false — compact mode's toggle button stays permanently
        // open anyway (the attribution text is short enough that MapLibre
        // never collapses it), so compact just adds an extra "i" button
        // for no functional benefit. Plain mode skips that button.
        new maplibregl.AttributionControl({ compact: false, customAttribution: MAP_ATTRIBUTION }),
        "bottom-right"
      );
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      mapRef.current = map;

      let locating = false;
      const handleLocate = (link: HTMLButtonElement) => {
        if (locating || !navigator.geolocation) return;
        locating = true;
        link.classList.add("sa-locate-loading");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            locating = false;
            link.classList.remove("sa-locate-loading");
            const userLngLat: [number, number] = [pos.coords.longitude, pos.coords.latitude];
            const userLngLatObj = new maplibregl.LngLat(userLngLat[0], userLngLat[1]);

            const nearest = Object.values(markersRef.current)
              .filter((entry) => entry.addedToMap)
              .map((entry) => ({ marker: entry.marker, dist: userLngLatObj.distanceTo(entry.marker.getLngLat()) }))
              .sort((a, b) => a.dist - b.dist)
              .slice(0, 2);

            const youAreHereEl = document.createElement("div");
            youAreHereEl.style.cssText =
              "width:16px;height:16px;border-radius:50%;background:#3b82f6;" +
              "box-shadow:0 0 0 3px var(--color-bg), 0 0 0 8px rgba(59,130,246,.32);";
            youAreHereRef.current?.remove();
            youAreHereRef.current = new maplibregl.Marker({ element: youAreHereEl })
              .setLngLat(userLngLat)
              .addTo(map);

            if (nearest.length) {
              const bounds = new maplibregl.LngLatBounds(
                nearest[0].marker.getLngLat(),
                nearest[0].marker.getLngLat()
              );
              bounds.extend(userLngLatObj);
              nearest.forEach((n) => bounds.extend(n.marker.getLngLat()));
              map.fitBounds(bounds, { padding: 64, maxZoom: 13, animate: true });
              nearest.forEach((n) => {
                const id = Object.entries(markersRef.current).find(([, v]) => v.marker === n.marker)?.[0];
                if (id) showTooltip(id);
              });
            } else {
              map.easeTo({ center: userLngLat, zoom: 12 });
            }
          },
          () => {
            locating = false;
            link.classList.remove("sa-locate-loading");
            link.classList.add("sa-locate-error");
            setTimeout(() => link.classList.remove("sa-locate-error"), 2500);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      };

      class LocateControl implements IControl {
        onAdd() {
          const container = document.createElement("div");
          container.className = "maplibregl-ctrl maplibregl-ctrl-group";
          const link = document.createElement("button");
          link.type = "button";
          link.title = "Zoom to my location";
          link.setAttribute("aria-label", "Zoom to my location");
          link.style.display = "flex";
          link.style.alignItems = "center";
          link.style.justifyContent = "center";
          link.innerHTML =
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round"><circle cx="12" cy="12" r="3"></circle>' +
            '<path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path></svg>';
          container.appendChild(link);
          ["mousedown", "touchstart", "dblclick"].forEach((t) =>
            container.addEventListener(t, (e) => e.stopPropagation())
          );
          link.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLocate(link);
          });
          return container;
        }
        onRemove() {}
      }
      map.addControl(new LocateControl(), "top-right");

      const showTooltip = (id: string) => {
        const entry = markersRef.current[id];
        const f = festivals.find((x) => x.id === id);
        if (!entry || !f) return;
        if (!popupsRef.current[id]) {
          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            anchor: "bottom",
            offset: 12,
            // Default 240px forces long names to wrap, which pushes the
            // flex-centered arrow down next to the wrapped second line
            // instead of staying beside the (first line of the) name.
            // "none" lets the pill grow to fit the name on one row instead.
            maxWidth: "none",
          })
            .setLngLat(entry.marker.getLngLat())
            .setHTML(
              '<span data-tip-name="1">' +
                f.name +
                '</span><span data-tip-arrow="1"><svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">' +
                '<path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>' +
                "</svg></span>"
            );
          popup.on("open", () => {
            // Clicking the tooltip behaves the same as clicking its marker —
            // mirrors the marker's own select/navigate click handler so the
            // whole tooltip (not just the dot) is a consistent click target.
            popup.getElement()?.addEventListener("click", () => {
              if (selectedIdRef.current === id) {
                onTooltipClickRef.current(id);
              } else {
                selectedIdRef.current = id;
                onMarkerClickRef.current(id);
              }
            });
          });
          popupsRef.current[id] = popup;
        }
        popupsRef.current[id].addTo(map);
      };
      const hideTooltip = (id: string) => {
        popupsRef.current[id]?.remove();
      };

      festivals.forEach((f) => {
        const solid = f.status === "confirmed" || f.status === "month" || f.status === "rolling";

        // markerEl is a hit-area wrapper, not the visible marker — keeps
        // the dot's own size untouched while still growing what's tappable
        // on mobile (applyHitAreaStyle), via padding around a centered
        // child rather than a bigger dot.
        const markerEl = document.createElement("div");
        markerEl.style.display = "flex";
        markerEl.style.alignItems = "center";
        markerEl.style.justifyContent = "center";
        markerEl.style.cursor = "pointer";
        markerEl.title = f.name;
        // A plain <div> has an implicit ARIA role of "generic", which
        // doesn't permit aria-label (axe's "aria-allowed-attr" rule) — it's
        // clickable, so "button" is both accurate and makes the label valid.
        markerEl.setAttribute("role", "button");
        markerEl.setAttribute("aria-label", f.name);
        applyHitAreaStyle(markerEl);

        const dotEl = document.createElement("div");
        applyMarkerStyle(dotEl, solid, f.id === selectedId);
        markerEl.appendChild(dotEl);

        markerEl.addEventListener("mouseenter", () => {
          markerEl.style.zIndex = "10";
        });
        markerEl.addEventListener("mouseleave", () => {
          markerEl.style.zIndex = "";
        });
        markerEl.addEventListener("click", () => {
          // First click/tap: zoom in + select (the "sync" effect below opens
          // the tooltip in response to the selection change). Second
          // click/tap on an already-selected marker: navigate. We don't rely
          // on any library-provided hover/click-toggle behaviour — on touch
          // that kind of built-in toggle fires independently of this
          // handler and races with it. Tooltip visibility is instead driven
          // purely by our own selectedId state (see the sync effect).
          if (selectedIdRef.current === f.id) {
            onTooltipClickRef.current(f.id);
          } else {
            selectedIdRef.current = f.id;
            onMarkerClickRef.current(f.id);
          }
        });

        const marker = new maplibregl.Marker({ element: markerEl, anchor: "center" }).setLngLat([f.lng, f.lat]);
        const addedToMap = visibleIds.has(f.id);
        if (addedToMap) marker.addTo(map);
        markersRef.current[f.id] = { marker, solid, addedToMap };
      });

      const fit = () => {
        if (!el.clientHeight) {
          setTimeout(fit, 150);
          return;
        }
        map.resize();
        map.setMinZoom(0);

        // Default view hugs the actual marker cluster, not a fixed
        // UK+Ireland box — the fixed box carries a lot of empty sea at the
        // north/south edges the real festivals never reach. Regional pages
        // still use their explicit initialBounds crop.
        let targetBounds: LngLatBoundsLike;
        if (initialBounds) {
          targetBounds = [initialBounds[0][1], initialBounds[0][0], initialBounds[1][1], initialBounds[1][0]];
        } else if (festivals.length) {
          const pts: [number, number][] = festivals.map((f) => [f.lng, f.lat]);
          targetBounds = pts.reduce(
            (b, p) => b.extend(p),
            new maplibregl.LngLatBounds(pts[0], pts[0])
          );
        } else {
          targetBounds = UK_IE_BOUNDS;
        }
        // cameraForBounds, not fitBounds: maxBounds is set to UK_IE_BOUNDS,
        // and fitBounds's camera move gets clamped by it mid-transition,
        // landing short of the true fit (reproduced and fixed live before
        // porting this). cameraForBounds is a pure computation unaffected
        // by maxBounds, so jumpTo with its result lands correctly. padding
        // gives breathing room around the fitted bounds — more principled
        // than the flat zoom bump this replaced, since it scales with the
        // actual bounds rather than being tuned for one fixed box.
        const targetCam = map.cameraForBounds(targetBounds, { padding: 56 });
        const ukCam = map.cameraForBounds(UK_IE_BOUNDS);
        if (targetCam?.zoom != null) map.jumpTo({ center: targetCam.center, zoom: targetCam.zoom });
        if (ukCam?.zoom != null) map.setMinZoom(Math.min(map.getZoom(), ukCam.zoom));
        map.panBy([0, 40], { animate: false });
      };
      requestAnimationFrame(() => requestAnimationFrame(fit));
      setTimeout(fit, 400);

      if (window.ResizeObserver) {
        let done = false;
        resizeObserver = new ResizeObserver(() => {
          map.resize();
          if (!done && el.clientHeight) {
            done = true;
            fit();
          }
        });
        resizeObserver.observe(el);
      }

      // Re-apply hit-area padding on resize (orientation change, devtools
      // resize, etc.) — applyHitAreaStyle reads window.innerWidth itself,
      // so this just needs to re-trigger it for every existing marker.
      onWindowResize = () => {
        Object.values(markersRef.current).forEach((entry) => {
          applyHitAreaStyle(entry.marker.getElement());
        });
      };
      window.addEventListener("resize", onWindowResize);

      // Expose for the sync effect below without re-running this whole
      // mount effect — a ref, not stashed on the map instance the way the
      // old Leaflet code did.
      tooltipFnsRef.current = { show: showTooltip, hide: hideTooltip };
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (onWindowResize) window.removeEventListener("resize", onWindowResize);
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
      popupsRef.current = {};
      youAreHereRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker visibility + selected style whenever filters/selection
  // change. Tooltip visibility is driven entirely from here (only the
  // selected marker gets a popup) rather than any built-in hover/click
  // auto-toggle, which would race with our own click handler on touch.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const tooltipFns = tooltipFnsRef.current;
    Object.entries(markersRef.current).forEach(([id, entry]) => {
      const on = visibleIds.has(id);
      if (on && !entry.addedToMap) {
        entry.marker.addTo(map);
        entry.addedToMap = true;
      }
      if (!on && entry.addedToMap) {
        entry.marker.remove();
        entry.addedToMap = false;
      }
      applyMarkerStyle(getDotEl(entry.marker), entry.solid, id === selectedId);

      if (id === selectedId) {
        tooltipFns?.show(id);
      } else {
        tooltipFns?.hide(id);
      }
    });
  });

  // Pan/zoom to a focused festival. If already zoomed in past the target
  // level, just re-centre on the new marker rather than zooming back out.
  // The map blurs for the duration of the move and clears once it settles
  // (`moveend`) — reads as the view "loading in" rather than just snapping.
  useEffect(() => {
    if (!focusRequest) return;
    const map = mapRef.current;
    const entry = markersRef.current[focusRequest.id];
    if (!map || !entry) return;
    const targetZoom = Math.max(map.getZoom(), 11);
    const container = map.getContainer();
    container.classList.add("sa-map-transitioning");
    const clear = () => {
      container.classList.remove("sa-map-transitioning");
      map.off("moveend", clear);
    };
    map.on("moveend", clear);
    map.easeTo({ center: entry.marker.getLngLat(), zoom: targetZoom });
  }, [focusRequest]);

  // "View full map" — zoom back out to the whole UK + Ireland extent, not
  // just a crop around whichever markers are currently visible.
  useEffect(() => {
    if (resetRequest == null) return;
    const map = mapRef.current;
    if (!map) return;
    const cam = map.cameraForBounds(UK_IE_BOUNDS);
    if (cam) map.flyTo({ ...cam, duration: 200 });
  }, [resetRequest]);

  return (
    <div
      ref={elRef}
      data-map-root
      className="h-full w-full"
      style={{ background: "#2b2b2b" }}
      role="application"
      aria-label="Map of UK and Ireland street art festivals"
    />
  );
}
