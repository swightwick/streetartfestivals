import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/festivals";

// Served for every path while proxy.ts rewrites to it (see HOLDING_PAGE in
// src/proxy.ts) — noindex so the temporary placeholder never competes with
// the real pages once the site is live.
export const metadata: Metadata = {
  title: "Coming soon",
  description: SITE.tagline,
  robots: { index: false, follow: false },
};

export default function ComingSoon() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-col items-center justify-center gap-5 px-6 text-center"
      style={{ minHeight: "100dvh", background: "var(--color-bg)" }}
    >
      <Logo iconSize={40} textSize="30px" />
      <h1 className="font-[600] text-[10px] uppercase leading-none tracking-[.16em] text-accent-500">
        Launching soon
      </h1>
      <p className="m-0 max-w-[46ch] text-[14px] leading-[1.5] text-[color-mix(in_srgb,var(--color-text)_75%,transparent)]">
        {SITE.tagline} Back online shortly.
      </p>
    </main>
  );
}
