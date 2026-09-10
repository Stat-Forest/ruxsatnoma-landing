import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routeConfig } from '../../routes';
import { I18nProvider } from '../../i18n';

// Same setup as `routes.redirect.test.tsx`: the real `PublicLayout` renders
// through here (needed for the `/faq` -> `/about` `<Navigate>` to mount at
// all), so both the typed client and the bare `fetch` `fetchSiteSettings()`
// uses are stubbed — nothing in this file makes a real network call.
vi.mock('../../api/client', () => ({
  api: { GET: vi.fn().mockResolvedValue({ data: [], error: undefined }), POST: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

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

it('keeps the FAQ reachable at the old URL', async () => {
  const router = renderAt('/faq');

  await waitFor(() => expect(router.state.location.pathname).toBe('/about'));
  expect(
    await screen.findByRole('heading', { name: /koʻp beriladigan savollar/i }),
  ).toBeInTheDocument();
});

it('opens one answer at a time', async () => {
  renderAt('/about');

  // The first question is open by default (`FaqAccordion`'s own `openIdx: 0`).
  expect(await screen.findByText(/OneID yoki E-IMZO orqali portalga kirasiz/i)).toBeVisible();

  const second = screen.getByRole('button', { name: /toʻlov summasi qanday/i });
  await userEvent.click(second);

  expect(screen.getByText(/BHM/)).toBeVisible();
  expect(screen.queryByText(/OneID yoki E-IMZO orqali portalga kirasiz/i)).not.toBeInTheDocument();
});

it('never invents the review-deadline or legal-basis figures the design mock hardcodes', async () => {
  renderAt('/about');

  await screen.findByRole('heading', { name: /koʻp beriladigan savollar/i });
  // The prototype's stat row reads "15 kun" / "3+1" — neither is a fact this
  // track could verify, so neither may appear on the shipped page.
  expect(screen.queryByText(/15/)).not.toBeInTheDocument();
  expect(screen.queryByText(/3\+1/)).not.toBeInTheDocument();
});
