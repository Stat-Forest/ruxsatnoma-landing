import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublicLayout } from './PublicLayout';
import { I18nProvider } from '../../i18n';
import { navigation } from '../../lib/cabinet';

function renderLayout(onNavigate = vi.fn()) {
  return render(
    <I18nProvider>
      <PublicLayout onNavigate={onNavigate}>
        <div>Main content</div>
      </PublicLayout>
    </I18nProvider>
  );
}

/**
 * `fetchSiteSettings()` (`src/api/site.ts`) calls the bare `fetch` global —
 * the endpoint isn't in `schema.d.ts` yet, so it cannot go through the typed
 * `api.GET` client the rest of this project mocks by path. Stubbing `fetch`
 * itself is this file's equivalent of that. Defaults to a network failure so
 * tests that don't care about contacts see the footer in its "nothing to
 * show" shape, same as a real outage.
 */
function mockSiteSettingsFetch(
  outcome: 'network-error' | { status: number; body?: unknown } = 'network-error',
) {
  const fetchMock = vi.fn();
  if (outcome === 'network-error') {
    fetchMock.mockRejectedValue(new Error('network error'));
  } else {
    fetchMock.mockResolvedValue({
      ok: outcome.status >= 200 && outcome.status < 300,
      status: outcome.status,
      json: () => Promise.resolve(outcome.body ?? {}),
    });
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  mockSiteSettingsFetch('network-error');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it('opens and closes mobile menu on hamburger button click', async () => {
  const onNavigate = vi.fn();
  renderLayout(onNavigate);

  const toggleBtn = screen.getByRole('button', { name: /Menyuni ochish/i });
  expect(toggleBtn).toBeInTheDocument();

  // Initially mobile menu is not rendered
  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();

  // Click hamburger to open
  await userEvent.click(toggleBtn);
  expect(screen.getByRole('button', { name: /Menyuni yopish/i })).toBeInTheDocument();

  const mobileMenu = screen.getByTestId('mobile-menu');
  expect(mobileMenu).toBeInTheDocument();

  // Navigation items are inside mobile menu
  const aboutLink = within(mobileMenu).getByRole('button', { name: 'Portal haqida' });
  expect(aboutLink).toBeInTheDocument();

  // Click a navigation item
  await userEvent.click(aboutLink);
  expect(onNavigate).toHaveBeenCalledWith('about');

  // Drawer closes after navigation
  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
});

it('offers six nav items and no open-data entry', () => {
  renderLayout();
  // "Portal haqida" and "Aloqa" also label the footer's own Portal-column
  // links (the approved footer repeats them, decision: port as-is) — scoped
  // to the header landmark so that legitimate repeat doesn't read as ambiguity.
  const header = within(screen.getByRole('banner'));
  for (const label of ['Bosh sahifa', 'Xizmatlar', 'Yangiliklar', 'Hujjatlar', 'Portal haqida', 'Aloqa']) {
    expect(header.getByRole('button', { name: label })).toBeInTheDocument();
  }
  expect(screen.queryByText(/ochiq maʼlumotlar/i)).not.toBeInTheDocument();
});

it('sends the Kabinet button to the cabinet, not to a login form', async () => {
  const assign = vi.spyOn(navigation, 'assign').mockImplementation(() => {});
  renderLayout();
  await userEvent.click(screen.getByRole('button', { name: /kabinet/i }));
  expect(assign).toHaveBeenCalledWith(expect.stringContaining('/login'));
});

it('draws footer contacts from the API', async () => {
  mockSiteSettingsFetch({
    status: 200,
    body: {
      contacts: {
        phone: '+998 71 000 00 00',
        email: 'test@urmon.uz',
        address: { uz_latn: 'Toshkent sh., Test 1', ru: 'г. Ташкент, Тест 1' },
        hours: { uz_latn: 'Dushanba – juma', ru: 'Пн – Пт' },
        social: { telegram: 'https://t.me/urmon', youtube: null },
      },
      season_windows: { grazing: [9], haymaking: [6, 7, 8], apiary: [], recreation: [], deadwood: [], science: [] },
    },
  });
  renderLayout();
  // Scoped to the footer landmark: the same phone number is also live in the
  // announcement strip above the main nav (`AnnouncementBar`), so an
  // unscoped query would match both.
  const footer = within(await screen.findByRole('contentinfo'));
  expect(await footer.findByText('+998 71 000 00 00')).toBeInTheDocument();
  expect(footer.getByText('Toshkent sh., Test 1')).toBeInTheDocument();
});

it('renders a footer with no contacts rather than a broken one when the API fails', async () => {
  mockSiteSettingsFetch('network-error');
  renderLayout();
  expect(await screen.findByRole('contentinfo')).toBeInTheDocument();
});

it('has no dead footer links left', () => {
  renderLayout();
  for (const gone of [/gis kartasi/i, /prokuratura/i, /geobotanik normalar/i]) {
    expect(screen.queryByText(gone)).not.toBeInTheDocument();
  }
});
