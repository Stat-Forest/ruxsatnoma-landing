import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { HomePage } from './HomePage';
import { I18nProvider } from '../../i18n';
import type { SiteSettings, SiteSettingsState } from '../../api/site';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

import { api } from '../../api/client';

/**
 * `GET /public/ratings/summary` reaches the page through the bare `fetch`
 * global rather than the typed `api.GET` client, because it is not in
 * `schema.d.ts` yet (`RatingBand.tsx`'s own docstring explains why). This
 * project has no `msw` dependency (see the foundation track's report), so a
 * bare-fetch endpoint is stubbed with `vi.stubGlobal('fetch', ...)` rather
 * than `server.use(http.get(...))`. Defaults to a published: false summary,
 * so a test that doesn't care sees the honest "not enough ratings" shape.
 *
 * `/public/site-settings` is NOT here any more: `routes.tsx`'s `Layout`
 * fetches it once per page view and hands the answer down as a prop, where
 * this page and `PublicLayout` above it each used to fetch it separately.
 * The tests that care pass `siteSettings` to `renderHome` instead.
 */
type FetchAnswers = {
  ratings?: unknown;
  ratingsFails?: boolean;
};

function mockFetch({ ratings, ratingsFails }: FetchAnswers = {}) {
  const fetchMock = vi.fn((url: string) => {
    if (url.includes('/ratings/summary')) {
      if (ratingsFails) return Promise.reject(new Error('network error'));
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            ratings ?? { published: false, average: null, count: 0, histogram: null, threshold: 5 },
          ),
      });
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** As `routes.tsx`'s `Layout` hands them down. */
function readySettings(overrides: Partial<SiteSettings> = {}): SiteSettingsState {
  return {
    status: 'ready',
    data: {
      contacts: {
        phone: '',
        email: '',
        address: { uz_latn: '', ru: '' },
        hours: { uz_latn: '', ru: '' },
        social: { telegram: null, youtube: null },
      },
      season_windows: {
        grazing: [],
        haymaking: [],
        apiary: [],
        recreation: [],
        deadwood: [],
        science: [],
      },
      ...overrides,
    },
  };
}

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

/** As `GET /public/refs/activity-types` answers them — the same catalogue the
 *  activities section and `ServicesPage` both read (`api/services.ts`). */
const ACTIVITY_ID = 'a0000000-0000-4000-8000-000000000002';
const activityTypes = [
  {
    id: ACTIVITY_ID,
    code: 'grazing',
    name: { uz_latn: 'Chorva mollarini boqish', ru: 'Выпас скота' },
    description: { uz_latn: 'Yaylov konturlarida chorva boqish uchun ruxsatnoma.', ru: 'Разрешение на выпас скота.' },
    processing_days: 15,
  },
];

/**
 * The page now calls four anonymous endpoints — the aggregates, the news, the
 * activities catalogue and (through the calculator section it absorbed from
 * `/tariffs`) the two reference catalogues. Routing the mock by path keeps
 * each test's own subject the only thing it changes.
 */
type Answers = {
  stats?: unknown;
  statsError?: unknown;
  news?: unknown;
  newsError?: unknown;
  services?: unknown;
  servicesError?: unknown;
};

function mockBackend({
  stats: statsAnswer = stats,
  statsError,
  news = newsPage,
  newsError,
  services = activityTypes,
  servicesError,
}: Answers = {}) {
  vi.mocked(api.GET).mockImplementation(((path: string) => {
    if (path === '/api/v1/public/open-data/stats') {
      return Promise.resolve({ data: statsError ? undefined : statsAnswer, error: statsError });
    }
    if (path === '/api/v1/public/announcements') {
      return Promise.resolve({ data: newsError ? undefined : news, error: newsError });
    }
    if (path === '/api/v1/public/refs/activity-types') {
      return Promise.resolve({ data: servicesError ? undefined : services, error: servicesError });
    }
    return Promise.resolve({ data: [], error: undefined }); // the calculator's livestock-types catalogue
  }) as never);
}

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(api.GET).mockReset();
  mockFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** The page links to `/news/:id` and reads `#calculator` off the location, so
 *  it only renders inside a router — as it does in the app. */
function renderHome(siteSettings: SiteSettingsState = readySettings()) {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <HomePage siteSettings={siteSettings} />
      </I18nProvider>
    </MemoryRouter>,
  );
}

