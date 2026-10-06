import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import {
  getAllFestivals,
  getAllMapFestivals,
  getFestival,
  isPast,
  nearbyFestivals,
  nextFestival,
  REGIONS,
  siteUrl,
} from "@/lib/festivals";
import { buildEventJsonLd, buildBreadcrumbJsonLd, metaDescription } from "@/lib/seo";
import { regionSlug } from "@/lib/regions";
import { getEventGalleryImages, getEventLogo } from "@/lib/gallery";
import EventMapPanel from "@/components/festival/EventMapPanel";
import EventListMenu from "@/components/festival/EventListMenu";
import { backAndNext, nearbyItem } from "@/components/festival/FestivalLinks";
import {
  RegionAwareBackAndNext,
  RegionAwareEventListMenu,
  RegionAwareNearby,
} from "@/components/festival/RegionAwareLinks";
import Logo from "@/components/Logo";
import AddToCalendarButton from "@/components/festival/AddToCalendarButton";
import InstagramFeed from "@/components/festival/InstagramFeed";
import StayCard from "@/components/festival/StayCard";

export function generateStaticParams() {
  return getAllFestivals().map((f) => ({ id: f.id }));
}

// Re-render periodically so "Passed" status stays accurate against the real
// date between deploys, not just at build time.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const f = getFestival(id);
  if (!f) return {};
  // dateShort, not dates — the long form ("… Street Party: Sat 16 May, 10am–5pm")
  // pushes several titles past Google's ~60-char SERP truncation point.
  const title = `${f.name} — ${f.city} · ${f.dateShort}`;
  const description = metaDescription(f.summary);
  return {
    title,
    description,
    alternates: { canonical: `/festivals/${f.id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: siteUrl(`/festivals/${f.id}`),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// Temporarily hidden site-wide (desktop + mobile) until stay listings are ready.
const SHOW_PLACES_TO_STAY = false;

// Social labels are stored as "Instagram @handle" / "Facebook Some.Page" —
// split off the network name so it can be rendered with a trailing hyphen.
const formatSocialLabel = (label: string) => {
  const spaceIndex = label.indexOf(" ");
  if (spaceIndex === -1) return label;
  return `${label.slice(0, spaceIndex)} - ${label.slice(spaceIndex + 1)}`;
};

const badgeStyle = (status: string, passed: boolean) =>
  status === "confirmed" && !passed
    ? { background: "var(--color-accent)", color: "var(--color-bg)" }
    : { border: "1px solid var(--color-accent)", color: "var(--color-accent-500)" };

export default async function FestivalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = getFestival(id);
  if (!f) notFound();

  const allMapFestivals = getAllMapFestivals();
  const nearby = nearbyFestivals(f);
  const next = nextFestival(f);
  const galleryImages = getEventGalleryImages(f.id);
  const logo = getEventLogo(f.id);
  const eventJsonLd = buildEventJsonLd(f);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(f);
  const siteShort = f.site.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  return (
    <ViewTransition name="atlas-shell" share="auto" default="none">
    <div
      className="flex flex-col lg:h-[100dvh] lg:overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      <header
        className="z-[5] flex h-[54px] flex-none items-center gap-3.5 px-[18px] py-[11px] shadow-[0_5px_14px_-4px_rgba(0,0,0,.34)]"
      >
        <Link href="/" className="group no-underline">
          <Logo hover className="-translate-y-[2px]" />
        </Link>
        <a
          href={f.site}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto hidden whitespace-nowrap border px-3.5 py-[7px] font-[800] text-[9px] uppercase leading-none tracking-[.08em] no-underline transition-all duration-150 hover:!bg-transparent hover:!text-[var(--color-accent)] lg:inline-block"
          style={{ background: "var(--color-accent)", borderColor: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Official site &#8599;
        </a>
        {/* Mobile/tablet only (EventListMenu's button is lg:hidden) — the
            same "open festival list" affordance Nav.tsx gives the homepage,
            so a visitor who lands straight on an event page can still
            browse the rest of the programme without leaving. */}
        <div className="ml-auto lg:hidden">
          <Suspense fallback={<EventListMenu festivals={allMapFestivals} currentId={f.id} region={null} />}>
            <RegionAwareEventListMenu festivals={allMapFestivals} currentId={f.id} />
          </Suspense>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 flex-col overflow-visible lg:flex-row lg:overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <div
          className="relative aspect-square w-full flex-none lg:aspect-auto lg:w-1/3 lg:max-w-[33.333%]"
        >
          <EventMapPanel festival={f} logo={logo} />
        </div>

        <div className="sa-scroll min-w-0 flex-1 lg:overflow-y-auto">
          <div
            className="relative px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6 md:px-[26px] md:pt-[30px] lg:pb-8"
            style={{ maxWidth: 1280 }}
          >
            {logo && (
              <Image
                src={logo}
                alt={`${f.name} logo`}
                width={112}
                height={112}
                className="sa-scale-fade absolute right-4 top-6 hidden h-16 w-16 object-contain md:right-[26px] md:top-[30px] lg:block sm:h-28 sm:w-28"
              />
            )}

            <div className="mb-3.5 flex flex-col items-start gap-3.5">
              <span
                className="px-[9px] py-[5px] font-[600] text-[10px] uppercase leading-none tracking-[.14em]"
                style={badgeStyle(f.status, isPast(f))}
              >
                {isPast(f) ? "Passed" : f.badge}
              </span>
              <span className="font-[600] text-[10px] uppercase leading-none tracking-[.14em] text-white">
                {f.region} · {f.freq}
              </span>
            </div>

            <h1
              className="m-0 mb-[18px] font-[800] leading-[0.9] tracking-[-0.035em] text-white"
              style={{ fontSize: "clamp(38px,5.2vw,72px)", maxWidth: "18ch", textWrap: "balance" }}
            >
              {f.name}
            </h1>

            <p
              className="m-0 mb-7 text-[17px] leading-[1.5] text-[color-mix(in_srgb,var(--color-text)_82%,transparent)]"
              style={{ maxWidth: "62ch", textWrap: "pretty" }}
            >
              {f.summary}
            </p>

            <hr className="hr m-0" style={{ height: 1, border: 0, background: "var(--color-divider)" }} />

            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                borderBottom: "1px solid var(--color-divider)",
              }}
            >
              <div className="py-4 pb-[18px] pr-[18px]">
                <div className="mb-2 font-[600] text-[13px] uppercase leading-none tracking-[.16em] text-white font-bold">
                  2026 dates
                  {isPast(f) && (
                    <span className="text-[color-mix(in_srgb,var(--color-text)_55%,transparent)]"> — Event passed</span>
                  )}
                </div>
                <div className="font-normal text-[13px] leading-[1.5]">{f.dates}</div>
                <AddToCalendarButton festival={f} />
              </div>
              <div className="py-4 pb-[18px] pr-[18px] lg:border-l lg:pl-[18px] lg:[border-color:var(--color-divider)]">
                <div className="mb-2 font-[600] text-[13px] uppercase leading-none tracking-[.16em] text-white font-bold">
                  Location
                </div>
                <div className="text-[13px] leading-[1.5] text-[color-mix(in_srgb,var(--color-text)_85%,transparent)]">
                  {f.location}
                </div>
                <div className="mt-2 font-[800] text-[13px] leading-none tracking-[.06em]">{f.postcode}</div>
              </div>
              <div className="py-4 pb-[18px] pr-[18px] lg:border-l lg:pl-[18px] lg:[border-color:var(--color-divider)]">
                <div className="mb-[5px] font-[600] text-[13px] uppercase leading-none tracking-[.16em] text-white font-bold">
                  Website
                </div>
                <a
                  href={f.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[600] text-[13px] leading-[1.5]"
                  style={{ wordBreak: "break-all" }}
                >
                  {siteShort}
                </a>
              </div>
              <div className="py-4 pb-[18px] lg:border-l lg:pl-[18px] lg:[border-color:var(--color-divider)]">
                <div className="mb-2 font-[600] text-[13px] uppercase leading-none tracking-[.16em] text-white font-bold">
                  Follow
                </div>
                <div className="flex flex-col gap-[5px]">
                  {f.socials.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="font-[600] text-[13px] leading-[1.5]">
                      {formatSocialLabel(s.label)}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* items-stretch (the grid default) so the "Previous editions" column's
                right-hand border-r stretches to match the Gallery column's height
                instead of stopping at its own shorter content. */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <div
                className="py-[22px] lg:border-r lg:py-[26px] lg:pr-[30px] lg:[border-color:var(--color-divider)]"
              >
                <h2 className="m-0 mb-3.5 font-[800] text-[13px] uppercase leading-none tracking-[.14em] text-white">
                  Previous editions
                </h2>
                <div className="flex flex-col" style={{ borderTop: "1px solid var(--color-divider)" }}>
                  {f.prev.map((p, i) => (
                    <div
                      key={i}
                      className="flex gap-3.5 py-[9px]"
                      style={{ borderBottom: "1px solid var(--color-divider)" }}
                    >
                      <span className="font-[800] text-[12px] leading-[1.35] text-white" style={{ flex: "none", minWidth: "5ch" }}>
                        {p.year}
                      </span>
                      <span className="text-[12.5px] leading-[1.4] text-[color-mix(in_srgb,var(--color-text)_75%,transparent)]">
                        {p.note}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-[22px] px-4 py-3.5" style={{ background: "var(--color-surface)", borderLeft: "2px solid var(--color-accent)" }}>
                  <div className="mb-[7px] font-[600] text-[9px] uppercase leading-none tracking-[.16em] text-white">
                    Status
                  </div>
                  <div className="text-[12.5px] leading-[1.5] text-[color-mix(in_srgb,var(--color-text)_80%,transparent)]">
                    {f.statusNote}
                  </div>
                </div>
              </div>

              {galleryImages.length > 0 && (
                <div
                  className="border-t pb-[22px] pt-[22px] lg:border-t-0 lg:py-[26px] lg:pl-[30px] lg:pt-[26px] [border-color:var(--color-divider)]"
                >
                  <InstagramFeed festival={f} galleryImages={galleryImages} />
                </div>
              )}
            </div>

            {SHOW_PLACES_TO_STAY && (
              <div className="pb-[26px] pt-[22px]" style={{ borderTop: "1px solid var(--color-divider)" }}>
                <div className="mb-3.5 flex items-baseline gap-3">
                  <h2 className="m-0 font-[800] text-[13px] uppercase leading-none tracking-[.14em] text-white">Places to stay</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
                  {f.stays.map((s, i) => (
                    <StayCard key={s.id} stay={s} bordered={i > 0} index={i} />
                  ))}
                </div>
              </div>
            )}

            {nearby.length > 0 && (
              <div className="pt-[22px]" style={{ borderTop: "1px solid var(--color-divider)" }}>
                <h2 className="m-0 mb-3.5 font-[800] text-[13px] uppercase leading-none tracking-[.14em] text-white">
                  Nearby
                </h2>
                <div className="flex flex-col">
                  {/* RegionAwareNearby reads ?region= via useSearchParams,
                      which needs a Suspense boundary to keep this page
                      statically prerenderable — the fallback renders the
                      same markup (nearbyItem, shared with RegionAwareNearby)
                      with regionSlug: null, so there's nothing to duplicate. */}
                  <Suspense fallback={nearby.map((n, i) => nearbyItem(n, i, null))}>
                    <RegionAwareNearby nearby={nearby} />
                  </Suspense>
                </div>
              </div>
            )}

            <div className="pt-[22px]" style={{ borderTop: "1px solid var(--color-divider)" }}>
              <h2 className="m-0 mb-3.5 font-[800] text-[13px] uppercase leading-none tracking-[.14em] text-white">
                Browse by region
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {REGIONS.map((r) => (
                  <Link
                    key={r}
                    href={`/regions/${regionSlug(r)}`}
                    className="inline-flex h-8 items-center whitespace-nowrap border px-[9px] font-[600] text-[9.5px] uppercase tracking-[.08em] no-underline transition-all duration-150 hover:border-accent-500"
                    style={{
                      borderColor: r === f.region ? "var(--color-accent)" : "var(--color-divider)",
                      background: r === f.region ? "var(--color-accent)" : "transparent",
                      color: r === f.region ? "var(--color-bg)" : "var(--color-text)",
                    }}
                  >
                    {r}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Suspense fallback={backAndNext(f.id, next.id, null)}>
                <RegionAwareBackAndNext festivalId={f.id} nextId={next.id} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      {eventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
    </ViewTransition>
  );
}
