"use client";

import Link from "next/link";
import type { Festival } from "@/lib/types";
import { isDated, isPast, regionsCount } from "@/lib/festivals";

interface ProgrammeListProps {
  list: Festival[];
  allCount: number;
  selectedId: string | null;
  onHover: (id: string) => void;
}

export default function ProgrammeList({ list, allCount, selectedId, onHover }: ProgrammeListProps) {
  const dated = list.filter(isDated).length;

  return (
    <div className="sa-scroll flex h-full min-h-0 flex-col overflow-y-auto">
      <div
        className="sticky top-0 z-[3] flex flex-wrap items-center gap-x-5 gap-y-1.5 px-5 py-3"
        style={{ background: "var(--color-bg)", borderBottom: "2px solid var(--color-divider)" }}
      >
        <span className="font-[600] text-[13px] uppercase leading-none tracking-[.08em] text-[color-mix(in_srgb,var(--color-text)_58%,transparent)]">
          <b className="font-[800] text-white">{allCount}</b> festivals
        </span>
        <span className="font-[600] text-[13px] uppercase leading-none tracking-[.08em] text-[color-mix(in_srgb,var(--color-text)_58%,transparent)]">
          <b className="font-[800] text-white">{dated}</b> dated 2026
        </span>
        <span className="font-[600] text-[13px] uppercase leading-none tracking-[.08em] text-[color-mix(in_srgb,var(--color-text)_58%,transparent)]">
          <b className="font-[800] text-white">{regionsCount(list)}</b> regions
        </span>
      </div>

      <div className="flex flex-col px-5 pb-3.5">
        {list.map((f) => {
          const active = f.id === selectedId;
          const dot = isDated(f)
            ? { background: "var(--color-accent)" }
            : { border: "2px solid var(--color-accent)" };
          const badgeStyle =
            f.status === "confirmed"
              ? { background: "var(--color-accent)", color: "var(--color-bg)" }
              : {
                  border: "1px solid color-mix(in srgb, var(--color-accent) 70%, transparent)",
                  color: "var(--color-accent-500)",
                };
          return (
            <Link
              key={f.id}
              href={`/festivals/${f.id}`}
              onMouseEnter={() => onHover(f.id)}
              className="flex items-start gap-2.5 border-0 py-[18px] pl-0.5 pr-1 text-left text-text no-underline transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
              style={{
                borderBottom: "1px solid var(--color-divider)",
                background: active ? "color-mix(in srgb, var(--color-accent) 14%, transparent)" : "transparent",
              }}
            >
              <span className="mt-[5px] block h-[9px] w-[9px] flex-none" style={dot} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-[7px]">
                  <span className="font-[800] text-[15px] leading-[1.2] tracking-[-0.01em] text-white">{f.name}</span>
                  <span
                    className="px-[5px] py-[2px] font-[600] text-[8px] uppercase leading-none tracking-[.1em]"
                    style={badgeStyle}
                  >
                    {f.badge}
                  </span>
                </span>
                <span className="mt-1 block font-[600] text-[9px] uppercase leading-none tracking-[.1em] text-[color-mix(in_srgb,var(--color-text)_42%,transparent)] text-white">
                  {f.city} · {f.region}
                </span>
              </span>
              <span
                className="line-clamp-2 flex-none self-center text-right text-[11px] leading-[1.45] text-[color-mix(in_srgb,var(--color-text)_62%,transparent)]"
                style={{ maxWidth: "22ch", ...(isPast(f) ? { textDecoration: "line-through" } : undefined) }}
              >
                {f.dateShort}
              </span>
              <span className="self-center font-[800] text-[13px] leading-none text-accent-500">&#8250;</span>
            </Link>
          );
        })}
        {list.length === 0 && (
          <p className="py-6 text-center text-[12px] text-[color-mix(in_srgb,var(--color-text)_55%,transparent)]">
            No festivals match those filters.
          </p>
        )}
      </div>
    </div>
  );
}
