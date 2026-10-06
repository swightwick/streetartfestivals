"use client";

import { Fragment, Suspense, useState, ViewTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Festival } from "@/lib/types";
import MapSpinner from "@/components/MapSpinner";
import ArrowIcon from "@/components/ArrowIcon";
import WithRegionParam from "./WithRegionParam";

const EventMap = dynamic(() => import("./EventMap"), {
  ssr: false,
  loading: () => <MapSpinner />,
});

const backToMapLinkClassName =
  "sa-fade absolute left-3 top-3 z-[500] inline-flex flex-none items-center gap-1 whitespace-nowrap border px-3 py-2 font-[800] text-[11px] uppercase leading-none tracking-[.1em] no-underline transition-all duration-150 hover:!bg-accent hover:!text-[var(--color-bg)]";
const backToMapLinkStyle = { background: "var(--color-bg)", borderColor: "var(--color-accent)", color: "#fff" };

export default function EventMapPanel({ festival, logo }: { festival: Festival; logo: string | null }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <ViewTransition name="atlas-map" share="morph" default="none">
        <EventMap festival={festival} onLoad={() => setLoaded(true)} />
      </ViewTransition>
      {!loaded && <MapSpinner />}
      {loaded && (
        // Keyed on festival.id so navigating between events (which doesn't
        // remount this component, only updates its props) still recreates
        // these elements — otherwise the sa-fade entrance animation, which
        // only plays on mount, never replays after the first page load.
        <Fragment key={festival.id}>
          <Suspense
            fallback={
              <Link href="/" className={backToMapLinkClassName} style={backToMapLinkStyle}>
                <ArrowIcon size={20} flip />
                Back to map
              </Link>
            }
          >
            <WithRegionParam>
              {(regionSlug) => (
                <Link
                  href={regionSlug ? `/regions/${regionSlug}` : "/"}
                  className={backToMapLinkClassName}
                  style={backToMapLinkStyle}
                >
                  <ArrowIcon size={20} flip />
                  Back to map
                </Link>
              )}
            </WithRegionParam>
          </Suspense>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${festival.lat},${festival.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sa-fade absolute bottom-3 left-3 z-[500] flex-none whitespace-nowrap border px-4 py-2.5 font-[800] text-[11px] uppercase leading-none tracking-[.1em] no-underline transition-all duration-150 hover:!bg-accent hover:!text-[var(--color-bg)]"
            style={{ background: "var(--color-bg)", borderColor: "var(--color-accent)", color: "#fff" }}
          >
            Google Maps &#8599;
          </a>
          {logo && (
            <Image
              src={logo}
              alt={`${festival.name} logo`}
              width={64}
              height={64}
              className="sa-fade absolute bottom-7 right-3 z-[500] h-16 w-16 object-contain lg:hidden"
            />
          )}
        </Fragment>
      )}
    </>
  );
}
