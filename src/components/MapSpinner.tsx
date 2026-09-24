export default function MapSpinner() {
  return (
    <div
      className="absolute inset-0 z-[600] grid place-items-center"
      style={{ background: "#d9d7d4" }}
    >
      <div className="flex flex-col items-center gap-2.5">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2"
          style={{ borderColor: "rgba(0,0,0,.15)", borderTopColor: "var(--color-accent)" }}
        />
        <span className="font-[600] text-[10px] uppercase tracking-[.1em] text-[#7d7979]">Loading map…</span>
      </div>
    </div>
  );
}
