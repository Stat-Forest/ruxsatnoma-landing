import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TariffsPage } from './TariffsPage';
import { CABINET_PATHS, cabinetUrl, navigation } from '../../lib/cabinet';
import { I18nProvider } from '../../i18n';

// TariffsPage calls goToCabinet directly from its own onClick — it takes no
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

describe('TariffsPage calculator CTA', () => {
  it('sends "Shu boʻyicha ariza topshirish" to the cabinet wizard, never id.egov.uz', async () => {
    const assign = vi.spyOn(navigation, 'assign').mockImplementation(() => {});
    const open = vi.spyOn(window, 'open');
    render(
      <I18nProvider>
        <TariffsPage />
      </I18nProvider>,
    );

    const button = await screen.findByText('Shu boʻyicha ariza topshirish');
    await userEvent.click(button);

    expect(assign).toHaveBeenCalledWith(cabinetUrl(CABINET_PATHS.wizard));
    expect(open).not.toHaveBeenCalled();
  });
});
