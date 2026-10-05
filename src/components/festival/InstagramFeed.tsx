"use client";

import { useState } from "react";
import Image from "next/image";
import type { Festival } from "@/lib/types";

function GalleryTile({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-square overflow-hidden" style={{ background: "var(--color-surface)" }}>
      <div
        aria-hidden
        className="absolute inset-0 grid place-items-center transition-opacity duration-300"
        style={{ opacity: loaded ? 0 : 1 }}
      >
        <div
          style={{
            width: "42%",
            height: "42%",
            background: "var(--color-neutral-800)",
            WebkitMaskImage: "url(/logo.svg)",
            maskImage: "url(/logo.svg)",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      </div>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 20vw, 33vw"
        className="object-cover transition-opacity duration-300"
        style={{ opacity: loaded ? 1 : 0 }}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export default function InstagramFeed({
  festival,
  galleryImages = [],
}: {
  festival: Festival;
  galleryImages?: string[];
}) {
  if (galleryImages.length === 0) return null;

  return (
    <div>
      <div className="mb-3.5 flex items-baseline gap-2.5">
        <h2 className="m-0 font-[800] text-[13px] uppercase leading-none tracking-[.14em] text-white">Gallery</h2>
      </div>

      <div className="grid grid-cols-3 gap-0.5" role="list" aria-label={`${festival.name} — event photos`}>
        {galleryImages.map((src, i) => (
          <div key={src} role="listitem">
            <GalleryTile src={src} alt={`Image from ${festival.name}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
