import Image from "next/image";
import type { Festival } from "@/lib/types";

export default function InstagramFeed({
  festival,
  galleryImages = [],
}: {
  festival: Festival;
  galleryImages?: string[];
}) {
  return (
    <div>
      <div className="mb-3.5 flex items-baseline gap-2.5">
        <h2 className="m-0 font-[800] text-[13px] uppercase leading-none tracking-[.14em] text-white">Gallery</h2>
      </div>

      {galleryImages.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5" role="list" aria-label={`${festival.name} — event photos`}>
          {galleryImages.map((src, i) => (
            <div key={src} role="listitem" className="relative aspect-square overflow-hidden">
              <Image
                src={src}
                alt={`${festival.name} — photo ${i + 1} of ${galleryImages.length}`}
                fill
                sizes="(min-width: 1024px) 20vw, 33vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="font-[500] text-[10px] leading-[1.5] text-[#605d5d] [font-family:ui-monospace,Menlo,monospace]">
          Coming soon...
        </p>
      )}

      {festival.instagramPosts && festival.instagramPosts.length > 0 && (
        <div className="mt-3.5 flex flex-col gap-[5px]">
          <div className="font-[600] text-[9px] uppercase leading-none tracking-[.16em] text-[color-mix(in_srgb,var(--color-text)_45%,transparent)]">
            Recent posts
          </div>
          <div className="flex flex-wrap gap-2">
            {festival.instagramPosts.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-[600] text-[11px] leading-[1.4]"
              >
                Post {i + 1} &#8599;
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
