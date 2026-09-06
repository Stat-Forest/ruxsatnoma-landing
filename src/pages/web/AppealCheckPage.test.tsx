import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppealCheckPage } from './AppealCheckPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
}));

import { api } from '../../api/client';

function renderPage() {
  return render(
    <I18nProvider>
      <AppealCheckPage />
    </I18nProvider>,
  );
}

beforeEach(() => {
  (api.GET as ReturnType<typeof vi.fn>).mockReset();
});

describe('AppealCheckPage', () => {
  it('shows a validation message and never calls the API when only a number is given', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/MR-2026-000123/), 'MR-2026-000123');
    await user.click(screen.getByRole('button', { name: /Tekshirish/ }));

    expect(await screen.findByText(/Raqamni kiriting va telefon yoki elektron pochtadan/)).toBeInTheDocument();
    expect(api.GET).not.toHaveBeenCalled();
  });

  it('renders the miss alert, not a crash, on a found: false response', async () => {
    (api.GET as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { found: false },
      error: undefined,
    });
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/MR-2026-000123/), 'MR-2026-000123');
    await user.type(screen.getByLabelText('Telefon'), '+998901234567');
    await user.click(screen.getByRole('button', { name: /Tekshirish/ }));

    expect(await screen.findByText('Murojaat topilmadi')).toBeInTheDocument();
  });

  it('renders the answer panel and the correct status badge for a found response', async () => {
    (api.GET as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        found: true,
        status: 'answered',
        subject: 'Yaylov ijarasi boʻyicha savol',
        answer_text: 'Sizning murojaatingiz koʻrib chiqildi.',
        answered_at: '2026-08-15T10:00:00Z',
      },
      error: undefined,
    });
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/MR-2026-000123/), 'MR-2026-000123');
    await user.type(screen.getByLabelText('Telefon'), '+998901234567');
    await user.click(screen.getByRole('button', { name: /Tekshirish/ }));

    expect(await screen.findByText('Sizning murojaatingiz koʻrib chiqildi.')).toBeInTheDocument();
    expect(screen.getByText('Javob berildi')).toBeInTheDocument();
    expect(screen.getByText('2026-08-15')).toBeInTheDocument();
  });

  it('renders an error alert, not a crash, on a failed check', async () => {
    (api.GET as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: undefined,
      error: { error: { code: 'ERR-SYS-000', message: 'Server error' } },
    });
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/MR-2026-000123/), 'MR-2026-000123');
    await user.type(screen.getByLabelText('Elektron pochta'), 'test@example.uz');
    await user.click(screen.getByRole('button', { name: /Tekshirish/ }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

// Every test above renders `<AppealCheckPage />` with no `<BrowserRouter>` /
// route context at all — `useSearchParams()` throws outside a router, so a
// regression that started mirroring phone/email into the URL (see the
// deliberate divergence from `VerifyPage` in the module docstring) would
// fail every single test in this file, not just a dedicated one.
