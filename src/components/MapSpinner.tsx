import { LogoIcon } from "@/components/Logo";

export default function MapSpinner() {
  return (
    <div
      className="absolute inset-0 z-[600] grid place-items-center"
      style={{ background: "#2b2b2b" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-9 w-9">
          <LogoIcon size={36} className="absolute inset-0 text-[#555]" />
          {/* Orange fill rises and falls inside the grey mark below — clipped
              from the top, so animating that clip from 100% to 0% reveals it
              bottom-up like a liquid fill, rather than a generic spinner. */}
          <div className="sa-loader-fill absolute inset-0">
            <LogoIcon size={36} className="text-accent" />
          </div>
        </div>
        <span className="font-[600] text-[10px] uppercase tracking-[.1em] text-[#7d7979]">Loading map…</span>
      </div>
    </div>
  );
}
