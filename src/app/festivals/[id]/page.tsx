import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import {
  getAllFestivals,
  getFestival,
  isPast,
  nearbyFestivals,
  siteUrl,
} from "@/lib/festivals";
import { buildEventJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getEventGalleryImages, getEventLogo } from "@/lib/gallery";
import EventMapLoader from "@/components/festival/EventMapLoader";
import AddToCalendarButton from "@/components/festival/AddToCalendarButton";
import InstagramFeed from "@/components/festival/InstagramFeed";
import StayCard from "@/components/festival/StayCard";

export function generateStaticParams() {
  return getAllFestivals().map((f) => ({ id: f.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const f = getFestival(id);
  if (!f) return {};
  const title = `${f.name} — ${f.city} · ${f.dates}`;
  return {
    title,
    description: f.summary,
    alternates: { canonical: `/festivals/${f.id}` },
    openGraph: {
      type: "article",
      title,
      description: f.summary,
      url: siteUrl(`/festivals/${f.id}`),
    },
    twitter: {
      card: "summary",
      title,
      description: f.summary,
    },
  };
}

const badgeStyle = (status: string) =>
  status === "confirmed"
    ? { background: "var(--color-accent)", color: "var(--color-bg)" }
    : { border: "1px solid var(--color-accent)", color: "var(--color-accent-500)" };

export default async function FestivalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = getFestival(id);
  if (!f) notFound();

  const nearby = nearbyFestivals(f);
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
        className="z-[5] flex h-[54px] flex-none items-center gap-3.5 px-[18px] py-[11px] shadow-[0_1px_0_rgba(0,0,0,.14),0_5px_14px_-4px_rgba(0,0,0,.34)]"
      >
        <span className="whitespace-nowrap font-[800] text-[24px] leading-[0.9] tracking-[-0.035em] text-accent">
          streetart<span className="text-white">festivals</span>uk
        </span>
        <a
          href={f.site}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto px-3.5 py-[7px] font-[800] text-[11px] uppercase leading-none tracking-[.1em] no-underline"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Official site &#8599;
        </a>
      </header>

      <div className="flex flex-1 flex-col overflow-visible lg:flex-row lg:overflow-hidden" style={{ minHeight: 0 }}>
        <div
          className="relative aspect-square w-full flex-none lg:aspect-auto lg:w-1/3 lg:max-w-[33.333%]"
        >
          <ViewTransition name="atlas-map" share="morph" default="none">
            <EventMapLoader festival={f} />
          </ViewTransition>
          <Link
            href="/"
            className="absolute left-3 top-3 z-[500] flex-none whitespace-nowrap border px-4 py-2.5 font-[800] text-[11px] uppercase leading-none tracking-[.1em] transition-all duration-150 hover:bg-accent hover:text-[var(--color-bg)]"
            style={{ background: "var(--color-bg)", borderColor: "var(--color-accent)", color: "#fff" }}
          >
            &#8249; Back to map
          </Link>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 left-3 z-[500] flex-none whitespace-nowrap border px-2.5 py-[7px] font-[800] text-[9px] uppercase leading-none tracking-[.08em] transition-all duration-150 hover:bg-accent hover:text-[var(--color-bg)]"
            style={{ background: "var(--color-bg)", borderColor: "var(--color-accent)", color: "var(--color-accent-700)" }}
          >
            Google Maps &#8599;
          </a>
        </div>

        <div className="sa-scroll min-w-0 flex-1 lg:overflow-y-auto">
          <div className="relative px-4 pb-[60px] pt-6 md:px-[26px] md:pt-[30px] md:pb-8" style={{ maxWidth: 1280 }}>
            {logo && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logo}
                alt={`${f.name} logo`}
                className="absolute right-4 top-6 h-16 w-16 object-contain md:right-[26px] md:top-[30px] sm:h-28 sm:w-28"
              />
            )}

            <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
              <span
                className="px-[9px] py-[5px] font-[600] text-[10px] uppercase leading-none tracking-[.14em]"
                style={badgeStyle(f.status)}
              >
                {f.badge}
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

            <hr className="hr m-0" style={{ height: 2, border: 0, background: "var(--color-divider)" }} />

            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                borderBottom: "2px solid var(--color-divider)",
              }}
            >
              <div className="py-4 pb-[18px] pr-[18px]">
                <div className="mb-2 font-[600] text-[13px] uppercase leading-none tracking-[.16em] text-white font-bold">
                  2026 dates
                </div>
                <div
                  className="font-normal text-[13px] leading-[1.5]"
                  style={isPast(f) ? { textDecoration: "line-through", textDecorationThickness: 2 } : undefined}
                >
                  {f.dates}
                </div>
                <AddToCalendarButton festival={f} />
              </div>
              <div className="py-4 pb-[18px] pl-[18px] pr-[18px] lg:border-l lg:[border-color:var(--color-divider)]">
                <div className="mb-2 font-[600] text-[13px] uppercase leading-none tracking-[.16em] text-white font-bold">
                  Location
                </div>
                <div className="text-[13px] leading-[1.5] text-[color-mix(in_srgb,var(--color-text)_85%,transparent)]">
                  {f.location}
                </div>
                <div className="mt-2 font-[800] text-[13px] leading-none tracking-[.06em]">{f.postcode}</div>
              </div>
              <div className="py-4 pb-[18px] pl-[18px] pr-[18px] lg:border-l lg:[border-color:var(--color-divider)]">
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
              <div className="py-4 pb-[18px] pl-[18px] lg:border-l lg:[border-color:var(--color-divider)]">
                <div className="mb-2 font-[600] text-[13px] uppercase leading-none tracking-[.16em] text-white font-bold">
                  Follow
                </div>
                <div className="flex flex-col gap-[5px]">
                  {f.socials.map((s) => (
                    <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="font-[600] text-[13px] leading-[1.5]">
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
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

              <div
                className="border-t pt-[22px] lg:border-t-0 lg:py-[26px] lg:pl-[30px] lg:pt-[26px] [border-color:var(--color-divider)]"
              >
                <InstagramFeed festival={f} galleryImages={galleryImages} />
              </div>
            </div>

            <div className="pb-[26px] pt-[22px]" style={{ borderTop: "2px solid var(--color-divider)" }}>
              <div className="mb-3.5 flex items-baseline gap-3">
                <h2 className="m-0 font-[800] text-[13px] uppercase leading-none tracking-[.14em] text-white">Places to stay</h2>
                <span className="font-[600] text-[10px] uppercase leading-none tracking-[.1em] text-[color-mix(in_srgb,var(--color-text)_45%,transparent)]">
                  Placeholder listings · black pins on the map
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
                {f.stays.map((s, i) => (
                  <StayCard key={s.id} stay={s} bordered={i > 0} />
                ))}
              </div>
            </div>

            {nearby.length > 0 && (
              <div className="pt-[22px]" style={{ borderTop: "2px solid var(--color-divider)" }}>
                <h2 className="m-0 mb-3.5 font-[800] text-[13px] uppercase leading-none tracking-[.14em] text-white">
                  Nearby
                </h2>
                <div className="flex flex-wrap gap-2">
                  {nearby.map(({ festival: r, distanceKm }) => (
                    <Link
                      key={r.id}
                      href={`/festivals/${r.id}`}
                      className="flex flex-col items-start gap-[5px] px-3.5 py-[11px] text-text no-underline transition-all duration-150 hover:bg-black"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-divider)",
                        minWidth: 200,
                      }}
                    >
                      <span className="font-[800] text-[12.5px] leading-[1.2] text-white">{r.name}</span>
                      <span className="flex items-baseline gap-[7px]">
                        <span
                          className="font-[400] text-[10.5px] leading-none text-[color-mix(in_srgb,var(--color-text)_60%,transparent)]"
                          style={isPast(r) ? { textDecoration: "line-through" } : undefined}
                        >
                          {r.dateShort}
                        </span>
                        <span className="font-[600] text-[10px] leading-none text-accent-500">
                          {Math.round(distanceKm)} km
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/"
              className="mt-6 flex items-center justify-center gap-2 border px-4 py-3 font-[800] text-[11px] uppercase leading-none tracking-[.1em] text-text no-underline transition-all duration-150 hover:bg-accent hover:text-white"
              style={{ borderColor: "var(--color-divider)" }}
            >
              &#8249; Back to map
            </Link>
          </div>
        </div>
      </div>

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
