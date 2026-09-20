import type { Festival } from "@/lib/types";
import { siteUrl } from "@/lib/festivals";

function cleanPostcode(postcode: string): string {
  return postcode.split(/[(/]/)[0].trim();
}

/**
 * Only festivals with a confirmed, fully-dated 2026 edition get Event
 * structured data — Google's guidance is not to mark up events without a
 * clear bookable date, so TBC / rolling / "no 2026 edition" festivals are
 * described in plain content instead.
 */
export function buildEventJsonLd(f: Festival) {
  if (!f.start) return null;

  const isFree = /\bfree\b/i.test(f.summary);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": siteUrl(`/festivals/${f.id}#event`),
    name: f.name,
    url: siteUrl(`/festivals/${f.id}`),
    description: f.summary,
    startDate: f.start,
    endDate: f.end || f.start,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: `${f.name} — ${f.city}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: f.location,
        addressLocality: f.city,
        addressRegion: f.region,
        postalCode: cleanPostcode(f.postcode),
        addressCountry: "GB",
      },
    },
    organizer: {
      "@type": "Organization",
      name: f.name,
      url: f.site,
    },
    ...(isFree
      ? {
          offers: {
            "@type": "Offer",
            url: f.site,
            price: "0",
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function buildBreadcrumbJsonLd(f: Festival) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Map & calendar", item: siteUrl("/") },
      { "@type": "ListItem", position: 2, name: f.name, item: siteUrl(`/festivals/${f.id}`) },
    ],
  };
}
