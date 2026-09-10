import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactPage } from './ContactPage';
import { I18nProvider } from '../../i18n';
import type { SiteSettings, SiteSettingsState } from '../../api/site';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn(), POST: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

import { api } from '../../api/client';

const fullSettings: SiteSettings = {
  contacts: {
    phone: '+998 71 207 88 77',
    email: 'urmoninfo@gmail.com',
    address: { uz_latn: '', ru: '' },
    hours: { uz_latn: 'Dushanba – Juma, 9:00 – 18:00', ru: '' },
    social: { telegram: null, youtube: null },
  },
  season_windows: {},
};

const READY: SiteSettingsState = { status: 'ready', data: fullSettings };

beforeEach(() => {
  vi.mocked(api.POST).mockReset();
});

/**
 * ALWAYS rendered with both props, exactly as `routes.tsx` renders it.
 *
 * `onNavigate?.(...)` is optional-chained, so a bare `<ContactPage/>` — which
 * is how the route shipped — leaves both of this page's buttons compiling,
 * rendering and doing nothing; a test that renders it without the prop can
 * never see that. And the page no longer fetches its own site settings:
 * `routes.tsx`'s `Layout` reads them once per page view and hands them down,
 * where this page and `PublicLayout` above it each used to fetch for
 * themselves.
 */
function renderContact(onNavigate = vi.fn(), siteSettings: SiteSettingsState = READY) {
  render(
    <I18nProvider>
      <ContactPage onNavigate={onNavigate} siteSettings={siteSettings} />
    </I18nProvider>,
  );
  return onNavigate;
}

it('sends an appeal from the contact page', async () => {
  vi.mocked(api.POST).mockResolvedValue({
    data: { number: 'MR-2026-000123' },
    error: undefined,
  } as never);
  renderContact();

  await userEvent.type(screen.getByLabelText(/F\.I\.Sh\./i), 'Test Testov');
  await userEvent.type(screen.getByLabelText(/Telefon/i), '+998901234567');
  await userEvent.type(screen.getByLabelText(/mavzu/i), 'Ariza holati');
  await userEvent.type(screen.getByLabelText(/matni/i), 'Murojaat matni namunasi.');
  await userEvent.click(screen.getByRole('button', { name: /^yuborish$/i }));

  expect(await screen.findByText('MR-2026-000123')).toBeInTheDocument();
});

it('shows the phone and hours the layout handed down', async () => {
  renderContact();

  expect(await screen.findByText('+998 71 207 88 77')).toBeInTheDocument();
  expect(screen.getByText('Dushanba – Juma, 9:00 – 18:00')).toBeInTheDocument();
});

it('never renders a placeholder address when none is known', async () => {
  renderContact();

  expect(await screen.findByText('+998 71 207 88 77')).toBeInTheDocument();
  expect(screen.queryByText('Manzil')).not.toBeInTheDocument();
  expect(screen.queryByText(/\[MANZIL\]/)).not.toBeInTheDocument();
  expect(screen.queryByText(/\[MUDDAT\]/)).not.toBeInTheDocument();
});

it('opens the appeal-status check and the documents register from the side panels', async () => {
  const onNavigate = renderContact();

  await userEvent.click(screen.getByRole('button', { name: /^tekshirish$/i }));
  expect(onNavigate).toHaveBeenCalledWith('appeal_check');

  await userEvent.click(screen.getByRole('button', { name: /hujjatlar boʻlimi/i }));
  expect(onNavigate).toHaveBeenCalledWith('documents');
});

it('renders without contact details when the site-settings fetch failed', () => {
  renderContact(vi.fn(), { status: 'error' });

  expect(screen.queryByText('Ishonch telefoni')).not.toBeInTheDocument();
  // The filing form itself never depends on site settings being loaded.
  expect(screen.getByRole('button', { name: /^yuborish$/i })).toBeInTheDocument();
});
