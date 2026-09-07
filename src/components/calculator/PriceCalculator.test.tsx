import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PriceCalculator } from './PriceCalculator';
import { CABINET_PATHS, cabinetUrl, navigation } from '../../lib/cabinet';
import { I18nProvider } from '../../i18n';

// PriceCalculator calls goToCabinet directly from its own onClick — it takes no
// onNavigate prop and bypasses routes.tsx's onNavigate/CABINET_ENTRIES table
// entirely (see routes.tsx's docstring on CABINET_ENTRIES). This was the
// seventh sign-in call site, the one still calling
// `window.open('https://id.egov.uz', '_blank')` after the other six were
// fixed, and routes.test.tsx cannot see it.
vi.mock('../../api/client', () => ({
  api: {
    GET: vi.fn().mockResolvedValue({ data: [], error: undefined }),
  },
}));

beforeEach(() => {
  vi.stubEnv('VITE_ADMIN_BASE_URL', 'https://admin.example.uz');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('PriceCalculator CTA', () => {
  it('sends "Shu boʻyicha ariza topshirish" to the cabinet wizard, never id.egov.uz', async () => {
    const assign = vi.spyOn(navigation, 'assign').mockImplementation(() => {});
    const open = vi.spyOn(window, 'open');
    render(
      <I18nProvider>
        <PriceCalculator />
      </I18nProvider>,
    );

    const button = await screen.findByText('Shu boʻyicha ariza topshirish');
    await userEvent.click(button);

    expect(assign).toHaveBeenCalledWith(cabinetUrl(CABINET_PATHS.wizard));
    expect(open).not.toHaveBeenCalled();
  });

  it('renders translated activity and livestock options when language is Russian', async () => {
    window.localStorage.setItem('lang', 'ru');
    const { api } = await import('../../api/client');
    vi.mocked(api.GET).mockImplementation((path: string) => {
      if (path.includes('activity-types')) {
        return Promise.resolve({
          data: [
            {
              id: 'act-1',
              code: 'grazing',
              name: {
                en: 'Livestock grazing',
                uz_cyrl: 'Чорва молларини боқиш',
                uz_latn: 'Chorva mollarini boqish',
              },
            },
          ],
          error: undefined,
        } as any);
      }
      if (path.includes('livestock-types')) {
        return Promise.resolve({
          data: [
            {
              id: 'ls-1',
              code: 'cattle_adult',
              name: {
                en: 'Cattle, adult',
                uz_cyrl: 'Қорамол (катта)',
                uz_latn: 'Qoramol (katta)',
              },
            },
          ],
          error: undefined,
        } as any);
      }
      return Promise.resolve({ data: [], error: undefined } as any);
    });

    render(
      <I18nProvider>
        <PriceCalculator />
      </I18nProvider>,
    );

    // Dropdown activity should have Russian label "Выпас скота"
    expect(await screen.findByText('Выпас скота')).toBeInTheDocument();
    // Livestock label should have Russian label "Крупный рогатый скот (взрослый)"
    expect(await screen.findByText('Крупный рогатый скот (взрослый)')).toBeInTheDocument();

    window.localStorage.removeItem('lang');
  });
});
