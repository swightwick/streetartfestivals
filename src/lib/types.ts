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
  stays: Stay[];
}

// The subset of a Festival actually needed to render the map, programme
// list, calendar and search — used instead of the full Festival on the
// homepage and region pages, which would otherwise serialize every
// festival's summary/prev editions/socials/stays to the client just to
// plot a pin and a list row. The per-festival detail page still uses the
// full Festival.
export type MapFestival = Pick<
  Festival,
  | "id"
  | "name"
  | "city"
  | "region"
  | "lat"
  | "lng"
  | "postcode"
  | "location"
  | "start"
  | "end"
  | "extra"
  | "month"
  | "status"
  | "badge"
  | "dateShort"
>;

export interface SiteData {
  site: {
    name: string;
    tagline: string;
    url: string;
  };
  regions: string[];
  festivals: Festival[];
}
