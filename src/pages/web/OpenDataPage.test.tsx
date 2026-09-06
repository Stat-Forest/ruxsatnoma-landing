import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpenDataPage } from './OpenDataPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

import { api } from '../../api/client';

const mockLayers = [
  {
    code: 'forest_boundaries',
    name: { uz_latn: 'Oʻrmon chegaralari', ru: 'Границы лесов' },
    geometry_type: 'POLYGON',
  },
];

const mockStats = {
  k_anonymity_threshold: 5,
  total_active_permits: 1234,
  total_active_area_ha: '5678.90',
  by_region: [
    {
      region_id: 'r1',
      region_name: { uz_latn: 'Toshkent viloyati', ru: 'Ташкентская область' },
      active_permits_count: 10,
      active_area_ha: '100.00',
    },
  ],
  by_organization: [
    {
      organization_id: 'o1',
      organization_name: { uz_latn: 'Chirchiq oʻrmon xoʻjaligi', ru: 'Чирчикское лесное хозяйство' },
      region_id: 'r1',
      // Same region as the by_region row on purpose — the org table renders
      // its own region column too, so "Toshkent viloyati" is expected TWICE
      // (see the `findAllByText` assertion below).
      region_name: { uz_latn: 'Toshkent viloyati', ru: 'Ташкентская область' },
      active_permits_count: 10,
      active_area_ha: '100.00',
    },
  ],
};

const mockFeatureCollection = {
  type: 'FeatureCollection',
  truncated: false,
  features: [
    {
      type: 'Feature',
      id: 'feat-1',
      geometry: { type: 'Polygon', coordinates: [] },
      properties: {
        name: { uz_latn: 'Uchastka 1' },
        props: { area: 12 },
        valid_from: '2026-01-01',
        valid_to: null,
      },
    },
  ],
};

const FEATURES_PATH = '/api/v1/public/open-data/layers/{code}/features';

function mockHappyPath() {
  (api.GET as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
    if (path === '/api/v1/public/open-data/layers') {
      return Promise.resolve({ data: mockLayers, error: undefined });
    }
    if (path === '/api/v1/public/open-data/stats') {
      return Promise.resolve({ data: mockStats, error: undefined });
    }
    if (path === FEATURES_PATH) {
      return Promise.resolve({ data: mockFeatureCollection, error: undefined });
    }
    return Promise.resolve({ data: undefined, error: undefined });
  });
}

function renderPage() {
  return render(
    <I18nProvider>
      <OpenDataPage />
    </I18nProvider>,
  );
}

beforeEach(() => {
  (api.GET as ReturnType<typeof vi.fn>).mockReset();
});

describe('OpenDataPage', () => {
  it('renders the stats cards and both data tables from the stats response', async () => {
    mockHappyPath();
    renderPage();

    // "Toshkent viloyati" renders twice on purpose — once as the by_region
    // table's region, once as the by_organization table's own region column
    // (the brief's "region name for the organization table too").
    expect(await screen.findAllByText('Toshkent viloyati')).toHaveLength(2);
    expect(screen.getByText('Chirchiq oʻrmon xoʻjaligi')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // k_anonymity_threshold, never hard-coded elsewhere
  });

  it('renders the layer catalogue from the layers response', async () => {
    mockHappyPath();
    renderPage();

    expect(await screen.findByText('Oʻrmon chegaralari')).toBeInTheDocument();
  });

  it('fetches a layer\'s features once and serves a re-open from cache with no second request', async () => {
    mockHappyPath();
    renderPage();
    const user = userEvent.setup();

    const viewButton = await screen.findByRole('button', { name: /Obʼyektlarni koʻrish/ });
    await user.click(viewButton);

    await waitFor(() => {
      expect(api.GET as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        FEATURES_PATH,
        expect.objectContaining({ params: { path: { code: 'forest_boundaries' } } }),
      );
    });
    // The feature table only renders once the cached entry is 'ready'.
    await screen.findByText('Uchastka 1');

    const countFeatureCalls = () =>
      (api.GET as ReturnType<typeof vi.fn>).mock.calls.filter(([path]) => path === FEATURES_PATH).length;
    expect(countFeatureCalls()).toBe(1);

    const hideButton = await screen.findByRole('button', { name: /Yashirish/ });
    await user.click(hideButton);

    const viewAgainButton = await screen.findByRole('button', { name: /Obʼyektlarni koʻrish/ });
    await user.click(viewAgainButton);
    await screen.findByText('Uchastka 1');

    // Re-opening the same layer renders from the cache — no second network call.
    expect(countFeatureCalls()).toBe(1);
  });

  it('renders an error alert, not a crash, when the initial load fails', async () => {
    (api.GET as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
      if (path === '/api/v1/public/open-data/layers') {
        return Promise.resolve({
          data: undefined,
          error: { error: { code: 'ERR-SYS-000', message: 'Server error' } },
        });
      }
      if (path === '/api/v1/public/open-data/stats') {
        return Promise.resolve({ data: mockStats, error: undefined });
      }
      return Promise.resolve({ data: undefined, error: undefined });
    });
    renderPage();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
