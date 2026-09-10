import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactPage } from './ContactPage';
import { I18nProvider } from '../../i18n';
import type { SiteSettings } from '../../api/site';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn(), POST: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

vi.mock('../../api/site', () => ({
  fetchSiteSettings: vi.fn(),
}));

import { api } from '../../api/client';
import { fetchSiteSettings } from '../../api/site';

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

beforeEach(() => {
  vi.mocked(api.POST).mockReset();
  vi.mocked(fetchSiteSettings).mockReset();
});

function renderContact() {
  return render(
    <I18nProvider>
      <ContactPage />
    </I18nProvider>,
  );
}

it('sends an appeal from the contact page', async () => {
  vi.mocked(fetchSiteSettings).mockResolvedValue(fullSettings);
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

it('shows the phone and hours once site settings load', async () => {
  vi.mocked(fetchSiteSettings).mockResolvedValue(fullSettings);
  renderContact();

  expect(await screen.findByText('+998 71 207 88 77')).toBeInTheDocument();
  expect(screen.getByText('Dushanba – Juma, 9:00 – 18:00')).toBeInTheDocument();
});

it('never renders a placeholder address when none is known', async () => {
  vi.mocked(fetchSiteSettings).mockResolvedValue(fullSettings);
  renderContact();

  await waitFor(() => expect(fetchSiteSettings).toHaveBeenCalled());
  expect(screen.queryByText('Manzil')).not.toBeInTheDocument();
  expect(screen.queryByText(/\[MANZIL\]/)).not.toBeInTheDocument();
  expect(screen.queryByText(/\[MUDDAT\]/)).not.toBeInTheDocument();
});

it('renders without contact details when the site-settings endpoint fails', async () => {
  vi.mocked(fetchSiteSettings).mockResolvedValue(null);
  renderContact();

  await waitFor(() => expect(fetchSiteSettings).toHaveBeenCalled());
  expect(screen.queryByText('Ishonch telefoni')).not.toBeInTheDocument();
  // The filing form itself never depends on site settings being loaded.
  expect(screen.getByRole('button', { name: /^yuborish$/i })).toBeInTheDocument();
});
