"use client";

import type { Festival } from "@/lib/types";
import { SITE, isPast } from "@/lib/festivals";

function pad(s: string) {
  return s.replace(/-/g, "");
}
function plusOneDay(s: string) {
  const t = new Date(s + "T00:00:00Z");
  t.setUTCDate(t.getUTCDate() + 1);
  return t.toISOString().slice(0, 10).replace(/-/g, "");
}
function esc(s: string) {
  return String(s || "")
    .replace(/[\\;,]/g, (m) => "\\" + m)
    .replace(/\n/g, "\\n");
}

function vevent(f: Festival, start: string, end: string, suffix: string) {
  return [
    "BEGIN:VEVENT",
    `UID:${f.id}${suffix}@${new URL(SITE.url).host}`,
    `DTSTAMP:${pad(SITE.today)}T090000Z`,
    `DTSTART;VALUE=DATE:${pad(start)}`,
    `DTEND;VALUE=DATE:${plusOneDay(end)}`,
    `SUMMARY:${esc(f.name)}`,
    `LOCATION:${esc(f.location + ", " + f.postcode)}`,
    `DESCRIPTION:${esc(f.summary + "\n" + f.site)}`,
    `URL:${f.site}`,
    "END:VEVENT",
  ].join("\r\n");
}

export default function AddToCalendarButton({ festival }: { festival: Festival }) {
  if (!festival.start || isPast(festival)) return null;

  const download = () => {
    const blocks = [vevent(festival, festival.start!, festival.end || festival.start!, "")].concat(
      festival.extra.map((x, i) => vevent(festival, x, x, "-x" + i))
    );
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//streetartfestivalsuk//atlas//EN", "CALSCALE:GREGORIAN"]
      .concat(blocks)
      .concat(["END:VCALENDAR"])
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${festival.id}-2026.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <button
      type="button"
      onClick={download}
      className="mt-[11px] flex items-center gap-[7px] border px-[11px] py-[7px] font-[800] text-[10px] uppercase leading-none tracking-[.1em] transition-all duration-150 hover:bg-accent hover:text-[var(--color-bg)]"
      style={{ borderColor: "var(--color-accent)", background: "transparent", color: "var(--color-accent-700)" }}
    >
      + Add to calendar
    </button>
  );
}
