import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaqPage } from './FaqPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

import { api } from '../../api/client';

const mockFaqs = [
  {
    id: 'faq-1',
    category: 'permits',
    question: { uz_latn: 'Ruxsatnoma qanday olinadi?', ru: 'Как получить разрешение?' },
    answer: { uz_latn: 'Portal orqali ariza topshiring.', ru: 'Подайте заявку через портал.' },
    status: 'published',
  },
];

beforeEach(() => {
  vi.mocked(api.GET).mockReset();
});

function renderFaq() {
  return render(
    <I18nProvider>
      <FaqPage />
    </I18nProvider>,
  );
}

it('fetches FAQs from /api/v1/help/faq and displays them', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: mockFaqs, error: undefined } as never);
  renderFaq();

  await waitFor(() => {
    expect(screen.getByText('Ruxsatnoma qanday olinadi?')).toBeInTheDocument();
  });
  expect(screen.queryByText(/To‘lov summasi qanday hisoblanadi/i)).not.toBeInTheDocument();
});

it('toggles FAQ answer open and closed on click', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: mockFaqs, error: undefined } as never);
  renderFaq();

  await waitFor(() => {
    expect(screen.getByText('Ruxsatnoma qanday olinadi?')).toBeInTheDocument();
  });

  const questionBtn = screen.getByText('Ruxsatnoma qanday olinadi?');
  expect(screen.getByText('Portal orqali ariza topshiring.')).toBeInTheDocument();

  // Click to close
  await userEvent.click(questionBtn);
  expect(screen.queryByText('Portal orqali ariza topshiring.')).not.toBeInTheDocument();

  // Click to re-open
  await userEvent.click(questionBtn);
  expect(screen.getByText('Portal orqali ariza topshiring.')).toBeInTheDocument();
});

it('falls back to default FAQs when API fails', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: undefined, error: { code: 'ERR-NET-001' } } as never);
  renderFaq();

  await waitFor(() => {
    expect(screen.getByText(/Oʻrmon xoʻjaligida chorva mollarini boqish uchun/i)).toBeInTheDocument();
  });
});
