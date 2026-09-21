"use client";

import { useState, ViewTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Festival } from "@/lib/types";

const EventMap = dynamic(() => import("./EventMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center" style={{ background: "#d9d7d4" }}>
      <span className="font-[600] text-[10px] uppercase tracking-[.1em] text-[#7d7979]">Loading map…</span>
    </div>
  ),
});

export default function EventMapPanel({
  festival,
  logo,
}: {
  festival: Festival;
  logo: string | null;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <ViewTransition name="atlas-map" share="morph" default="none">
        <EventMap festival={festival} onLoad={() => setLoaded(true)} />
      </ViewTransition>
      {loaded && (
        <>
          <Link
            href="/"
            className="sa-fade absolute left-3 top-3 z-[500] flex-none whitespace-nowrap border px-4 py-2.5 font-[800] text-[11px] uppercase leading-none tracking-[.1em] transition-all duration-150 hover:!bg-accent hover:!text-[var(--color-bg)] hover:no-underline"
            style={{ background: "var(--color-bg)", borderColor: "var(--color-accent)", color: "#fff" }}
          >
            &#8249; Back to map
          </Link>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${festival.lat},${festival.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sa-fade absolute bottom-3 left-3 z-[500] flex-none whitespace-nowrap border px-4 py-2.5 font-[800] text-[11px] uppercase leading-none tracking-[.1em] transition-all duration-150 hover:!bg-accent hover:!text-[var(--color-bg)] hover:no-underline"
            style={{ background: "var(--color-bg)", borderColor: "var(--color-accent)", color: "#fff" }}
          >
            Google Maps &#8599;
          </a>
          {logo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logo}
              alt={`${festival.name} logo`}
              className="sa-fade absolute bottom-3 right-3 z-[500] h-16 w-16 object-contain lg:hidden"
            />
          )}
        </>
      )}
    </>
  );
}
