const GA_MEASUREMENT_ID = "G-5LZWJN8J9N";

window.dataLayer = window.dataLayer || [];

function gtag(...args: unknown[]) {
  window.dataLayer.push(args);
}

gtag("js", new Date());
gtag("config", GA_MEASUREMENT_ID);

export function onRouterTransitionStart(url: string) {
  gtag("event", "page_view", { page_path: url });
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}
