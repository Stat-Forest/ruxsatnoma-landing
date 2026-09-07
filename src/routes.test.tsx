import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routeConfig } from './routes';
import { CABINET_PATHS, cabinetUrl, navigation } from './lib/cabinet';

/**
 * `PublicLayout` is swapped for three bare buttons so these tests exercise
 * routes.tsx's own `onNavigate` — the page-id -> cabinet-path table
 * (`CABINET_ENTRIES`) plus the dispatch that calls `goToCabinet` — without
 * depending on which real button currently happens to carry which page id.
 * (The real header/footer wiring, and TariffsPage's CTA specifically, are
 * covered by their own tests.)
 */
vi.mock('./components/layouts/PublicLayout', () => ({
  PublicLayout: ({
    onNavigate,
  }: {
    onNavigate?: (page: string, params?: Record<string, unknown>) => void;
  }) => (
    <div>
      <button onClick={() => onNavigate?.('auth_login')}>go-auth-login</button>
      <button onClick={() => onNavigate?.('auth_register')}>go-auth-register</button>
      <button onClick={() => onNavigate?.('applicant_wizard')}>go-applicant-wizard</button>
    </div>
  ),
}));

beforeEach(() => {
  vi.stubEnv('VITE_ADMIN_BASE_URL', 'https://admin.example.uz');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each([
  ['go-auth-login', CABINET_PATHS.login],
  ['go-auth-register', CABINET_PATHS.login],
  ['go-applicant-wizard', CABINET_PATHS.wizard],
])('onNavigate("%s")', (buttonText, expectedPath) => {
  it('opens the cabinet at the mapped path, never a second tab', async () => {
    const assign = vi.spyOn(navigation, 'assign').mockImplementation(() => {});
    const open = vi.spyOn(window, 'open');
    const router = createMemoryRouter(routeConfig, { initialEntries: ['/'] });
    render(<RouterProvider router={router} />);

    await userEvent.click(screen.getByText(buttonText));

    expect(assign).toHaveBeenCalledWith(cabinetUrl(expectedPath));
    expect(open).not.toHaveBeenCalled();
  });
});

/** The news register took the header slot `/tariffs` used to hold. The
 *  redirect that keeps the old URL alive lives in `routes.redirect.test.tsx`,
 *  which renders the real layout — the mock above has no `<Outlet/>`, so a
 *  `<Navigate>` in the route tree would never mount here. */
describe('the news register', () => {
  it('routes /news and /news/:id to the register and to one announcement', () => {
    const list = createMemoryRouter(routeConfig, { initialEntries: ['/news'] });
    render(<RouterProvider router={list} />);
    expect(list.state.location.pathname).toBe('/news');

    const item = createMemoryRouter(routeConfig, { initialEntries: ['/news/abc'] });
    render(<RouterProvider router={item} />);
    expect(item.state.location.pathname).toBe('/news/abc');
  });
});
