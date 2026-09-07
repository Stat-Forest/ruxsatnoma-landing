import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { NewsPage } from './NewsPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

import { api } from '../../api/client';

const ID = 'a0000000-0000-4000-8000-00000000000';

function item(n: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `${ID}${n}`,
    title: { uz_latn: `Eʼlon ${n}`, ru: `Объявление ${n}` },
    body: { uz_latn: `Matn ${n}`, ru: `Текст ${n}` },
    publish_from: '2026-09-01T09:00:00+05:00',
    files: [],
    ...overrides,
  };
}

function answer(items: unknown[], total = items.length) {
  return { data: { items, total, page: 1, page_size: 10 }, error: undefined };
}

beforeEach(() => {
  vi.mocked(api.GET).mockReset();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <NewsPage />
      </I18nProvider>
    </MemoryRouter>,
  );
}

it('lists what the anonymous announcements route returns, each linking to its own page', async () => {
  vi.mocked(api.GET).mockResolvedValue(answer([item(1), item(2)]) as never);
  renderPage();

  expect(await screen.findByText('Eʼlon 1')).toBeInTheDocument();
  expect(screen.getByTestId(`news-item-${ID}2`)).toHaveAttribute('href', `/news/${ID}2`);
});

it('says the register is empty rather than showing a blank card', async () => {
  vi.mocked(api.GET).mockResolvedValue(answer([], 0) as never);
  renderPage();

  expect(await screen.findByTestId('news-empty')).toBeInTheDocument();
});

it('says so when the register cannot be loaded', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: undefined, error: { code: 'ERR-SYS-000' } } as never);
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('Yangiliklarni yuklab boʻlmadi');
});

it('pages through the register, asking the backend for the page it moved to', async () => {
  vi.mocked(api.GET).mockResolvedValue(answer([item(1)], 25) as never);
  renderPage();

  await screen.findByText('Eʼlon 1');
  await userEvent.click(screen.getByRole('button', { name: 'Oldinga' }));

  // 25 rows over a page size of 10 is three pages; the second request must ask
  // for page 2, not re-read page 1 and slice it client-side.
  const lastCall = vi.mocked(api.GET).mock.calls.at(-1);
  expect(lastCall?.[1]).toMatchObject({ params: { query: { page: 2, page_size: 10 } } });
});

it('shows an attachment count when an announcement carries files', async () => {
  vi.mocked(api.GET).mockResolvedValue(
    answer([item(1, { files: [{ id: 'f1', filename: 'qaror.pdf', content_type: 'application/pdf' }] })]) as never,
  );
  renderPage();

  expect(await screen.findByText(/Ilovalar: 1/)).toBeInTheDocument();
});
