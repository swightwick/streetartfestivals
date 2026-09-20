import type { Festival } from "@/lib/types";

export default function InstagramFeed({
  festival,
  galleryImages = [],
}: {
  festival: Festival;
  galleryImages?: string[];
}) {
  const { handle, url } = festival.instagram;
  const posts = festival.instagramPosts ?? [];

  return (
    <div>
      <div className="mb-3.5 flex items-baseline gap-2.5">
        <h2 className="m-0 font-[800] text-[13px] uppercase leading-none tracking-[.14em] text-white">Gallery</h2>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[600] text-[11px] leading-none tracking-[.04em]"
        >
          {handle}
        </a>
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
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5" role="list" aria-label={`${handle} — last ${posts.length} Instagram posts`}>
          {posts.map((postUrl) => {
            const postHandle = new URL(postUrl).pathname.split("/").filter(Boolean)[0];
            return (
              <a
                key={postUrl}
                href={postUrl}
                target="_blank"
                rel="noopener noreferrer"
                role="listitem"
                aria-label={`View post by @${postHandle} on Instagram`}
                className="grayscale-tile group relative flex aspect-square items-end justify-start p-[7px] transition-[filter] duration-150 hover:brightness-125"
                style={{
                  background:
                    "repeating-linear-gradient(135deg, var(--color-surface) 0 7px, color-mix(in srgb, var(--color-surface) 82%, white) 7px 14px)",
                }}
              >
                <span className="absolute right-[7px] top-[7px] font-[800] text-[11px] leading-none text-accent-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  &#8599;
                </span>
                <span className="font-[500] text-[8px] leading-[1.2] tracking-[.04em] text-[#8d8a88] [font-family:ui-monospace,Menlo,monospace]">
                  @{postHandle}
                </span>
              </a>
            );
          })}
        </div>
      ) : (
        <p className="font-[500] text-[10px] leading-[1.5] text-[#605d5d] [font-family:ui-monospace,Menlo,monospace]">
          No live feed available — {handle} doesn&apos;t currently resolve on Instagram.
        </p>
      )}
    </div>
  );
}
