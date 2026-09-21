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
          {galleryImages.map((src) => (
            <div key={src} role="listitem" className="relative aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${festival.name} photo`} className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      ) : (
        <p className="font-[500] text-[10px] leading-[1.5] text-[#605d5d] [font-family:ui-monospace,Menlo,monospace]">
          Coming soon...
        </p>
      )}
    </div>
  );
}
