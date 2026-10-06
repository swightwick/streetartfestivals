"use client";

import { useEffect, useRef } from "react";
import type { Festival } from "@/lib/types";
import { MAP_STYLE_URL, MAP_ATTRIBUTION, loadMapLibre } from "@/lib/mapTiles";

// Temporarily hidden alongside the "Places to stay" section (see
// SHOW_PLACES_TO_STAY in festivals/[id]/page.tsx) until stay listings are ready.
const SHOW_STAY_MARKERS = false;

export default function EventMap({ festival, onLoad }: { festival: Festival; onLoad?: () => void }) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markersRef = useRef<import("maplibre-gl").Marker[]>([]);
  const roRef = useRef<ResizeObserver | null>(null);
  const shownIdRef = useRef<string | null>(null);
  const onLoadRef = useRef(onLoad);
  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  // Create the map once. It's kept alive across festival changes (see the
  // effect below) instead of being torn down and rebuilt, so navigating
  // between events (e.g. "Next event") pans/zooms smoothly to the new
  // marker rather than instantly snapping to it.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const maplibregl = await loadMapLibre();
      if (cancelled || !elRef.current) return;

      const map = new maplibregl.Map({
        container: elRef.current,
        style: MAP_STYLE_URL,
        center: [0, 0], // overwritten by the festival effect's first jumpTo
        zoom: 0,
        maxZoom: 19,
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
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      // Fire once the style and initial tiles have actually finished loading,
      // not just once the MapLibre instance exists — otherwise the overlay
      // buttons fade in while the map underneath is still a blank placeholder.
      map.on("load", () => onLoadRef.current?.());
      mapRef.current = map;

      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => map.resize());
        ro.observe(elRef.current);
        roRef.current = ro;
      }
    })();

    return () => {
      cancelled = true;
      roRef.current?.disconnect();
      roRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = [];
      shownIdRef.current = null;
    };
  }, []);

  // Swap in the current festival's markers and fly to it — animated for
  // every festival after the first, which the create-effect above already
  // places without animating in from nowhere.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const maplibregl = await loadMapLibre();
      const map = mapRef.current;
      if (cancelled || !map) return;

      const isFirst = shownIdRef.current === null;
      shownIdRef.current = festival.id;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const eventEl = document.createElement("div");
      eventEl.style.cssText =
        "width:20px;height:20px;background:var(--color-accent);" +
        "box-shadow:0 0 0 2px var(--color-bg), 0 0 0 7px rgba(223,208,184,.28);";
      eventEl.title = festival.name;
      eventEl.setAttribute("aria-label", festival.name);
      markersRef.current.push(
        new maplibregl.Marker({ element: eventEl, anchor: "center" })
          .setLngLat([festival.lng, festival.lat])
          .addTo(map)
      );

      if (SHOW_STAY_MARKERS) {
        festival.stays.forEach((s) => {
          const stayEl = document.createElement("div");
          stayEl.style.cssText = "width:16px;height:16px;background:#000;box-shadow:0 0 0 2px #fff;";
          stayEl.title = `${s.name} · ${s.kind} · ${s.walk}`;
          stayEl.addEventListener("click", () => {
            document.getElementById(`stay-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          markersRef.current.push(
            new maplibregl.Marker({ element: stayEl, anchor: "center" }).setLngLat([s.lng, s.lat]).addTo(map)
          );
        });
      }

      if (isFirst) {
        map.jumpTo({ center: [festival.lng, festival.lat], zoom: 14 });
      } else {
        map.flyTo({ center: [festival.lng, festival.lat], zoom: 14, duration: 750 });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [festival.id]);

  return (
    <div
      ref={elRef}
      className="absolute inset-0"
      style={{ background: "#2b2b2b" }}
      role="application"
      aria-label={
        SHOW_STAY_MARKERS
          ? `Interactive map showing ${festival.name} in ${festival.city} and nearby places to stay`
          : `Interactive map showing ${festival.name} in ${festival.city}`
      }
    />
  );
}
