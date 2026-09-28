"use client";

import { useState } from "react";
import Image from "next/image";
import type { Stay } from "@/lib/types";

// public/hotels holds 3 folders of 3 stock photos each — one folder per
// "places to stay" card position, cycled with `index % 3` since every
// festival has exactly 3 stays. Not tied to any real property.
const HOTEL_FOLDERS = ["1", "2", "3"];

export default function StayCard({ stay, bordered, index }: { stay: Stay; bordered: boolean; index: number }) {
  const [shot, setShot] = useState(0);
  const folder = HOTEL_FOLDERS[index % HOTEL_FOLDERS.length];
  const shots = ["1", "2", "3"].map((n) => `/hotels/${folder}/${n}.avif`);
  const n = shots.length;
  const step = (delta: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShot((s) => (s + delta + n) % n);
  };

  return (
    <div
      id={`stay-${stay.id}`}
      className={`group flex flex-col items-start gap-[5px] pb-[17px] pt-[15px] text-left transition-colors duration-150 hover:bg-surface lg:px-4 ${
        bordered ? "lg:border-l lg:[border-color:var(--color-divider)]" : ""
      }`}
    >
      <div
        className="grayscale-tile relative mb-[9px] w-full overflow-hidden"
        style={{ aspectRatio: "4/3", background: "var(--color-surface)" }}
      >
        <Image
          src={shots[shot]}
          alt={`${stay.name} — photo ${shot + 1} of ${n}`}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover"
        />
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
          {shots.map((_, i) => (
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
