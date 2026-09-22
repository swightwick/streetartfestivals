"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker, DivIcon } from "leaflet";
import type { Festival } from "@/lib/types";
import { addPriorityTileLayer } from "@/lib/mapTiles";

interface FocusRequest {
  id: string;
  nonce: number;
}

interface MapCanvasProps {
  festivals: Festival[];
  visibleIds: Set<string>;
  selectedId: string | null;
  focusRequest: FocusRequest | null;
  resetRequest?: number | null;
  onMarkerClick: (id: string) => void;
  onTooltipClick: (id: string) => void;
}

export default function MapCanvas({
  festivals,
  visibleIds,
  selectedId,
  focusRequest,
  resetRequest,
  onMarkerClick,
  onTooltipClick,
}: MapCanvasProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, { marker: Marker; solid: boolean }>>({});
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

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current) return;
      const el = elRef.current;

      const map = L.map(el, {
        zoomControl: true,
        attributionControl: true,
        maxZoom: 16,
        zoomSnap: 0.25,
        maxBounds: [
          [49.2, -11.6],
          [61.2, 3.2],
        ],
        maxBoundsViscosity: 1,
        worldCopyJump: false,
        fadeAnimation: false,
      });
      map.setView([54.6, -3.4], 5);
      addPriorityTileLayer(L, map, {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      });
      map.zoomControl.setPosition("bottomright");
      mapRef.current = map;

      let locating = false;
      const handleLocate = (link: HTMLAnchorElement) => {
        if (locating || !navigator.geolocation) return;
        locating = true;
        link.classList.add("leaflet-control-locate-loading");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            locating = false;
            link.classList.remove("leaflet-control-locate-loading");
            const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);

            const nearest = Object.values(markersRef.current)
              .filter((entry) => map.hasLayer(entry.marker))
              .map((entry) => ({ marker: entry.marker, dist: userLatLng.distanceTo(entry.marker.getLatLng()) }))
              .sort((a, b) => a.dist - b.dist)
              .slice(0, 2);

            const youAreHereIcon = L.divIcon({
              className: "",
              iconSize: [16, 16],
              iconAnchor: [8, 8],
              html:
                '<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;' +
                'box-shadow:0 0 0 3px var(--color-bg), 0 0 0 8px rgba(59,130,246,.32);"></div>',
            });
            youAreHereRef.current?.remove();
            youAreHereRef.current = L.marker(userLatLng, { icon: youAreHereIcon, zIndexOffset: 1000 }).addTo(map);

            if (nearest.length) {
              map.fitBounds(L.latLngBounds([userLatLng, ...nearest.map((n) => n.marker.getLatLng())]), {
                padding: [64, 64],
                maxZoom: 13,
                animate: true,
              });
              nearest.forEach((n) => n.marker.openTooltip());
            } else {
              map.setView(userLatLng, 12, { animate: true });
            }
          },
          () => {
            locating = false;
            link.classList.remove("leaflet-control-locate-loading");
            link.classList.add("leaflet-control-locate-error");
            setTimeout(() => link.classList.remove("leaflet-control-locate-error"), 2500);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      };

      const LocateControl = L.Control.extend({
        options: { position: "topright" },
        onAdd() {
          const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
          const link = L.DomUtil.create("a", "", container) as HTMLAnchorElement;
          link.href = "#";
          link.title = "Zoom to my location";
          link.setAttribute("role", "button");
          link.setAttribute("aria-label", "Zoom to my location");
          link.style.display = "flex";
          link.style.alignItems = "center";
          link.style.justifyContent = "center";
          link.innerHTML =
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round"><circle cx="12" cy="12" r="3"></circle>' +
            '<path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path></svg>';
          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.on(link, "click", (e: Event) => {
            L.DomEvent.stop(e);
            handleLocate(link);
          });
          return container;
        },
      });
      new LocateControl().addTo(map);

      const icon = (solid: boolean, sel: boolean) => {
        const size = sel ? 20 : 13;
        const inner = solid
          ? "background:var(--color-accent);"
          : "background:transparent;border:2.5px solid var(--color-accent);";
        return L.divIcon({
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          html:
            '<div style="width:' +
            size +
            "px;height:" +
            size +
            "px;" +
            inner +
            "box-shadow:0 0 0 2px var(--color-bg)" +
            (sel ? ", 0 0 0 7px rgba(223,208,184,.28)" : "") +
            ';transition:all .18s"></div>',
        });
      };

      festivals.forEach((f) => {
        const solid = f.status === "confirmed" || f.status === "month" || f.status === "rolling";
        const marker = L.marker([f.lat, f.lng], {
          icon: icon(solid, f.id === selectedId),
          riseOnHover: true,
          title: f.name,
        }).on("click", () => {
          // First click/tap: zoom in + select (the "sync" effect below opens
          // the tooltip in response to the selection change). Second
          // click/tap on an already-selected marker: navigate. We don't use
          // Leaflet's own bindTooltip hover/click-toggle behaviour at all —
          // on touch it fires its own click-based toggle independently of
          // this handler, racing with it. Tooltip visibility is instead
          // driven purely by our own selectedId state (see the sync effect).
          if (selectedIdRef.current === f.id) {
            onTooltipClickRef.current(f.id);
          } else {
            selectedIdRef.current = f.id;
            onMarkerClickRef.current(f.id);
          }
        });

        if (visibleIds.has(f.id)) marker.addTo(map);
        markersRef.current[f.id] = { marker, solid };
      });

      const bounds = L.latLngBounds(festivals.map((f) => [f.lat, f.lng]));
      const fit = () => {
        if (!el.clientHeight) {
          setTimeout(fit, 150);
          return;
        }
        map.invalidateSize({ animate: false });
        map.setMinZoom(0);
        map.fitBounds(bounds, { padding: [44, 44], animate: false });
        const z = map.getBoundsZoom(bounds, false, L.point(44, 44));
        map.setMinZoom(Math.min(map.getZoom(), z));
      };
      requestAnimationFrame(() => requestAnimationFrame(fit));
      setTimeout(fit, 400);

      if (window.ResizeObserver) {
        let done = false;
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize({ animate: false });
          if (!done && el.clientHeight) {
            done = true;
            fit();
          }
        });
        resizeObserver.observe(el);
      }

      (map as unknown as { _iconFn: typeof icon })._iconFn = icon;
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
      youAreHereRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker visibility + selected icon whenever filters/selection change.
  // Tooltip visibility is driven entirely from here (bound only for the
  // selected marker, as a permanent tooltip) rather than Leaflet's own
  // hover/click auto-toggle — that toggle fires independently of our click
  // handler on touch devices and raced with it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const iconFn = (map as unknown as { _iconFn?: (solid: boolean, sel: boolean) => DivIcon })
      ._iconFn;
    Object.entries(markersRef.current).forEach(([id, entry]) => {
      const on = visibleIds.has(id);
      const has = map.hasLayer(entry.marker);
      if (on && !has) entry.marker.addTo(map);
      if (!on && has) map.removeLayer(entry.marker);
      if (iconFn) entry.marker.setIcon(iconFn(entry.solid, id === selectedId));

      if (id === selectedId) {
        if (!entry.marker.getTooltip()) {
          const f = festivals.find((x) => x.id === id);
          if (f) {
            entry.marker.bindTooltip('<span data-tip-name="1">' + f.name + "</span>", {
              direction: "top",
              offset: [0, -5],
              opacity: 1,
              permanent: true,
              interactive: true,
            });
          }
        }
        entry.marker.openTooltip();
      } else if (entry.marker.getTooltip()) {
        entry.marker.unbindTooltip();
      }
    });
  });

  // Pan/zoom to a focused festival. If already zoomed in past the target
  // level, just re-centre on the new marker rather than zooming back out.
  useEffect(() => {
    if (!focusRequest) return;
    const map = mapRef.current;
    const entry = markersRef.current[focusRequest.id];
    if (!map || !entry) return;
    const targetZoom = Math.max(map.getZoom(), 11);
    map.setView(entry.marker.getLatLng(), targetZoom, { animate: true });
  }, [focusRequest]);

  // "View full map" — zoom back out to fit every visible festival.
  useEffect(() => {
    if (resetRequest == null) return;
    const map = mapRef.current;
    if (!map) return;
    const visible = festivals.filter((f) => visibleIds.has(f.id));
    if (visible.length === 0) return;
    const bounds = visible.map((f) => [f.lat, f.lng] as [number, number]);
    map.flyToBounds(bounds, { padding: [44, 44] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetRequest]);

  return (
    <div
      ref={elRef}
      data-map-root
      className="h-full w-full"
      style={{ background: "#d9d7d4" }}
      role="application"
      aria-label="Map of UK and Ireland street art festivals"
    />
  );
}
