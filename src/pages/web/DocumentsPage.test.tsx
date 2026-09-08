import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentsPage } from './DocumentsPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

import { api } from '../../api/client';

const ID = 'a0000000-0000-4000-8000-00000000000';

function doc(n: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `${ID}${n}`,
    title: { uz_latn: `Hujjat ${n}`, ru: `Документ ${n}` },
    summary: { uz_latn: `Izoh ${n}`, ru: `Описание ${n}` },
    doc_number: `ZRU-${n}`,
    adopted_on: '2018-04-16',
    source_url: null,
    file: { id: `f0000000-0000-4000-8000-00000000000${n}`, filename: 'kodeks.pdf', content_type: 'application/pdf' },
    ...overrides,
  };
}

function answer(items: unknown[], total = items.length) {
  return { data: { items, total, page: 1, page_size: 50 }, error: undefined };
}

beforeEach(() => {
  vi.mocked(api.GET).mockReset();
});

function renderPage() {
  return render(
    <I18nProvider>
      <DocumentsPage />
    </I18nProvider>,
  );
}

it('lists what the anonymous register returns, with its number and date of adoption', async () => {
  vi.mocked(api.GET).mockResolvedValue(answer([doc(1), doc(2)]) as never);
  renderPage();

  expect(await screen.findByText('Hujjat 1')).toBeInTheDocument();
  expect(screen.getByText('№ ZRU-2')).toBeInTheDocument();
  expect(screen.getAllByText('16.04.2018')).toHaveLength(2);
});

it('points the download at the document, not at the file id', async () => {
  /** `GET /files/{id}` needs a session; the anonymous route addresses the PDF
   *  through its own document. */
  vi.mocked(api.GET).mockResolvedValue(answer([doc(1)]) as never);
  renderPage();

  const link = await screen.findByTestId(`document-open-${ID}1`);
  expect(link).toHaveAttribute(
    'href',
    `http://localhost:8000/api/v1/public/legal-documents/${ID}1/file`,
  );
});

it('links a document that lives only on lex.uz out to lex.uz', async () => {
  vi.mocked(api.GET).mockResolvedValue(
    answer([doc(1, { file: null, source_url: 'https://lex.uz/docs/3799819' })]) as never,
  );
  renderPage();

  const link = await screen.findByTestId(`document-open-${ID}1`);
  expect(link).toHaveAttribute('href', 'https://lex.uz/docs/3799819');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
});

it('says the register is empty rather than showing a blank card', async () => {
  vi.mocked(api.GET).mockResolvedValue(answer([], 0) as never);
  renderPage();

  expect(await screen.findByTestId('documents-empty')).toBeInTheDocument();
});

it('says so when the register cannot be loaded', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: undefined, error: { code: 'ERR-SYS-000' } } as never);
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('Hujjatlarni yuklab boʻlmadi');
});
