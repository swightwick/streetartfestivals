const GA_MEASUREMENT_ID = "G-5LZWJN8J9N";
const COOKIE_CONSENT_KEY = "streetartfestivals:cookie-consent";

// Guarded for SSR: this file is normally only ever loaded in the browser
// (Next.js's instrumentation-client convention), but AtlasApp also imports
// grantAnalyticsConsent/declineAnalyticsConsent directly, which pulls this
// module into the server-rendered path for that "use client" component too.
const isBrowser = typeof window !== "undefined";

if (isBrowser) window.dataLayer = window.dataLayer || [];

function gtag(...args: unknown[]) {
  if (isBrowser) window.dataLayer.push(args);
}

function hasAnalyticsConsent(): boolean {
  if (!isBrowser) return false;
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

let analyticsStarted = false;

function startAnalytics() {
  if (analyticsStarted) return;
  analyticsStarted = true;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
}

// Only resumes tracking for a returning visitor who already accepted — a
// fresh visitor stays untracked until they respond to the cookie notice in
// the welcome modal (see AtlasApp's grantAnalyticsConsent/declineAnalyticsConsent calls).
if (hasAnalyticsConsent()) startAnalytics();

export function grantAnalyticsConsent() {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
  } catch {
    // Ignore — analytics just won't persist consent across reloads.
  }
  startAnalytics();
}

export function declineAnalyticsConsent() {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
  } catch {
    // Ignore.
  }
}

export function onRouterTransitionStart(url: string) {
  if (!analyticsStarted) return;
  gtag("event", "page_view", { page_path: url });
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}
