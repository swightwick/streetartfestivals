"use client";

import { useMemo, useState } from "react";
import type { Festival } from "@/lib/types";
import { eventsOnDay, SITE } from "@/lib/festivals";

const MON = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

interface CalendarPanelProps {
  festivals: Festival[];
  onOpen: (id: string) => void;
  fillHeight?: boolean;
}

export default function CalendarPanel({ festivals, onOpen, fillHeight = false }: CalendarPanelProps) {
  const today = SITE.today;
  const [month, setMonth] = useState(8);
  const [year, setYear] = useState(2026);
  const [cal, setCal] = useState<"month" | "year">("month");

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(year, month, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const dim = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const prevDim = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const total = Math.ceil((lead + dim) / 7) * 7;
    const out = [];
    for (let i = 0; i < total; i++) {
      const n = i - lead + 1;
      const inM = n >= 1 && n <= dim;
      let num: number;
      let dIso: string;
      if (n < 1) {
        num = prevDim + n;
        dIso = iso(month === 0 ? year - 1 : year, (month + 11) % 12, num);
      } else if (n > dim) {
        num = n - dim;
        dIso = iso(month === 11 ? year + 1 : year, (month + 1) % 12, num);
      } else {
        num = n;
        dIso = iso(year, month, n);
      }
      const evs = inM ? eventsOnDay(festivals, dIso) : [];
      const isToday = dIso === today;
      const firstCol = i % 7 === 0;
      out.push({ key: dIso, num, inM, evs, isToday, firstCol });
    }
    return out;
  }, [festivals, month, year, today]);

  const yearMonths = useMemo(() => {
    return MON.map((name, mi) => {
      const lead = (new Date(Date.UTC(year, mi, 1)).getUTCDay() + 6) % 7;
      const dim = new Date(Date.UTC(year, mi + 1, 0)).getUTCDate();
      let any = false;
      const days = [];
      for (let i = 0; i < 42; i++) {
        const n = i - lead + 1;
        if (n < 1 || n > dim) {
          days.push({ num: "", evs: 0 });
          continue;
        }
        const dIso = iso(year, mi, n);
        const evs = eventsOnDay(festivals, dIso).length;
        if (evs) any = true;
        days.push({ num: n, evs, isToday: dIso === today });
      }
      return { name: MONS[mi], mi, days, any };
    });
  }, [festivals, year, today]);

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const notes = festivals
    .filter((f) => f.month === monthPrefix)
    .map((f) => ({ id: f.id, text: `${f.name} — September 2026, exact weekend announced via socials` }));

  const tabClass =
    "px-[13px] py-[7px] font-[800] text-[12px] uppercase leading-none tracking-[.09em] cursor-pointer border-0";

  const weekCount = cells.length / 7;

  return (
    <div
      className={`sa-scroll relative z-[550] min-h-0 ${fillHeight ? "flex h-full flex-col overflow-hidden" : "max-h-[340px] overflow-y-auto"}`}
      style={{
        background: "var(--color-surface)",
        boxShadow: fillHeight ? undefined : "0 -1px 0 rgba(0,0,0,.14), 0 -7px 18px -6px rgba(0,0,0,.32)",
      }}
    >
      <div
        className="flex flex-none items-center gap-2.5 py-[7px] pl-5 pr-3.5"
        style={{ borderBottom: "1px solid var(--color-divider)" }}
      >
        <span className="font-[800] text-[19px] leading-none tracking-[-0.01em]">
          {MON[month]} {year}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="grid h-[34px] w-[34px] place-items-center border font-[800] text-[17px] leading-none hover:bg-accent hover:text-[var(--color-bg)]"
            style={{ borderColor: "var(--color-divider)", background: "transparent", color: "var(--color-text)" }}
          >
            &#8249;
          </button>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="grid h-[34px] w-[34px] place-items-center border font-[800] text-[17px] leading-none hover:bg-accent hover:text-[var(--color-bg)]"
            style={{ borderColor: "var(--color-divider)", background: "transparent", color: "var(--color-text)" }}
          >
            &#8250;
          </button>
          <div className="ml-1.5 flex border" style={{ borderColor: "var(--color-divider)" }}>
            <button
              type="button"
              onClick={() => setCal("month")}
              className={tabClass}
              style={{
                background: cal === "month" ? "var(--color-accent)" : "transparent",
                color: cal === "month" ? "var(--color-bg)" : "var(--color-text)",
              }}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setCal("year")}
              className={tabClass}
              style={{
                background: cal === "year" ? "var(--color-accent)" : "transparent",
                color: cal === "year" ? "var(--color-bg)" : "var(--color-text)",
              }}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {cal === "month" && (
        <div className={fillHeight ? "flex min-h-0 flex-1 flex-col" : undefined}>
          <div className="flex-none grid grid-cols-7 pb-1">
            {DOW.map((d) => (
              <div
                key={d}
                className="px-0 pb-0.5 pt-[5px] text-center font-[600] text-[11px] uppercase leading-none tracking-[.08em] text-[color-mix(in_srgb,var(--color-text)_45%,transparent)]"
              >
                {d}
              </div>
            ))}
          </div>
          <div
            className={fillHeight ? "grid min-h-0 flex-1 grid-cols-7" : "grid grid-cols-7"}
            style={{
              borderTop: "1px solid var(--color-divider)",
              gridTemplateRows: fillHeight ? `repeat(${weekCount}, 1fr)` : undefined,
            }}
          >
            {cells.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={c.evs.length ? () => onOpen(c.evs[0].id) : undefined}
                disabled={!c.evs.length}
                className={`flex flex-col gap-0.5 px-1 pb-1 pt-[3px] text-left hover:enabled:bg-black disabled:cursor-default ${fillHeight ? "" : "aspect-square"}`}
                style={{
                  borderRight: "1px solid var(--color-divider)",
                  borderBottom: "1px solid var(--color-divider)",
                  background: "transparent",
                  opacity: c.inM ? 1 : 0.28,
                  cursor: c.evs.length ? "pointer" : "default",
                }}
              >
                <span
                  className="font-[700] text-[13px] leading-none [font-variant-numeric:tabular-nums]"
                  style={
                    c.isToday
                      ? {
                          background: "var(--color-accent)",
                          color: "var(--color-bg)",
                          width: 21,
                          height: 21,
                          display: "grid",
                          placeItems: "center",
                        }
                      : {
                          color: c.evs.length
                            ? "var(--color-text)"
                            : "color-mix(in srgb, var(--color-text) 58%, transparent)",
                          padding: "2px 1px",
                        }
                  }
                >
                  {c.num}
                </span>
                {c.evs.slice(0, 2).map((f) => {
                  const label = c.key === f.start || c.firstCol || f.extra.includes(c.key);
                  return (
                    <div
                      key={f.id}
                      className="min-h-4 overflow-hidden whitespace-nowrap text-ellipsis px-[3px] py-[1px] font-[700] text-[10.5px] leading-[1.25] tracking-[.01em] text-white"
                      style={{ background: f.status === "confirmed" ? "var(--color-accent)" : "var(--color-accent-700)" }}
                    >
                      {label ? f.name : ""}
                    </div>
                  );
                })}
                {c.evs.length > 2 && (
                  <div className="px-[3px] font-[700] text-[10.5px] leading-[1.25] text-accent-400">
                    +{c.evs.length - 2}
                  </div>
                )}
              </button>
            ))}
          </div>
          {notes.length > 0 && (
            <div
              className="flex flex-none flex-col gap-[5px] px-5 pb-2 pt-1.5"
              style={{ borderTop: "1px solid var(--color-divider)" }}
            >
              {notes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onOpen(n.id)}
                  className="flex items-center gap-2 border-0 bg-transparent p-0 text-left text-text hover:text-accent-400"
                >
                  <span className="block h-[9px] w-[9px] flex-none border-2" style={{ borderColor: "var(--color-accent)" }} />
                  <span className="text-[13px] leading-[1.35] text-[color-mix(in_srgb,var(--color-text)_70%,transparent)]">
                    {n.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {cal === "year" && (
        <div
          className="grid grid-cols-3 gap-px"
          style={{ background: "var(--color-divider)", borderTop: "1px solid var(--color-divider)" }}
        >
          {yearMonths.map((m) => (
            <button
              key={m.name}
              type="button"
              onClick={() => {
                setCal("month");
                setMonth(m.mi);
              }}
              className="cursor-pointer border-0 px-[9px] pb-[9px] pt-2 text-left hover:bg-black"
              style={{ background: "var(--color-surface)", color: "var(--color-text)" }}
            >
              <div
                className="mb-[5px] font-[800] text-[12.5px] uppercase leading-none tracking-[.06em]"
                style={{ color: m.any ? "var(--color-text)" : "color-mix(in srgb, var(--color-text) 40%, transparent)" }}
              >
                {m.name}
              </div>
              <div className="grid grid-cols-7">
                {m.days.map((d, i) => (
                  <span
                    key={i}
                    className="grid h-4 place-items-center font-[500] text-[10px] leading-none [font-variant-numeric:tabular-nums]"
                    style={{
                      fontWeight: d.evs ? 800 : 500,
                      background: d.evs ? "var(--color-accent)" : "transparent",
                      color: d.evs ? "var(--color-bg)" : "color-mix(in srgb, var(--color-text) 45%, transparent)",
                      outline: d.isToday && !d.evs ? "1px solid var(--color-accent-500)" : undefined,
                    }}
                  >
                    {d.num}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
