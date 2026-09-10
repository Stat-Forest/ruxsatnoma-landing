import { afterEach, beforeEach, expect, it, vi } from 'vitest';
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

// `PublicLayout` also calls `fetchSiteSettings()` (`src/api/site.ts`), which
// goes through the bare `fetch` global rather than the mocked client above
// (the endpoint isn't in `schema.d.ts` yet) — stub it too, so no test in this
// file makes a real network call.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no network in tests')));
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
