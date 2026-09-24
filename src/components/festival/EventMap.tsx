"use client";

import { useEffect, useRef } from "react";
import type { Festival } from "@/lib/types";
import { addPriorityTileLayer } from "@/lib/mapTiles";

export default function EventMap({ festival, onLoad }: { festival: Festival; onLoad?: () => void }) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
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
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current) return;

      const map = L.map(elRef.current, {
        zoomControl: true,
        attributionControl: false,
        fadeAnimation: false,
        maxZoom: 19,
      });
      const tiles = addPriorityTileLayer(L, map, { maxZoom: 19 });
      // Fire once the visible tiles have actually finished loading, not just
      // once the Leaflet instance exists — otherwise the overlay buttons fade
      // in while the map underneath is still a blank grey placeholder.
      tiles.on("load", () => onLoadRef.current?.());
      map.zoomControl.setPosition("topright");
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => map.invalidateSize({ animate: false }));
        ro.observe(elRef.current);
        (map as unknown as { _ro?: ResizeObserver })._ro = ro;
      }
    })();

    return () => {
      cancelled = true;
      const map = mapRef.current;
      const ro = (map as unknown as { _ro?: ResizeObserver } | null)?._ro;
      ro?.disconnect();
      map?.remove();
      mapRef.current = null;
      layerRef.current = null;
      shownIdRef.current = null;
    };
  }, []);

  // Swap in the current festival's markers and fly to it — animated for
  // every festival after the first, which the create-effect above already
  // places without animating in from nowhere.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      const layer = layerRef.current;
      if (cancelled || !map || !layer) return;

      const isFirst = shownIdRef.current === null;
      shownIdRef.current = festival.id;
      layer.clearLayers();

      const eventIcon = L.divIcon({
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        html:
          '<div style="width:20px;height:20px;background:var(--color-accent);' +
          'box-shadow:0 0 0 2px var(--color-bg), 0 0 0 7px rgba(223,208,184,.28);"></div>',
      });
      const stayIcon = L.divIcon({
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        html: '<div style="width:16px;height:16px;background:#000;box-shadow:0 0 0 2px #fff"></div>',
      });

      L.marker([festival.lat, festival.lng], { icon: eventIcon, title: festival.name }).addTo(layer);

      festival.stays.forEach((s) => {
        L.marker([s.lat, s.lng], { icon: stayIcon, title: s.name })
          .addTo(layer)
          .bindTooltip(
            `<span data-tip-name="1">${s.name}</span><span style="opacity:.65;font-weight:600"> · ${s.kind} · ${s.walk}</span>`,
            { direction: "top", offset: [0, -4], opacity: 1 }
          )
          .on("click", () => {
            document.getElementById(`stay-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
      });

      if (isFirst) {
        map.setView([festival.lat, festival.lng], 14, { animate: false });
      } else {
        map.flyTo([festival.lat, festival.lng], 14, { duration: 0.75 });
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
      style={{ background: "#d9d7d4" }}
      role="application"
      aria-label={`Interactive map showing ${festival.name} in ${festival.city} and nearby places to stay`}
    />
  );
}
