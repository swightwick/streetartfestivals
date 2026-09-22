import raw from "@/data/data.json";
import type { Festival, SiteData } from "@/lib/types";

const data = raw as SiteData;

export const SITE = data.site;
export const REGIONS = data.regions;

export function getAllFestivals(): Festival[] {
  return data.festivals;
}

export function getFestival(id: string): Festival | undefined {
  return data.festivals.find((f) => f.id === id);
}

function lastRelevantDate(f: Festival): string | null | undefined {
  return f.extra && f.extra.length
    ? [f.end || f.start, ...f.extra].filter(Boolean).sort().pop()
    : f.end || f.start;
}

// The wall-clock date, not a hand-maintained field — a stored "today" drifts
// stale between deploys and silently mislabels every "Passed"/"Confirmed"
// badge, the calendar's today marker, and the ICS DTSTAMP.
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isPast(f: Festival, today: string = todayIso()): boolean {
  const last = lastRelevantDate(f);
  return !!last && last < today;
}

// Invert a "YYYY-MM-DD" date so that ascending string sort on the result
// orders the underlying dates newest-first instead of oldest-first.
function invertDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return [9999 - y, 99 - m, 99 - d]
    .map((n, i) => String(n).padStart(i === 0 ? 4 : 2, "0"))
    .join("-");
}

// Ranking, top to bottom: upcoming dated/month events (soonest first), then
// rolling, then TBC, then events that have already happened (most recent
// first), then anything with no date info at all (alphabetical).
export function sortKey(f: Festival, today: string = todayIso()): string {
  const date = f.start ?? (f.month ? f.month + "-99" : undefined);
  if (date) {
    return isPast(f, today) ? "3" + invertDate(f.start ?? date) : "0" + date;
  }
  if (f.status === "rolling") return "1";
  if (f.status === "tbc") return "2" + f.name;
  return "4" + f.name;
}

export function sortedFestivals(list: Festival[] = getAllFestivals()): Festival[] {
  return [...list].sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1));
}

export function isDated(f: Festival): boolean {
  return f.status === "confirmed" || f.status === "month" || f.status === "rolling";
}

export function eventsOnDay(list: Festival[], dayIso: string): Festival[] {
  return list.filter((f) => {
    if (f.start && dayIso >= f.start && dayIso <= (f.end || f.start)) return true;
    return !!(f.extra && f.extra.includes(dayIso));
  });
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface NearbyFestival {
  festival: Festival;
  distanceKm: number;
}

export function nearbyFestivals(current: Festival, count = 4): NearbyFestival[] {
  return getAllFestivals()
    .filter((f) => f.id !== current.id)
    .map((f) => ({ festival: f, distanceKm: haversineKm(current, f) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);
}

export function regionsCount(list: Festival[]): number {
  return new Set(list.map((f) => f.region)).size;
}

export function siteUrl(path = ""): string {
  return SITE.url.replace(/\/$/, "") + path;
}