it('opens with the hero slider', () => {
  mockBackend();
  renderHome();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Elektron Ruxsatnoma/i);
});

it('sends the quick-check strip to the verify page with what was typed', async () => {
  mockBackend();
  const onNavigate = vi.fn();
  render(
    <MemoryRouter>
      <I18nProvider>
        <HomePage onNavigate={onNavigate} siteSettings={readySettings()} />
      </I18nProvider>
    </MemoryRouter>,
  );

  await userEvent.type(screen.getByPlaceholderText('Seriya'), 'AB');
  await userEvent.type(screen.getByPlaceholderText(/Raqam/i), '000123');
  await userEvent.click(screen.getByRole('button', { name: /^Tekshirish$/i }));

  expect(onNavigate).toHaveBeenCalledWith('verify', { query: 'AB 000123' });
});

/**
 * The two tiles this pins ALWAYS show a dash — `by_organization`/`by_region`
 * are k-anonymity-suppressed per-cut breakdowns (#109), not a total count.
 * Reading the array's length used to turn a suppressed cut into a false
 * zero; this test would have caught that regression.
 */
it('never turns a suppressed cut into a false zero for organizations or regions', async () => {
  mockBackend();
  renderHome();
  await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  expect(screen.getByTestId('home-stat-organizations')).toHaveTextContent('—');
  expect(screen.getByTestId('home-stat-regions')).toHaveTextContent('—');
});

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

it('shows the services the catalog returns, not the six that used to be constants', async () => {
  mockBackend();
  renderHome();

  // Scoped to the activities section: the calculator below reads the same
  // catalogue for its own dropdown, so the name appears twice on the page.
  const section = await screen.findByTestId('home-activities');
  expect(within(section).getByText('Chorva mollarini boqish')).toBeInTheDocument();
});

/**
 * The rating band's own three states (#174) — pinned here too, at the page
 * level, in addition to `RatingBand.test.tsx`'s unit coverage: this is what
 * actually reaches a visitor, wired to the real `fetch` call.
 */
it('says there are not enough ratings yet rather than printing an average', async () => {
  mockBackend();
  mockFetch({ ratings: { published: false, average: null, count: 2, histogram: null, threshold: 5 } });
  renderHome();
  expect(await screen.findByTestId('home-rating')).toHaveTextContent(/yetarli baho/i);
  expect(screen.queryByText(/4[,.]\d/)).not.toBeInTheDocument();
});

it('draws the average and histogram once the rating summary is published', async () => {
  mockBackend();
  mockFetch({
    ratings: {
      published: true,
      average: '4.2',
      count: 128,
      histogram: { 1: 1, 2: 2, 3: 5, 4: 20, 5: 100 },
      threshold: 5,
    },
  });
  renderHome();
  expect(await screen.findByText('4,2')).toBeInTheDocument();
  expect(screen.getByText(/128/)).toBeInTheDocument();
});

it('says the ratings are unavailable rather than blank when the summary fails to load', async () => {
  mockBackend();
  mockFetch({ ratingsFails: true });
  renderHome();
  expect(await screen.findByTestId('home-rating')).toHaveTextContent(/vaqtincha mavjud emas/i);
});

/**
 * Ruling R3: the season strip may only ever show months the settings
 * endpoint actually returned — never a fallback set invented locally.
 */
