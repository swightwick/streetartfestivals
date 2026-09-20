"use client";

import { useEffect, useRef } from "react";
import type { Festival } from "@/lib/types";

export default function EventMap({ festival }: { festival: Festival }) {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current) return;

      map = L.map(elRef.current, {
        zoomControl: true,
        attributionControl: false,
        fadeAnimation: false,
        maxZoom: 19,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      map.zoomControl.setPosition("topright");

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
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        html: '<div style="width:12px;height:12px;background:#000;box-shadow:0 0 0 2px #fff"></div>',
      });

      L.marker([festival.lat, festival.lng], { icon: eventIcon, title: festival.name }).addTo(map);

      festival.stays.forEach((s) => {
        L.marker([s.lat, s.lng], { icon: stayIcon, title: s.name })
          .addTo(map!)
          .bindTooltip(
            `<span data-tip-name="1">${s.name}</span><span style="opacity:.65;font-weight:600"> · ${s.kind} · ${s.walk}</span>`,
            { direction: "top", offset: [0, -4], opacity: 1 }
          );
      });

      map.setView([festival.lat, festival.lng], 14, { animate: false });

      if (window.ResizeObserver && elRef.current) {
        const ro = new ResizeObserver(() => map?.invalidateSize({ animate: false }));
        ro.observe(elRef.current);
        (map as unknown as { _ro?: ResizeObserver })._ro = ro;
      }
    })();

    return () => {
      cancelled = true;
      const ro = (map as unknown as { _ro?: ResizeObserver } | null)?._ro;
      ro?.disconnect();
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [festival.id]);

  return (
    <div
      ref={elRef}
      className="absolute inset-0"
      style={{ background: "#d9d7d4" }}
      role="img"
      aria-label={`Map showing ${festival.name} in ${festival.city} and nearby places to stay`}
    />
  );
}
