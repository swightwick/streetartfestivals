import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/festivals";

// Linked only from the welcome modal's "Cookie preferences" control — not
// in the main nav or sitemap.ts, so it stays out of search results and the
// site's own navigation without needing auth or a build flag to hide it.
export const metadata: Metadata = {
  title: "Cookie policy",
  description: `How ${SITE.name} uses cookies and local storage.`,
  robots: { index: false, follow: false },
};

const sectionHeading = "mb-2 font-[700] text-[10px] uppercase leading-none tracking-[.1em] text-accent-500";
const body = "m-0 text-[13.5px] leading-[1.6] text-[color-mix(in_srgb,var(--color-text)_85%,transparent)]";

export default function CookiePolicy() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex max-w-[640px] flex-col gap-8 px-6 py-16"
      style={{ minHeight: "100dvh", background: "var(--color-bg)" }}
    >
      <div>
        <Logo iconSize={36} textSize="20px" gapClassName="gap-2" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-[800] text-[22px] leading-tight">Cookie policy</h1>
        <p className={body}>
          {SITE.name} is a small, independent, non-commercial guide. This page explains the handful of
          cookies and local storage entries the site can use, and how to change your mind about them.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className={sectionHeading}>Strictly necessary</h2>
        <p className={body}>
          A couple of small <code>localStorage</code> entries remember that you&rsquo;ve seen the welcome
          message and which cookie choice you made, so you&rsquo;re not asked again on every visit.
          These aren&rsquo;t cookies and aren&rsquo;t sent to a server — they stay in your browser. The
          map itself also loads map tiles from MapTiler, which is required for the map to render at all.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className={sectionHeading}>Analytics (optional)</h2>
        <p className={body}>
          If you accept the cookie prompt, we load Google Analytics (GA4) to see which festivals get
          the most interest and how people find the site. This sets Google&rsquo;s own analytics
          cookies (e.g. <code>_ga</code>, <code>_ga_*</code>) in your browser and shares some traffic
          data, including your IP address, with Google. We don&rsquo;t sell or share this data with
          anyone else, and nothing is loaded until you accept. See{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit underline"
          >
            Google&rsquo;s privacy policy
          </a>{" "}
          for details on how they handle it.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className={sectionHeading}>Changing your mind</h2>
        <p className={body}>
          You can accept or decline analytics the first time you visit, and change your choice at any
          time via the &ldquo;Cookie preferences&rdquo; link in the site&rsquo;s info panel (open it from
          the map, then look next to the build credit). Declining, or clearing your browser&rsquo;s site
          data, stops analytics from loading.
        </p>
      </section>

      <Link
        href="/"
        className="mt-2 inline-block font-[800] text-[11px] uppercase leading-none tracking-[.1em] text-accent-500 transition-colors duration-150 hover:text-accent-400"
      >
        &#8249; Back to map
      </Link>
    </main>
  );
}