it('draws the season strip from the site-settings response', async () => {
  mockBackend();
  renderHome(
    readySettings({
      season_windows: {
        grazing: [9], haymaking: [], apiary: [], recreation: [], deadwood: [], science: [],
      },
    }),
  );
  expect(await screen.findByTestId('season-row-grazing')).toBeInTheDocument();
  expect(screen.getByRole('note')).toHaveTextContent(/Agentlik tomonidan tasdiqlanadi/i);
});

it('renders no season strip at all when the settings fetch fails', async () => {
  mockBackend();
  renderHome({ status: 'error' });
  await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  expect(screen.queryByTestId('season-row-grazing')).not.toBeInTheDocument();
  expect(screen.queryByRole('note')).not.toBeInTheDocument();
});

it('sends the map band to the map page', async () => {
  mockBackend();
  const onNavigate = vi.fn();
  render(
    <MemoryRouter>
      <I18nProvider>
        <HomePage onNavigate={onNavigate} siteSettings={readySettings()} />
      </I18nProvider>
    </MemoryRouter>,
  );
  await userEvent.click(screen.getByRole('button', { name: /Xaritani ochish/i }));
  expect(onNavigate).toHaveBeenCalledWith('map');
});

it('shows the live phone in the support CTA once site-settings answers', async () => {
  mockBackend();
  renderHome(
    readySettings({
      contacts: {
        phone: '+998 71 000 00 00', email: '', address: { uz_latn: '', ru: '' }, hours: { uz_latn: 'Dushanba – juma', ru: '' },
        social: { telegram: null, youtube: null },
      },
    }),
  );
  expect(await screen.findByText('+998 71 000 00 00')).toBeInTheDocument();
});

it('hides the CTA phone row rather than inventing one when contacts are unavailable', async () => {
  mockBackend();
  renderHome({ status: 'error' });
  await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  expect(screen.queryByText(/^\+998/)).not.toBeInTheDocument();
});

/** As `GET /public/refs/activity-types` might one day answer with the full
 *  catalogue — one row per `Scene` kind, in that component's own order. */
const sixActivities = [
  { id: 'a1', code: 'grazing', name: { uz_latn: 'Chorva mollarini boqish' }, description: null, processing_days: 15 },
  { id: 'a2', code: 'haymaking', name: { uz_latn: 'Pichan tayyorlash' }, description: null, processing_days: 15 },
  { id: 'a3', code: 'apiary', name: { uz_latn: 'Asalarichilik' }, description: null, processing_days: 15 },
  { id: 'a4', code: 'recreation', name: { uz_latn: 'Dam olish va turizm' }, description: null, processing_days: 15 },
  { id: 'a5', code: 'deadwood', name: { uz_latn: 'Quruq shox-shabba yigʻish' }, description: null, processing_days: 15 },
  { id: 'a6', code: 'science', name: { uz_latn: 'Ilmiy tadqiqot' }, description: null, processing_days: 15 },
];

it('renders six direction cards, each with its own illustration', async () => {
  mockBackend({ services: sixActivities });
  renderHome();

  const cards = await screen.findAllByTestId('direction-card');
  expect(cards).toHaveLength(6);
  const svgIds = cards.map((c) => c.querySelector('linearGradient')?.id);
  expect(new Set(svgIds).size).toBe(6);
});

/**
 * The defect this pins: an unknown activity code fell back to `grazing`'s
 * illustration, so a seventh service the art set does not cover would have
 * been drawn with cattle — a statement about the service, not a neutral
 * placeholder. `ServicesPage` draws nothing for the same case, and now so
 * does this.
 */
it('draws no illustration at all for an activity code the art set does not cover', async () => {
  mockBackend({
    services: [
      { id: 'a9', code: 'felling', name: { uz_latn: 'Kesish' }, description: null, processing_days: 15 },
    ],
  });
  renderHome();

  const cards = await screen.findAllByTestId('direction-card');
  expect(cards).toHaveLength(1);
  // `linearGradient` is what every `<Scene>` opens with — the test above
  // counts them to prove the six cards get six different illustrations.
  expect(cards[0].querySelector('linearGradient')).toBeNull();
});

