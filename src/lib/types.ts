export type FestivalStatus = "confirmed" | "month" | "rolling" | "tbc" | "none";

export interface PrevEdition {
  year: string;
  note: string;
}

export interface Social {
  label: string;
  url: string;
}

export interface Stay {
  id: string;
  kind: string;
  name: string;
  detail: string;
  price: string;
  priceValue: number;
  walk: string;
  lat: number;
  lng: number;
  shots: string[];
}

export interface Festival {
  id: string;
  name: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  site: string;
  location: string;
  postcode: string;
  dates: string;
  dateShort: string;
  start: string | null;
  end: string | null;
  extra: string[];
  month: string | null;
  status: FestivalStatus;
  badge: string;
  freq: string;
  statusNote: string;
  summary: string;
  prev: PrevEdition[];
  socials: Social[];
  instagram: { handle: string; url: string };
  instagramPosts?: string[];
  stays: Stay[];
}

export interface SiteData {
  site: {
    name: string;
    tagline: string;
    url: string;
    accent: string;
    today: string;
  };
  regions: string[];
  festivals: Festival[];
}
