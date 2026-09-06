import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HomePage } from './HomePage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

import { api } from '../../api/client';

/**
 * The defect these pin (stage 7.3 walkthrough, finding F7): this page
 * published `42,850+` permits, `185,400` head of livestock and `94.8 %`
 * auto-approved — every one a constant in the source — under a banner reading
 * "REAL-VAQT MONITORINGI" and a caption "updates in real time", while the
 * system held **two** active permits and `GET /public/open-data/stats` was
 * already serving the real aggregates. A government portal stating figures it
 * cannot produce is the kind of defect no unit test was ever going to notice,
 * because there was nothing to assert against: the numbers were the fixture.
 */

const stats = {
  k_anonymity_threshold: 5,
  total_active_permits: 2,
  total_active_area_ha: '130.1388',
  by_region: [],
  by_organization: [],
};

beforeEach(() => {
  vi.mocked(api.GET).mockReset();
});

function renderHome() {
  return render(
    <I18nProvider>
      <HomePage />
    </I18nProvider>,
  );
}

it('shows the figures the aggregates endpoint returns, not constants', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: stats, error: undefined } as never);
  renderHome();
  await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  // `toLocaleString()` is what `OpenDataPage` already uses for the same
  // figure, so the two pages agree; it groups and rounds for display, which is
  // a presentation choice — the point of this test is that the DIGITS come
  // from the endpoint, not from the source.
  const area = Number(stats.total_active_area_ha).toLocaleString();
  expect(screen.getByText(new RegExp(area.replace('.', '\\.')))).toBeInTheDocument();
});

it('never prints the invented figures the page used to carry', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: stats, error: undefined } as never);
  const { container } = renderHome();
  await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  for (const invented of ['42,850', '185,400', '94.8%', '29,138', '85,000']) {
    expect(container.textContent).not.toContain(invented);
  }
});

it('shows a dash rather than a number while the endpoint has not answered', () => {
  vi.mocked(api.GET).mockReturnValue(new Promise(() => {}) as never);
  const { container } = renderHome();
  expect(container.textContent).toContain('—');
});

it('says so when the aggregates cannot be loaded, instead of showing a figure', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: undefined, error: { code: 'ERR-SYS-000' } } as never);
  const { container } = renderHome();
  await waitFor(() => expect(container.textContent).toContain('—'));
  expect(container.textContent).not.toContain('42,850');
});
