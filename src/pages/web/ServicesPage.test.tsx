import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ServicesPage } from './ServicesPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

import { api } from '../../api/client';

/**
 * The defect this file pins: the six services used to be constants in the
 * translation files, each carrying an invented "up to 3 working days" term
 * that the system has never honoured (real deadline: `SLA_DAYS`, 15). They
 * now come from `GET /public/refs/activity-types` — nothing here may render
 * a service the catalog did not return, or a term this page made up.
 */

const GRAZING = {
  id: 'a0000000-0000-4000-8000-000000000001',
  code: 'grazing',
  name: { uz_latn: 'Chorva mollarini boqish', ru: 'Выпас скота' },
  description: {
    uz_latn: 'Yaylov konturlarida belgilangan normalarga muvofiq chorva boqish uchun ruxsatnoma.',
    ru: 'Разрешение на выпас скота на пастбищных контурах в соответствии с нормой.',
  },
  processing_days: 15,
};

const BEEKEEPING = {
  id: 'a0000000-0000-4000-8000-000000000002',
  code: 'apiary',
  name: { uz_latn: 'Asalarichilik', ru: 'Пчеловодство' },
  description: {
    uz_latn: 'Asalari oilalarini oʻrmon yerlariga vaqtinchalik joylashtirish.',
    ru: 'Временное размещение пчелиных семей на землях лесного фонда.',
  },
  processing_days: 15,
};

// `deadwood` and `science` never had copy on this site (migration `0038`'s
// own docstring) — their `description` is `null`, on purpose, not a gap to
// fill in.
const DEADWOOD = {
  id: 'a0000000-0000-4000-8000-000000000003',
  code: 'deadwood',
  name: { uz_latn: 'Quruq shoxlarni yigʻish', ru: 'Сбор сухостоя' },
  description: null,
  processing_days: 15,
};

function answer(items: unknown[]) {
  return { data: items, error: undefined };
}

beforeEach(() => {
  vi.mocked(api.GET).mockReset();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <ServicesPage />
      </I18nProvider>
    </MemoryRouter>,
  );
}

it('lists the services the API returns, not a hard-coded six', async () => {
  vi.mocked(api.GET).mockResolvedValue(answer([GRAZING, BEEKEEPING]) as never);
  renderPage();

  expect(await screen.findByText(GRAZING.name.uz_latn)).toBeInTheDocument();
  // "recreation" (not in this answer) is the only service whose Uzbek name
  // contains "dam olish" — its absence proves the page rendered the API's
  // list, not a hard-coded six that always included it.
  expect(screen.queryByText(/dam olish/i)).not.toBeInTheDocument();
});

it('says the real term, in days', async () => {
  vi.mocked(api.GET).mockResolvedValue(answer([GRAZING]) as never);
  renderPage();

  expect(await screen.findByText(/15 kun/)).toBeInTheDocument();
  expect(screen.queryByText(/3 ish kuni/)).not.toBeInTheDocument();
});

it('renders a null description without a placeholder sentence', async () => {
  vi.mocked(api.GET).mockResolvedValue(answer([DEADWOOD]) as never);
  renderPage();

  expect(await screen.findByText(DEADWOOD.name.uz_latn)).toBeInTheDocument();
  // No invented copy stands in for the missing description — the page must
  // not render a description element for this card at all.
  expect(screen.queryByTestId(`service-desc-${DEADWOOD.id}`)).not.toBeInTheDocument();
});

it('says the catalog is empty rather than showing a blank grid', async () => {
  vi.mocked(api.GET).mockResolvedValue(answer([]) as never);
  renderPage();

  expect(await screen.findByTestId('services-empty')).toBeInTheDocument();
});

it('says so plainly when the catalog is unavailable', async () => {
  vi.mocked(api.GET).mockRejectedValue(new Error('network error'));
  renderPage();

  expect(await screen.findByRole('alert')).toBeInTheDocument();
});
