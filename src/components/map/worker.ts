/**
 * MapLibre parses every GeoJSON source in a Web Worker, and its ESM build
 * spawns that worker from `new URL('./maplibre-gl-worker.mjs', import.meta.url)`
 * INSIDE the library — a reference Vite does not see, so the production
 * build shipped no worker at all. `vite dev` served it from `node_modules`
 * and every map worked; on the stand `/assets/maplibre-gl-worker.mjs` was a
 * 404, the source never finished loading, and both maps drew nothing but
 * their background colour (Oybek, 2026-09-10: «map не работает же»).
 *
 * `?worker&url` makes Vite bundle the worker — with the `maplibre-gl-shared`
 * module it imports — into a chunk of its own and hand back that chunk's
 * URL; `setWorkerUrl` must run before the first `Map` is constructed, which
 * is why both map components import this module for its side effect.
 */
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

maplibregl.setWorkerUrl(workerUrl);
