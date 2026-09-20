"use client";

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

export default function EventMapLoader({ festival }: { festival: Festival }) {
  return <EventMap festival={festival} />;
}
