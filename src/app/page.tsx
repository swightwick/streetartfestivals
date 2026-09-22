import type { Metadata } from "next";
import AtlasApp from "@/components/atlas/AtlasApp";
import { getAllFestivals, siteUrl, SITE, sortedFestivals } from "@/lib/festivals";

// Re-render periodically so "Passed"/"Confirmed" badges and calendar state
// stay accurate against the real date between deploys, not just at build time.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${SITE.name} — UK & Ireland street art festival guide`,
  description: SITE.tagline,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const festivals = getAllFestivals();
  const ordered = sortedFestivals(festivals);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UK & Ireland street art and graffiti festivals",
    description: SITE.tagline,
    numberOfItems: ordered.length,
    itemListElement: ordered.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: siteUrl(`/festivals/${f.id}`),
      name: f.name,
    })),
  };

  return (
    <>
      <h1 className="sr-only">
        {SITE.name} — every street art and graffiti festival in the UK and Ireland
      </h1>
      <AtlasApp festivals={festivals} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </>
  );
}
