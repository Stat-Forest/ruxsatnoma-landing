import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PermitContourMap from './PermitContourMap';
import type { MapGeometry } from './types';
import { I18nProvider } from '../../i18n';

// `vi.mock` factories are hoisted above the rest of the module, so the mock
// fns they reference must be created through `vi.hoisted` — a plain
// top-level `const` here would throw "Cannot access before initialization".
// Same idiom as `MapPage.test.tsx`'s own maplibre mock.
const { addControl, addSource, addLayer, fitBounds, remove, extend, MapMock } = vi.hoisted(() => {
  const addControl = vi.fn();
  const on = vi.fn((event: string, cb: () => void) => {
    if (event === 'load') cb();
  });
  const addSource = vi.fn();
  const addLayer = vi.fn();
  const fitBounds = vi.fn();
  const remove = vi.fn();
  const extend = vi.fn();
  // `new maplibregl.Map(...)` needs a real constructor — an arrow-function
  // implementation has no `[[Construct]]` and throws "is not a constructor".
  const MapMock = vi.fn().mockImplementation(function () {
    return { addControl, on, addSource, addLayer, fitBounds, remove };
  });
  return { addControl, on, addSource, addLayer, fitBounds, remove, extend, MapMock };
});

// The component uses `import * as maplibregl from 'maplibre-gl'` (the
// package ships no default export) — mock the named exports directly, not
// wrapped in a `default` key.
vi.mock('maplibre-gl', () => ({
  Map: MapMock,
  NavigationControl: vi.fn(),
  // `worker.ts` registers the bundled worker at import time; the mock only has to accept it.
  setWorkerUrl: vi.fn(),
  ScaleControl: vi.fn(),
  // Same arrow-function-can't-construct pitfall as `MapMock` above.
  LngLatBounds: vi.fn().mockImplementation(function () {
    return { extend, isEmpty: () => false };
  }),
}));

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

const samplePolygon: MapGeometry = {
  type: 'Polygon',
  coordinates: [
    [
      [69.1, 41.2],
      [69.2, 41.2],
      [69.2, 41.3],
      [69.1, 41.2],
    ],
  ],
};

const otherPolygon: MapGeometry = {
  type: 'Polygon',
  coordinates: [
    [
      [70.1, 40.2],
      [70.2, 40.2],
      [70.2, 40.3],
      [70.1, 40.2],
    ],
  ],
};

function renderMap(contour: MapGeometry) {
  return render(
    <I18nProvider>
      <PermitContourMap contour={contour} />
    </I18nProvider>,
  );
}

describe('PermitContourMap', () => {
  // Every mock in the `vi.hoisted` block above is shared module state, not
  // reset between tests on its own — `clearAllMocks` resets call counts
  // while keeping the `mockImplementation`s set once at hoist time.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('draws the contour, fits bounds to it, and names it in the legend', () => {
    renderMap(samplePolygon);

    expect(MapMock).toHaveBeenCalledTimes(1);
    expect(addControl).toHaveBeenCalledTimes(2);
    expect(addSource).toHaveBeenCalledTimes(1);
    expect(addLayer).toHaveBeenCalledTimes(2);
    expect(fitBounds).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('permit-contour')).toHaveTextContent('Ruxsat etilgan kontur');
  });

  /**
   * The defect this pins: the legend used to carry a second swatch labelled
   * with the leshoz's name, for a boundary the empty map style never drew
   * and no public endpoint can supply. Every legend entry must name
   * something actually on the map.
   */
  it('shows no legend entry for anything it does not draw', () => {
    renderMap(samplePolygon);

    // One source, one legend row: the contour, and nothing else.
    expect(screen.getAllByTestId('permit-contour')).toHaveLength(1);
    expect(screen.queryByText(/DOʻX|leshoz|xoʻjaligi/i)).not.toBeInTheDocument();
  });

  it('rebuilds the map when the contour prop changes, never stacking a stale source', () => {
    const { rerender } = renderMap(samplePolygon);
    expect(MapMock).toHaveBeenCalledTimes(1);

    rerender(
      <I18nProvider>
        <PermitContourMap contour={otherPolygon} />
      </I18nProvider>,
    );

    expect(remove).toHaveBeenCalledTimes(1);
    expect(MapMock).toHaveBeenCalledTimes(2);
    expect(addSource).toHaveBeenCalledTimes(2);
  });

  it('tears the map down on unmount', () => {
    const { unmount } = renderMap(samplePolygon);
    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
