import type * as Leaflet from "leaflet";

export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// How long after mount tiles are treated as part of the initial paint.
// Callers here set an initial view and then immediately re-fit it (e.g.
// MapCanvas's setView placeholder followed by fitBounds), which creates two
// back-to-back tile batches — the first tile layer's own "load" event fires
// for the throwaway placeholder batch, before the real, visible tiles are
// even requested. A fixed window comfortably covers both batches (they're
// both requested within a couple of animation frames of mount) without
// depending on a "load" event that fires too early.
const INITIAL_PAINT_WINDOW_MS = 2000;

/**
 * Leaflet's stock TileLayer never sets `fetchPriority` on the `<img>` tiles
 * it creates, so they compete on equal footing with the JS/font/API requests
 * firing around the same moment the map mounts — even though the tiles are
 * usually this app's largest painted element (its LCP candidate). This
 * marks tiles created during the initial paint window `fetchPriority:
 * "high"` to win that race; later pan/zoom tiles are left at the default
 * priority.
 */
export function addPriorityTileLayer(
  L: typeof Leaflet,
  map: Leaflet.Map,
  options?: Leaflet.TileLayerOptions
): Leaflet.TileLayer {
  const deadline = Date.now() + INITIAL_PAINT_WINDOW_MS;

  const PriorityTileLayer = L.TileLayer.extend({
    createTile(coords: Leaflet.Coords, done: Leaflet.DoneCallback) {
      const tile = (L.TileLayer.prototype as unknown as { createTile: (...args: unknown[]) => HTMLImageElement })
        .createTile.call(this, coords, done);
      if (Date.now() < deadline) tile.fetchPriority = "high";
      return tile;
    },
  });

  return new (PriorityTileLayer as unknown as new (
    url: string,
    opts?: Leaflet.TileLayerOptions
  ) => Leaflet.TileLayer)(TILE_URL, options).addTo(map);
}
