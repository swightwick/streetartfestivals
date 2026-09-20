import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ minHeight: "100dvh", background: "var(--color-bg)" }}
    >
      <span className="font-[600] text-[10px] uppercase leading-none tracking-[.16em] text-accent-500">
        404
      </span>
      <h1 className="m-0 font-[800] text-[32px] leading-[1.1] tracking-[-0.02em] text-white">
        That page doesn&apos;t exist
      </h1>
      <p className="m-0 max-w-[46ch] text-[14px] leading-[1.5] text-[color-mix(in_srgb,var(--color-text)_75%,transparent)]">
        The festival or page you&apos;re looking for isn&apos;t on the map. Head back to the atlas.
      </p>
      <Link
        href="/"
        className="mt-2 px-4 py-2 font-[800] text-[11px] uppercase leading-none tracking-[.1em] no-underline"
        style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
      >
        &#8249; Map &amp; calendar
      </Link>
    </div>
  );
}