const sampleActivities = [
  {
    id: '0198f100-0001-7000-8000-000000000001',
    code: 'grazing',
    name: { uz_latn: 'Chorva mollarini boqish' },
    description: null,
    processing_days: 15,
  },
  {
    id: '0198f100-0001-7000-8000-000000000005',
    code: 'deadwood',
    name: { uz_latn: 'Quruq shox-shabba yigʻish' },
    description: null,
    processing_days: 15,
  },
  {
    id: '0198f100-0001-7000-8000-000000000006',
    code: 'science',
    name: { uz_latn: 'Ilmiy tadqiqot' },
    description: null,
    processing_days: 15,
  },
];

it('fetches and renders every activity type the public API returns', async () => {
  mockBackend({ services: sampleActivities });
  renderHome();

  const section = await screen.findByTestId('home-activities');
  await waitFor(() => {
    expect(within(section).getByText(/Chorva mollarini boqish/i)).toBeInTheDocument();
    expect(within(section).getByText(/Quruq shox-shabba/i)).toBeInTheDocument();
    expect(within(section).getByText(/Ilmiy tadqiqot/i)).toBeInTheDocument();
  });
});

// The defect this pins: the apply link used to carry the activity's
// human-readable `code` ('deadwood'), not the UUID the backend actually
// needs to identify the activity type (`PriceCalculator` submits the same
// catalog's `id` as `activity_type_id`). A login started from this link
// must receive the real id, not a string the API never promised as a key.
//
// The page id is `applicant_wizard`, the same one `ServicesPage`'s own card
// sends. This one used to send `auth_login`, which lands a visitor on the
// cabinet's front door instead of the form they pressed a button to reach.
it('passes the real backend activity UUID when apply link is clicked', async () => {
  mockBackend({ services: sampleActivities });

  const onNavigate = vi.fn();
  render(
    <MemoryRouter>
      <I18nProvider>
        <HomePage onNavigate={onNavigate} siteSettings={readySettings()} />
      </I18nProvider>
    </MemoryRouter>,
  );

  const section = await screen.findByTestId('home-activities');
  await waitFor(() => expect(within(section).getByText(/Quruq shox-shabba/i)).toBeInTheDocument());
  const applyButtons = within(section).getAllByRole('button', { name: /Ariza yozish/i });
  expect(applyButtons.length).toBe(3);
  applyButtons[1].click();

  expect(onNavigate).toHaveBeenCalledWith('applicant_wizard', {
    activity: '0198f100-0001-7000-8000-000000000005',
  });
});

it('says so when the catalog cannot be loaded, instead of showing anything invented', async () => {
  mockBackend({ servicesError: { code: 'ERR-SYS-000' } });
  renderHome();

  // Same treatment as `ServicesPage`'s own catalog error: the `Alert`
  // component, discoverable by `role="alert"` — not a plain `<p>` a
  // screen-reader user would never be told about. Scoped to this section's
  // own wrapper: the price calculator below reads the same endpoint and
  // renders its own `role="alert"` when it also fails.
  const activitiesError = await screen.findByTestId('home-activities-error');
  expect(within(activitiesError).getByRole('alert')).toHaveTextContent(/Xizmat turlarini yuklab boʻlmadi/i);
});

/**
 * The defect this pins: an anonymous visitor who had never received a
 * service was asked to rate it, could not give it a 1, and the answer was
 * thrown away on submit (stage 7.7 finding). The rating moved to the
 * citizen's cabinet — this page must carry none of it any more.
 */
it('no longer shows the satisfaction form', async () => {
  mockBackend();
  renderHome();

  await waitFor(() => expect(screen.queryByText(/sifatini baholang/i)).not.toBeInTheDocument());
  expect(screen.queryByText(/baho yuborish/i)).not.toBeInTheDocument();
});
