import { expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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

it('keeps the old /tariffs bookmark working: it lands on the home page calculator', async () => {
  const router = createMemoryRouter(routeConfig, { initialEntries: ['/tariffs'] });
  render(
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>,
  );

  await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  expect(router.state.location.hash).toBe('#calculator');
});
