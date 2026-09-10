import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MapPage } from './MapPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn(), POST: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

import { api } from '../../api/client';

// Same construct-vs-arrow-function pitfall as `LayerMapView.test.tsx`:
// `new maplibregl.Map(...)` needs a real `[[Construct]]`, so every class the
// component instantiates is a `vi.fn().mockImplementation(function () {...})`,
// and the mock fns a factory closes over must go through `vi.hoisted`.
const { addSource, addLayer, fitBounds, project, MapMock } = vi.hoisted(() => {
  const addControl = vi.fn();
  const on = vi.fn((event: string, cb: () => void) => {
    if (event === 'load') cb();
  });
  const addSource = vi.fn();
  const addLayer = vi.fn();
  const fitBounds = vi.fn();
  const remove = vi.fn();
  const project = vi.fn(() => ({ x: 120, y: 80 }));
  const MapMock = vi.fn().mockImplementation(function () {
    return { addControl, on, addSource, addLayer, fitBounds, remove, project };
  });
  return { addControl, on, addSource, addLayer, fitBounds, remove, project, MapMock };
});

vi.mock('maplibre-gl', () => ({
  Map: MapMock,
  NavigationControl: vi.fn(),
  LngLatBounds: vi.fn().mockImplementation(function () {
    return { extend: vi.fn(), isEmpty: () => false };
  }),
}));

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

const demoLayer = {
  code: 'demo_layer',
  name: { uz_latn: 'Namuna qatlam' },
  geometry_type: 'Polygon',
};

function polygonFeature(id: string, code: string, extra: Record<string, unknown> = {}) {
  return {
    type: 'Feature' as const,
    id,
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
    properties: {
      name: { uz_latn: code },
      props: extra,
      valid_from: null,
      valid_to: null,
    },
  };
}

const demoCollection = {
  type: 'FeatureCollection' as const,
  truncated: false,
  features: [
    polygonFeature('f1', 'K-14', { area_ha: '64.8', capacity: '80 bosh' }),
    polygonFeature('f2', 'K-21', { area_ha: '41.2', capacity: '50 bosh' }),
    polygonFeature('f3', 'K-33', { area_ha: '28.6' }),
  ],
};

function mockApi(layers: unknown[] = [demoLayer], features: unknown = demoCollection) {
  vi.mocked(api.GET).mockImplementation((path: string) => {
    if (path === '/api/v1/public/open-data/layers') {
      return Promise.resolve({ data: layers, error: undefined } as never);
    }
    if (path === '/api/v1/public/open-data/layers/{code}/features') {
      return Promise.resolve({ data: features, error: undefined } as never);
    }
    return Promise.resolve({ data: undefined, error: { error: { code: 'ERR-SYS-000' } } } as never);
  });
}

beforeEach(() => {
  vi.mocked(api.GET).mockReset();
  addSource.mockClear();
  addLayer.mockClear();
  fitBounds.mockClear();
  project.mockClear();
});

/**
 * ALWAYS rendered with `onNavigate`, exactly as `routes.tsx` renders it.
 * `onNavigate?.(...)` is optional-chained, so a bare `<MapPage/>` — which is
 * how the route shipped — leaves "Shu kontur boʻyicha ariza berish"
 * compiling, rendering and doing nothing when pressed.
 */
function renderMap(onNavigate = vi.fn()) {
  render(
    <I18nProvider>
      <MapPage onNavigate={onNavigate} />
    </I18nProvider>,
  );
  return onNavigate;
}

it('lists contours and marks the selected one on the map', async () => {
  mockApi();
  renderMap();

  const rows = await screen.findAllByTestId('contour-row');
  expect(rows).toHaveLength(3);

  await userEvent.click(rows[1]);

  expect(rows[1]).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByTestId('map-marker')).toBeInTheDocument();
});

it('never claims a contour is free when the layer does not say so', async () => {
  mockApi();
  renderMap();

  const rows = await screen.findAllByTestId('contour-row');
  expect(within(rows[0]).queryByText(/^boʻsh$/i)).not.toBeInTheDocument();
  expect(within(rows[0]).queryByText(/^band$/i)).not.toBeInTheDocument();
  expect(within(rows[0]).getByText(/nomaʼlum/i)).toBeInTheDocument();
});

describe('when there are no public layers at all', () => {
  it('says so instead of pretending a contour layer exists', async () => {
    mockApi([]);
    renderMap();

    expect(await screen.findByText(/ochiq gis qatlami yoʻq/i)).toBeInTheDocument();
    expect(screen.queryByTestId('contour-row')).not.toBeInTheDocument();
  });
});

it('sends the selected contour to the application wizard', async () => {
  mockApi();
  const onNavigate = renderMap();

  await screen.findAllByTestId('contour-row');
  await userEvent.click(screen.getByRole('button', { name: /shu kontur boʻyicha ariza berish/i }));

  expect(onNavigate).toHaveBeenCalledWith('applicant_wizard');
});

it('keeps the free/taken filter chips disabled rather than faking a state', async () => {
  mockApi();
  renderMap();

  await screen.findAllByTestId('contour-row');
  const chip = screen.getByText('Faqat boʻsh');
  expect(chip).toHaveAttribute('aria-disabled', 'true');
});
