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

export function sortKey(f: Festival): string {
  if (f.start) return "1" + f.start;
  if (f.month) return "1" + f.month + "-99";
  if (f.status === "rolling") return "2";
  if (f.status === "tbc") return "3" + f.name;
  return "4" + f.name;
}

export function sortedFestivals(list: Festival[] = getAllFestivals()): Festival[] {
  return [...list].sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1));
}

export function isPast(f: Festival, today: string = SITE.today): boolean {
  const last =
    f.extra && f.extra.length
      ? [f.end || f.start, ...f.extra].filter(Boolean).sort().pop()
      : f.end || f.start;
  return !!last && last < today;
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
