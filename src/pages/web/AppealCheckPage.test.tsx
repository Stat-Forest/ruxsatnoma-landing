import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppealCheckPage } from './AppealCheckPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn(), POST: vi.fn() },
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
  (api.POST as ReturnType<typeof vi.fn>).mockReset();
});

/** The page carries TWO forms since the filing form was added (finding F8):
 *  "Telefon" and "Elektron pochta" are labels on both, so these tests name the
 *  CHECK form's field by its own id rather than by a label that is now
 *  legitimately ambiguous. */
function checkField(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`no field #${id}`);
  return el;
}

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
    await user.type(checkField('appeal-phone'), '+998901234567');
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
    await user.type(checkField('appeal-phone'), '+998901234567');
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
    await user.type(checkField('appeal-email'), 'test@example.uz');
    await user.click(screen.getByRole('button', { name: /Tekshirish/ }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

// Every test above renders `<AppealCheckPage />` with no `<BrowserRouter>` /
// route context at all — `useSearchParams()` throws outside a router, so a
// regression that started mirroring phone/email into the URL (see the
// deliberate divergence from `VerifyPage` in the module docstring) would
// fail every single test in this file, not just a dedicated one.

/**
 * Filing an appeal — the half of С27 that did not exist until the stage 7.3
 * walkthrough looked for it (finding F8). `POST /api/v1/public/appeals` was
 * live, this page could check a status, the adminka could answer — and nothing
 * anywhere called the filing route, so a citizen could check the status of an
 * appeal they had no way to file.
 */
describe('filing an appeal', () => {
  async function fillFiling(user: ReturnType<typeof userEvent.setup>) {
    await user.type(checkField('appeal-file-name'), 'Aziz Karimov');
    await user.type(checkField('appeal-file-subject'), 'Yaylovdan foydalanish');
    await user.type(checkField('appeal-file-body'), 'Kontur chegarasi haqida savol.');
  }

  it('posts the appeal and shows the registration number it gets back', async () => {
    (api.POST as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { number: 'MR-2026-000123' },
      error: undefined,
    });
    renderPage();
    const user = userEvent.setup();

    await fillFiling(user);
    await user.type(checkField('appeal-file-phone'), '+998901234567');
    await user.click(screen.getByRole('button', { name: /Yuborish/ }));

    expect(await screen.findByText('MR-2026-000123')).toBeInTheDocument();
    expect(api.POST).toHaveBeenCalledWith('/api/v1/public/appeals', {
      body: {
        applicant_name: 'Aziz Karimov',
        contact: { phone: '+998901234567', email: null },
        subject: 'Yaylovdan foydalanish',
        body: 'Kontur chegarasi haqida savol.',
      },
    });
  });

  it('refuses locally, and never calls the API, when neither phone nor email is given', async () => {
    renderPage();
    const user = userEvent.setup();

    await fillFiling(user);
    await user.click(screen.getByRole('button', { name: /Yuborish/ }));

    expect(
      await screen.findByText(/Telefon yoki elektron pochtadan kamida bittasini kiriting/),
    ).toBeInTheDocument();
    expect(api.POST).not.toHaveBeenCalled();
  });

  it('fills the check form with the number and contact just used', async () => {
    (api.POST as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { number: 'MR-2026-000777' },
      error: undefined,
    });
    renderPage();
    const user = userEvent.setup();

    await fillFiling(user);
    await user.type(checkField('appeal-file-email'), 'aziz@example.uz');
    await user.click(screen.getByRole('button', { name: /Yuborish/ }));

    await screen.findByText('MR-2026-000777');
    expect((checkField('appeal-number') as HTMLInputElement).value).toBe('MR-2026-000777');
    expect((checkField('appeal-email') as HTMLInputElement).value).toBe('aziz@example.uz');
  });

  it('reports a refusal instead of pretending the appeal was filed', async () => {
    (api.POST as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: undefined,
      error: { code: 'ERR-SYS-006', message: 'Too many requests', details: {} },
    });
    renderPage();
    const user = userEvent.setup();

    await fillFiling(user);
    await user.type(checkField('appeal-file-phone'), '+998901234567');
    await user.click(screen.getByRole('button', { name: /Yuborish/ }));

    expect(await screen.findByText('Murojaat yuborilmadi')).toBeInTheDocument();
  });
});
