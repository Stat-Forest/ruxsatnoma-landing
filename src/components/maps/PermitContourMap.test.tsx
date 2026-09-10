import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PermitContourMap from './PermitContourMap';
import type { PermitContourGeometry } from './PermitContourMap';

// `vi.mock` factories are hoisted above the rest of the module, so the mock
// fns they reference must be created through `vi.hoisted` — a plain
// top-level `const` here would throw "Cannot access before initialization".
// Same idiom as `LayerMapView.test.tsx`.
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
  ScaleControl: vi.fn(),
  // Same arrow-function-can't-construct pitfall as `MapMock` above.
  LngLatBounds: vi.fn().mockImplementation(function () {
    return { extend, isEmpty: () => false };
  }),
}));

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

const samplePolygon: PermitContourGeometry = {
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

describe('PermitContourMap', () => {
  // Every mock in the `vi.hoisted` block above is shared module state, not
  // reset between tests on its own — `clearAllMocks` resets call counts
  // while keeping the `mockImplementation`s set once at hoist time.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('always mounts the base map, even with no contour', () => {
    const { unmount } = render(<PermitContourMap organization="Burchmulla DOʻX" contour={null} />);

    expect(MapMock).toHaveBeenCalledTimes(1);
    expect(addControl).toHaveBeenCalledTimes(2);

    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('draws no contour layer and shows no contour badge when contour is absent', () => {
    render(<PermitContourMap organization="Burchmulla DOʻX" contour={null} />);

    expect(addSource).not.toHaveBeenCalled();
    expect(addLayer).not.toHaveBeenCalled();
    expect(fitBounds).not.toHaveBeenCalled();
    expect(screen.queryByTestId('permit-contour')).not.toBeInTheDocument();
    // The leshoz's own name is still shown — "the leshoz boundary alone".
    expect(screen.getByText('Burchmulla DOʻX')).toBeInTheDocument();
  });

  it('adds a contour source, fits bounds to it, and shows the badge when contour is present', () => {
    render(<PermitContourMap organization="Burchmulla DOʻX" contour={samplePolygon} />);

    expect(addSource).toHaveBeenCalledTimes(1);
    expect(addLayer).toHaveBeenCalledTimes(2);
    expect(fitBounds).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('permit-contour')).toBeInTheDocument();
  });

  it('rebuilds the map when the contour prop changes, never stacking a stale source', () => {
    const { rerender } = render(<PermitContourMap organization="Burchmulla DOʻX" contour={null} />);
    expect(MapMock).toHaveBeenCalledTimes(1);

    rerender(<PermitContourMap organization="Burchmulla DOʻX" contour={samplePolygon} />);

    expect(remove).toHaveBeenCalledTimes(1);
    expect(MapMock).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('permit-contour')).toBeInTheDocument();
  });
});
