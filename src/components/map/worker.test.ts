import { expect, it, vi } from 'vitest';

vi.mock('maplibre-gl', () => ({ setWorkerUrl: vi.fn() }));
vi.mock('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url', () => ({
  default: '/assets/maplibre-gl-worker-test.js',
}));

/**
 * The production build once shipped no MapLibre worker at all: the library's
 * own `new URL('./maplibre-gl-worker.mjs', import.meta.url)` is invisible to
 * Vite, `vite dev` hid it by serving `node_modules`, and on the stand every
 * GeoJSON source waited forever on a 404. This pins the one line that fixes
 * it — the bundled worker's URL is registered the moment the module loads,
 * before any `Map` can be constructed.
 */
it('registers the bundled worker URL at import time', async () => {
  const maplibregl = await import('maplibre-gl');
  await import('./worker');
  expect(maplibregl.setWorkerUrl).toHaveBeenCalledWith('/assets/maplibre-gl-worker-test.js');
});
