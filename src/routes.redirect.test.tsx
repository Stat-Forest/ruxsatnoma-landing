import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routeConfig } from './routes';
import { I18nProvider } from './i18n';

// The real `PublicLayout` renders `<Outlet/>`, which is what a `<Navigate>` in
// the route tree needs in order to mount at all — so this file uses it, and
// stubs the network the landed-on page would otherwise reach.
vi.mock('./api/client', () => ({
  api: { GET: vi.fn().mockResolvedValue({ data: [], error: undefined }), POST: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

// The `Layout` also calls `fetchSiteSettings()` (`src/api/site.ts`), which
// goes through the bare `fetch` global rather than the mocked client above
// (the endpoint isn't in `schema.d.ts` yet) — stub it too, so no test in this
// file makes a real network call. Kept in a variable so the last test can
// count how many times it was reached.
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockRejectedValue(new Error('no network in tests'));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderAt(path: string) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [path] });
  render(
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>,
  );
  return router;
}

it('keeps the old /tariffs bookmark working: it lands on the home page calculator', async () => {
  const router = renderAt('/tariffs');

  await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  expect(router.state.location.hash).toBe('#calculator');
});

it('redirects the retired /faq screen to /about', async () => {
  const router = renderAt('/faq');
  await waitFor(() => expect(router.state.location.pathname).toBe('/about'));
});

it('redirects the retired /opendata screen home', async () => {
  const router = renderAt('/opendata');
  await waitFor(() => expect(router.state.location.pathname).toBe('/'));
});

it('sends an unknown path home', async () => {
  const router = renderAt('/this-page-does-not-exist');
  await waitFor(() => expect(router.state.location.pathname).toBe('/'));
});

it('reserves /map, /about and /contact for the tracks that will fill them in', async () => {
  renderAt('/map');
  expect(await screen.findByTestId('map-page')).toBeInTheDocument();

  renderAt('/about');
  expect(await screen.findByTestId('about-page')).toBeInTheDocument();

  renderAt('/contact');
  expect(await screen.findByTestId('contact-page')).toBeInTheDocument();
});

/**
 * The defect this pins: `PublicLayout`, `HomePage` and `ContactPage` each
 * called `fetchSiteSettings()` with no shared state, so a single visit to
 * `/` made the same request twice and `/contact` twice again. It is fetched
 * once, in `Layout`, and handed down through the outlet context.
 */
describe('site settings', () => {
  function settingsCalls() {
    return fetchMock.mock.calls.filter(([url]) => String(url).includes('/site-settings'));
  }

  it('is read exactly once on the home page', async () => {
    renderAt('/');
    await screen.findByRole('heading', { level: 1 });
    await waitFor(() => expect(settingsCalls().length).toBeGreaterThan(0));
    expect(settingsCalls()).toHaveLength(1);
  });

  it('is read exactly once on the contact page', async () => {
    renderAt('/contact');
    await screen.findByTestId('contact-page');
    await waitFor(() => expect(settingsCalls().length).toBeGreaterThan(0));
    expect(settingsCalls()).toHaveLength(1);
  });
});
