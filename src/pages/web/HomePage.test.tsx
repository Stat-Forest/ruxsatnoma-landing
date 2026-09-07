import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
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

/** Three items, as `GET /public/announcements` answers them. */
const NEWS_ID = 'a0000000-0000-4000-8000-000000000001';
const newsPage = {
  items: [
    {
      id: NEWS_ID,
      title: { uz_latn: 'Yaylov mavsumi boshlandi', ru: 'Начался пастбищный сезон' },
      body: { uz_latn: 'Arizalar qabul qilinmoqda.', ru: 'Заявки принимаются.' },
      publish_from: '2026-09-01T09:00:00+05:00',
      files: [],
    },
  ],
  total: 1,
  page: 1,
  page_size: 3,
};

/**
 * The page now calls three anonymous endpoints — the aggregates, the news, and
 * (through the calculator section it absorbed from `/tariffs`) the two
 * reference catalogues. Routing the mock by path keeps each test's own
 * subject the only thing it changes.
 */
type Answers = { stats?: unknown; statsError?: unknown; news?: unknown; newsError?: unknown };

function mockBackend({ stats: statsAnswer = stats, statsError, news = newsPage, newsError }: Answers = {}) {
  vi.mocked(api.GET).mockImplementation(((path: string) => {
    if (path === '/api/v1/public/open-data/stats') {
      return Promise.resolve({ data: statsError ? undefined : statsAnswer, error: statsError });
    }
    if (path === '/api/v1/public/announcements') {
      return Promise.resolve({ data: newsError ? undefined : news, error: newsError });
    }
    return Promise.resolve({ data: [], error: undefined }); // the calculator's catalogues
  }) as never);
}

beforeEach(() => {
  vi.mocked(api.GET).mockReset();
});

/** The page links to `/news/:id` and reads `#calculator` off the location, so
 *  it only renders inside a router — as it does in the app. */
function renderHome() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <HomePage />
      </I18nProvider>
    </MemoryRouter>,
  );
}

it('shows the figures the aggregates endpoint returns, not constants', async () => {
  mockBackend();
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
  mockBackend();
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

it('shows the news the announcements endpoint returns, in the reader\'s language', async () => {
  mockBackend();
  renderHome();

  // The three items this section used to carry were constants in the
  // translation files, dated August 2026 under a heading reading "news".
  expect(await screen.findByText('Yaylov mavsumi boshlandi')).toBeInTheDocument();
  expect(screen.getByTestId(`home-news-${NEWS_ID}`)).toHaveAttribute('href', `/news/${NEWS_ID}`);
});

it('says the news list is empty rather than showing anything invented', async () => {
  mockBackend({ news: { items: [], total: 0, page: 1, page_size: 3 } });
  renderHome();

  expect(await screen.findByText('Hozircha chop etilgan yangilik yoʻq.')).toBeInTheDocument();
});

it('says so when the news cannot be loaded', async () => {
  mockBackend({ newsError: { code: 'ERR-SYS-000' } });
  renderHome();

  expect(await screen.findByText('Yangiliklarni yuklab boʻlmadi.')).toBeInTheDocument();
});

it('says so when the aggregates cannot be loaded, instead of showing a figure', async () => {
  mockBackend({ statsError: { code: 'ERR-SYS-000' } });
  const { container } = renderHome();
  await waitFor(() => expect(container.textContent).toContain('—'));
  expect(container.textContent).not.toContain('42,850');
});
