import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServicesPage } from './ServicesPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

import { api } from '../../api/client';

const mockActivities = [
  {
    id: '0198f100-0001-7000-8000-000000000001',
    code: 'grazing',
    name: { uz_latn: 'Chorva mollarini boqish' },
  },
  {
    id: '0198f100-0001-7000-8000-000000000002',
    code: 'haymaking',
    name: { uz_latn: 'Pichan tayyorlash' },
  },
  {
    id: '0198f100-0001-7000-8000-000000000003',
    code: 'apiary',
    name: { uz_latn: 'Asalarichilik' },
  },
  {
    id: '0198f100-0001-7000-8000-000000000004',
    code: 'recreation',
    name: { uz_latn: 'Dam olish va turizm' },
  },
  {
    id: '0198f100-0001-7000-8000-000000000005',
    code: 'deadwood',
    name: { uz_latn: 'Quruq shox-shabba yigʻish' },
  },
  {
    id: '0198f100-0001-7000-8000-000000000006',
    code: 'science',
    name: { uz_latn: 'Ilmiy tadqiqot' },
  },
];

beforeEach(() => {
  vi.mocked(api.GET).mockReset();
});

function renderServices(onNavigate?: (page: string, params?: any) => void) {
  return render(
    <I18nProvider>
      <ServicesPage onNavigate={onNavigate} />
    </I18nProvider>,
  );
}

it('loads and renders 6 services from the activity-types API', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: mockActivities, error: undefined } as never);
  renderServices();

  await waitFor(() => {
    expect(screen.getByText(/Chorva mollarini boqish boʻyicha ruxsatnoma/i)).toBeInTheDocument();
    expect(screen.getByText(/Quruq shox-shabba yigʻish ruxsatnomasi/i)).toBeInTheDocument();
    expect(screen.getByText(/Ilmiy-tadqiqot ishlarini olib borish ruxsatnomasi/i)).toBeInTheDocument();
  });

  expect(screen.getAllByRole('button', { name: /Ariza berish/i })).toHaveLength(6);
});

it('navigates to applicant_wizard with real UUID when apply button is clicked', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: mockActivities, error: undefined } as never);
  const onNavigate = vi.fn();
  renderServices(onNavigate);

  await waitFor(() => {
    expect(screen.getByText(/Quruq shox-shabba yigʻish ruxsatnomasi/i)).toBeInTheDocument();
  });

  const buttons = screen.getAllByRole('button', { name: /Ariza berish/i });
  await userEvent.click(buttons[4]); // 5th item: deadwood

  expect(onNavigate).toHaveBeenCalledWith('applicant_wizard', {
    activity: '0198f100-0001-7000-8000-000000000005',
  });
});

it('renders fallback services when the API call fails', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: undefined, error: { code: 'ERR-NET-001' } } as never);
  renderServices();

  await waitFor(() => {
    expect(screen.getByText(/Chorva mollarini boqish/i)).toBeInTheDocument();
  });

  expect(screen.getAllByRole('button', { name: /Ariza berish/i })).toHaveLength(6);
});
