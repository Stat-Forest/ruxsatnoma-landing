import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { NewsItemPage } from './NewsItemPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
  BASE_URL: 'http://api.example.uz',
}));

import { api } from '../../api/client';

const ID = 'a0000000-0000-4000-8000-000000000001';

const ITEM = {
  id: ID,
  title: { uz_latn: 'Yaylov mavsumi', ru: 'Пастбищный сезон' },
  body: { uz_latn: 'Birinchi qator\nIkkinchi qator', ru: 'Первая строка\nВторая строка' },
  publish_from: '2026-09-01T09:00:00+05:00',
  files: [{ id: 'f0000000-0000-4000-8000-000000000001', filename: 'qaror.pdf', content_type: 'application/pdf' }],
};

beforeEach(() => {
  vi.mocked(api.GET).mockReset();
});

function renderItem() {
  return render(
    <MemoryRouter initialEntries={[`/news/${ID}`]}>
      <I18nProvider>
        <Routes>
          <Route path="/news/:newsId" element={<NewsItemPage />} />
        </Routes>
      </I18nProvider>
    </MemoryRouter>,
  );
}

it('shows the announcement text and links its attachment through the announcement', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: ITEM, error: undefined } as never);
  renderItem();

  expect(await screen.findByText('Yaylov mavsumi')).toBeInTheDocument();
  // `GET /files/{id}` needs a session; the anonymous download is addressed
  // through the announcement, and the link must say so.
  expect(screen.getByRole('link', { name: /qaror\.pdf/ })).toHaveAttribute(
    'href',
    `http://api.example.uz/api/v1/public/announcements/${ID}/files/${ITEM.files[0].id}`,
  );
});

it('says the announcement is gone rather than showing an empty page', async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: undefined, error: { code: 'ERR-SYS-003' } } as never);
  renderItem();

  expect(await screen.findByRole('alert')).toHaveTextContent('Yangilik topilmadi');
});
