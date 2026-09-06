import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { I18nProvider } from '../../i18n';
import LayerMapView from './LayerMapView';
import type { OpenDataFeatureCollection } from '../../pages/web/OpenDataPage';

// `vi.mock` factories are hoisted above the rest of the module, so the mock
// fns they reference must be created through `vi.hoisted` — a plain
// top-level `const` here would throw "Cannot access before initialization".
const { addControl, addSource, addLayer, fitBounds, remove, MapMock } = vi.hoisted(() => {
  const addControl = vi.fn();
  const on = vi.fn((event: string, cb: () => void) => {
    if (event === 'load') cb();
  });
  const addSource = vi.fn();
  const addLayer = vi.fn();
  const fitBounds = vi.fn();
  const remove = vi.fn();
  // `new maplibregl.Map(...)` needs a real constructor — an arrow-function
  // implementation has no `[[Construct]]` and throws "is not a constructor".
  const MapMock = vi.fn().mockImplementation(function () {
    return { addControl, on, addSource, addLayer, fitBounds, remove };
  });
  return { addControl, on, addSource, addLayer, fitBounds, remove, MapMock };
});

// The component uses `import * as maplibregl from 'maplibre-gl'` (the
// package ships no default export) — mock the named exports directly, not
// wrapped in a `default` key.
vi.mock('maplibre-gl', () => ({
  Map: MapMock,
  NavigationControl: vi.fn(),
  ScaleControl: vi.fn(),
  // Same arrow-function-can't-construct pitfall as `MapMock` above.
  LngLatBounds: vi.fn().mockImplementation(function () {
    return { extend: vi.fn(), isEmpty: () => false };
  }),
}));

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

const sampleCollection: OpenDataFeatureCollection = {
  type: 'FeatureCollection',
  truncated: false,
  features: [
    {
      type: 'Feature',
      id: 'feat-1',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [69.1, 41.2],
            [69.2, 41.2],
            [69.2, 41.3],
            [69.1, 41.2],
          ],
        ],
      },
      properties: { name: { uz_latn: 'Uchastka 1' }, props: {}, valid_from: null, valid_to: null },
    },
  ],
};

function renderMap(collection: OpenDataFeatureCollection = sampleCollection) {
  return render(
    <I18nProvider>
      <LayerMapView collection={collection} />
    </I18nProvider>,
  );
}

describe('LayerMapView', () => {
  it('mounts without throwing and constructs a MapLibre map', () => {
    const { unmount } = renderMap();

    expect(MapMock).toHaveBeenCalledTimes(1);
    expect(addControl).toHaveBeenCalledTimes(2);
    expect(addSource).toHaveBeenCalledTimes(1);
    expect(addLayer).toHaveBeenCalledTimes(3);
    expect(fitBounds).toHaveBeenCalledTimes(1);

    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
