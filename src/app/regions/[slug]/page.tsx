import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { REGIONS, SITE, getAllFestivals, getAllMapFestivals, siteUrl, sortedFestivals } from "@/lib/festivals";
import { metaDescription } from "@/lib/seo";
import { regionFromSlug, regionSlug } from "@/lib/regions";
import AtlasApp from "@/components/atlas/AtlasApp";

export function generateStaticParams() {
  return REGIONS.map((region) => ({ slug: regionSlug(region) }));
}

// Re-render periodically so "Passed"/"Confirmed" badges and calendar state
// stay accurate against the real date between deploys, matching the
// homepage and festival pages this reuses.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const region = regionFromSlug(slug);
  if (!region) return {};

  const festivals = sortedFestivals(getAllFestivals().filter((f) => f.region === region));
  const title = `Street art & graffiti festivals in ${region}`;
  const description = metaDescription(
    `${festivals.length} street art and graffiti festival${festivals.length === 1 ? "" : "s"} in ${region}: ${festivals
      .map((f) => f.name)
      .join(", ")}.`,
  );

  return {
    title,
    description,
    alternates: { canonical: `/regions/${slug}` },
    openGraph: { type: "website", title, description, url: siteUrl(`/regions/${slug}`) },
    twitter: { card: "summary", title, description },
  };
}

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const region = regionFromSlug(slug);
  if (!region) notFound();

  const festivals = getAllFestivals();
  const regionFestivals = sortedFestivals(festivals.filter((f) => f.region === region));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Map & calendar", item: siteUrl("/") },
      { "@type": "ListItem", position: 2, name: region, item: siteUrl(`/regions/${slug}`) },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Street art & graffiti festivals in ${region}`,
    numberOfItems: regionFestivals.length,
    itemListElement: regionFestivals.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: siteUrl(`/festivals/${f.id}`),
      name: f.name,
    })),
  };

  return (
    <>
      <h1 className="sr-only">
        {SITE.name} — street art and graffiti festivals in {region}
      </h1>
      {/* Same shell as the homepage (map + programme list), just pre-filtered
          to this region and with the map initially cropped to it, rather
          than a separate layout to maintain. */}
      <AtlasApp festivals={getAllMapFestivals()} initialRegion={region} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
    </>
  );
}
