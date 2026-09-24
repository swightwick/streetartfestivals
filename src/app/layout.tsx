import type { Metadata, Viewport } from "next";
import ReactDOM from "react-dom";
import { Archivo } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { SITE, siteUrl } from "@/lib/festivals";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — UK & Ireland street art festival guide`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.tagline,
  applicationName: SITE.name,
  keywords: [
    "street art festival",
    "graffiti festival UK",
    "mural festival",
    "Upfest",
    "street art map",
    "graffiti events UK 2026",
  ],
  authors: [{ name: SITE.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — UK & Ireland street art festival guide`,
    description: SITE.tagline,
    url: siteUrl("/"),
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — UK & Ireland street art festival guide`,
    description: SITE.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#3e2a47",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Every page mounts a Leaflet map whose tiles come from here — its largest
  // painted element (LCP) on most screens. Preconnecting shaves the
  // DNS/TLS/TCP handshake off the moment the client-side map code actually
  // requests the first tile.
  ReactDOM.preconnect("https://tile.openstreetmap.org");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": siteUrl("/#website"),
        url: siteUrl("/"),
        name: SITE.name,
        description: SITE.tagline,
        inLanguage: "en-GB",
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl("/")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": siteUrl("/#organization"),
        name: SITE.name,
        url: siteUrl("/"),
        description: SITE.tagline,
        areaServed: ["GB", "IE"],
      },
    ],
  };

  return (
    <html lang="en" className={`${archivo.variable} h-full`}>
      <body className="min-h-full antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[2000] focus:px-4 focus:py-2.5 focus:font-[800] focus:text-[11px] focus:uppercase focus:leading-none focus:tracking-[.1em]"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
