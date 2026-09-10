import { expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublicLayout } from './PublicLayout';
import { I18nProvider } from '../../i18n';
import { navigation } from '../../lib/cabinet';
import type { SiteSettings, SiteSettingsState } from '../../api/site';

/**
 * This component NO LONGER FETCHES. `routes.tsx`'s `Layout` reads
 * `/public/site-settings` once per page view and hands the answer down —
 * `PublicLayout`, `HomePage` and `ContactPage` each used to call it for
 * themselves, so one visit made the same request two or three times. There
 * is consequently no `fetch` to stub here: an unwired settings prop means a
 * footer with no contacts, exactly as a real outage does.
 */
function renderLayout(
  onNavigate = vi.fn(),
  siteSettings: SiteSettingsState = { status: 'error' },
) {
  return render(
    <I18nProvider>
      <PublicLayout onNavigate={onNavigate} siteSettings={siteSettings}>
        <div>Main content</div>
      </PublicLayout>
    </I18nProvider>
  );
}

const settings: SiteSettings = {
  contacts: {
    phone: '+998 71 000 00 00',
    email: 'test@urmon.uz',
    address: { uz_latn: 'Toshkent sh., Test 1', ru: 'г. Ташкент, Тест 1' },
    hours: { uz_latn: 'Dushanba – juma', ru: 'Пн – Пт' },
    social: { telegram: 'https://t.me/urmon', youtube: null },
  },
  season_windows: { grazing: [9], haymaking: [6, 7, 8], apiary: [], recreation: [], deadwood: [], science: [] },
};

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

it('draws footer contacts from the settings it is given', async () => {
  renderLayout(vi.fn(), { status: 'ready', data: settings });
  // Scoped to the footer landmark: the same phone number is also live in the
  // announcement strip above the main nav (`AnnouncementBar`), so an
  // unscoped query would match both.
  const footer = within(await screen.findByRole('contentinfo'));
  expect(await footer.findByText('+998 71 000 00 00')).toBeInTheDocument();
  expect(footer.getByText('Toshkent sh., Test 1')).toBeInTheDocument();
});

it('renders a footer with no contacts rather than a broken one when the fetch failed', async () => {
  renderLayout(vi.fn(), { status: 'error' });
  const footer = within(await screen.findByRole('contentinfo'));
  expect(footer.queryByText(/^\+998/)).not.toBeInTheDocument();
});

it('renders a footer with no contacts while the fetch is still outstanding', async () => {
  renderLayout(vi.fn(), { status: 'loading' });
  const footer = within(await screen.findByRole('contentinfo'));
  expect(footer.queryByText(/^\+998/)).not.toBeInTheDocument();
});

it('has no dead footer links left', () => {
  renderLayout();
  for (const gone of [/gis kartasi/i, /prokuratura/i, /geobotanik normalar/i]) {
    expect(screen.queryByText(gone)).not.toBeInTheDocument();
  }
});
