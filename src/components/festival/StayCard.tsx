"use client";

import { useState } from "react";
import type { Stay } from "@/lib/types";

export default function StayCard({ stay, bordered }: { stay: Stay; bordered: boolean }) {
  const [shot, setShot] = useState(0);
  const n = stay.shots.length;
  const step = (delta: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShot((s) => (s + delta + n) % n);
  };
  const slug = stay.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div
      id={`stay-${stay.id}`}
      className={`flex flex-col items-start gap-[5px] pb-[17px] pt-[15px] text-left transition-colors duration-150 hover:bg-surface lg:px-4 ${
        bordered ? "lg:border-l lg:[border-color:var(--color-divider)]" : ""
      }`}
    >
      <div
        className="grayscale-tile relative mb-[9px] w-full overflow-hidden"
        style={{
          aspectRatio: "4/3",
          background:
            "repeating-linear-gradient(135deg, var(--color-surface) 0 7px, color-mix(in srgb, var(--color-surface) 82%, white) 7px 14px)",
        }}
      >
        <span className="absolute bottom-[7px] left-2 font-[500] text-[8.5px] leading-[1.2] tracking-[.04em] text-[#8d8a88] [font-family:ui-monospace,Menlo,monospace]">
          {slug} · {stay.shots[shot]}
        </span>
        <button
          type="button"
          aria-label="Previous photo"
          onClick={step(-1)}
          className="absolute left-0 top-0 bottom-0 grid w-[26px] place-items-center border-0 bg-transparent font-[800] text-[15px] leading-none text-[var(--color-text)] transition-all duration-150 hover:bg-[rgba(19,18,17,.55)]"
        >
          &#8249;
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={step(1)}
          className="absolute right-0 top-0 bottom-0 grid w-[26px] place-items-center border-0 bg-transparent font-[800] text-[15px] leading-none text-[var(--color-text)] transition-all duration-150 hover:bg-[rgba(19,18,17,.55)]"
        >
          &#8250;
        </button>
        <span className="absolute bottom-2 right-2 flex gap-1">
          {stay.shots.map((_, i) => (
            <span
              key={i}
              className="h-[5px] w-[5px]"
              style={{ background: i === shot ? "var(--color-accent)" : "rgba(243,242,242,.4)" }}
            />
          ))}
        </span>
      </div>
      <span className="font-[600] text-[9px] uppercase leading-none tracking-[.16em] text-[color-mix(in_srgb,var(--color-text)_50%,transparent)]">
        {stay.kind}
      </span>
      <span className="font-[800] text-[14px] leading-[1.2]">{stay.name}</span>
      <span className="text-[11.5px] leading-[1.45] text-[color-mix(in_srgb,var(--color-text)_70%,transparent)]">
        {stay.detail}
      </span>
      <span className="mt-0.5 flex items-baseline gap-2">
        <span className="font-[800] text-[12px] leading-none tracking-[.02em]">{stay.price}</span>
        <span className="font-[600] text-[10px] uppercase leading-none tracking-[.06em] text-[color-mix(in_srgb,var(--color-text)_50%,transparent)]">
          {stay.walk}
        </span>
      </span>
    </div>
  );
}
