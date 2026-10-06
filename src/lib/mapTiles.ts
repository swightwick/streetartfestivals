// MapTiler's hosted style.json rather than tile.openstreetmap.org directly:
// the latter is explicitly for light/dev use only (its usage policy
// disallows production traffic, and it sends `cache-control: no-cache` so
// every tile is refetched on every load). This also isn't raster tiles —
// it's a MapLibre vector style. MapTiler's raster styles are rendered
// on-demand server-side from vector data the first time any unique
// tile/zoom/style combo is requested (cold tiles measured 1.7-6.3s), then
// cached; the underlying vector tiles are pre-cut once globally instead and
// measured consistently fast (0.1-0.25s) even on never-requested
// coordinates, because the style is applied client-side by MapLibre rather
// than rendered per-style on MapTiler's servers. The key is restricted (see
// MapTiler dashboard) to this site's domains, so it's safe to expose via
// NEXT_PUBLIC_.
export const MAP_STYLE_URL = `https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;
export const MAP_ATTRIBUTION =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// MapLibre computes its own worker script's URL at runtime from the already
// *bundled* chunk's import.meta.url plus a dynamically-built filename — a
// pattern Turbopack can't statically analyze, so it doesn't know to serve
// that file and the Worker fails to load (map tiles never render, only the
// overlay markers/controls do). `node_modules/maplibre-gl/dist/
// maplibre-gl-worker.mjs` *and* the `./maplibre-gl-shared.mjs` chunk it
// imports are copied to `public/` (keep both in sync if the maplibre-gl
// version bumps) and referenced by their plain served paths, sidestepping
// bundler asset-resolution entirely. Must run before any `new Map()` call.
export async function loadMapLibre() {
  const maplibregl = await import("maplibre-gl");
  maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
  return maplibregl;
}
