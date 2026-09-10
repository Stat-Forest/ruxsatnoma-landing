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
    POST: vi.fn().mockResolvedValue({ data: undefined, error: undefined }),
  },
}));

function renderCalculator() {
  return render(
    <I18nProvider>
      <PriceCalculator />
    </I18nProvider>,
  );
}

/** The six activities, named and coded exactly as the approved prototype
 *  (`design-canvas/Services.dc.html`) and `Scene`'s own `SceneKind`s. */
const ACTIVITY_TYPES = [
  { id: 'act-grazing', code: 'grazing', name: { uz_latn: 'Chorva mollarini boqish' } },
  { id: 'act-haymaking', code: 'haymaking', name: { uz_latn: 'Pichan tayyorlash' } },
  { id: 'act-apiary', code: 'apiary', name: { uz_latn: 'Asalarichilik' } },
  { id: 'act-recreation', code: 'recreation', name: { uz_latn: 'Dam olish va turizm' } },
  { id: 'act-deadwood', code: 'deadwood', name: { uz_latn: 'Quruq shox-shabba yigʻish' } },
  { id: 'act-science', code: 'science', name: { uz_latn: 'Ilmiy tadqiqot' } },
];

const LIVESTOCK_TYPES = [{ id: 'ls-cattle', code: 'cattle_adult', name: { uz_latn: 'Qoramol (katta)' } }];

function mockRefs({
  activityTypes = ACTIVITY_TYPES,
  livestockTypes = LIVESTOCK_TYPES,
}: { activityTypes?: unknown[]; livestockTypes?: unknown[] } = {}) {
  return async (path: string) => {
    if (path.includes('activity-types')) return { data: activityTypes, error: undefined };
    if (path.includes('livestock-types')) return { data: livestockTypes, error: undefined };
    return { data: [], error: undefined };
  };
}

beforeEach(() => {
  vi.stubEnv('VITE_ADMIN_BASE_URL', 'https://admin.example.uz');
});

afterEach(() => {
  vi.unstubAllEnvs();
  window.localStorage.removeItem('lang');
});

describe('PriceCalculator CTA', () => {
  it('sends "Shu boʻyicha ariza topshirish" to the cabinet wizard, never id.egov.uz', async () => {
    const assign = vi.spyOn(navigation, 'assign').mockImplementation(() => {});
    const open = vi.spyOn(window, 'open');
    renderCalculator();

    const button = await screen.findByText('Shu boʻyicha ariza topshirish');
    await userEvent.click(button);

    expect(assign).toHaveBeenCalledWith(cabinetUrl(CABINET_PATHS.wizard));
    expect(open).not.toHaveBeenCalled();
  });

  it('renders translated activity and livestock options when language is Russian', async () => {
    window.localStorage.setItem('lang', 'ru');
    const { api } = await import('../../api/client');
    vi.mocked(api.GET).mockImplementation(
      mockRefs({
        activityTypes: [
          {
            id: 'act-1',
            code: 'grazing',
            name: {
              en: 'Livestock grazing',
              uz_cyrl: 'Чорва молларини боқиш',
              uz_latn: 'Chorva mollarini boqish',
              ru: 'Выпас скота',
            },
          },
        ],
        livestockTypes: [
          {
            id: 'ls-1',
            code: 'cattle_adult',
            name: {
              en: 'Cattle, adult',
              uz_cyrl: 'Қорамол (катта)',
              uz_latn: 'Qoramol (katta)',
              ru: 'Крупный рогатый скот (взрослый)',
            },
          },
        ],
      }) as never,
    );

    renderCalculator();

    // Activity chip should carry the Russian label "Выпас скота".
    expect(await screen.findByText('Выпас скота')).toBeInTheDocument();
    // The livestock head-count field's label is composed ("<name>, bosh
    // soni") so it matches on a partial, not an exact, string.
    expect(await screen.findByText(/Крупный рогатый скот \(взрослый\)/)).toBeInTheDocument();
  });
});

describe('PriceCalculator — six activities, six field sets', () => {
  it('changes its fields with the chosen activity', async () => {
    const { api } = await import('../../api/client');
    vi.mocked(api.GET).mockImplementation(mockRefs() as never);

    render(
      <I18nProvider>
        <PriceCalculator />
      </I18nProvider>,
    );

    await userEvent.click(await screen.findByRole('button', { name: /asalarichilik/i }));
    expect(screen.getByLabelText(/uyalar soni/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/bosh soni/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /shox-shabba/i }));
    expect(screen.getByLabelText(/hajm/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/uyalar soni/i)).not.toBeInTheDocument();
  });

  it('shows the grazing head-count field for livestock types, cleared away for other activities', async () => {
    const { api } = await import('../../api/client');
    vi.mocked(api.GET).mockImplementation(mockRefs() as never);
    renderCalculator();

    // Grazing is the catalogue's first activity, selected by default.
    expect(await screen.findByLabelText(/bosh soni/i)).toBeInTheDocument();

    await userEvent.click(await screen.findByRole('button', { name: /pichan tayyorlash/i }));
    expect(screen.getByLabelText(/oʻrim maydoni/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/bosh soni/i)).not.toBeInTheDocument();
  });

  it('never shows a computed sum before the estimate call answers', () => {
    renderCalculator();
    expect(screen.getByTestId('calculator-sum')).toHaveTextContent('—');
  });

  // The core safety requirement (task 11 brief): most tariffs are still
  // blocked on VMQ 689's annex 5, and the backend refuses an unpublished one
  // with `ERR-NORM-004` (422) rather than inventing a figure — this page
  // must show the same refusal, in words, never a plausible-looking number.
  it('shows a dash and an explanatory line, never a number, when the backend has no published tariff', async () => {
    const { api } = await import('../../api/client');
    vi.mocked(api.GET).mockImplementation(mockRefs() as never);
    vi.mocked(api.POST).mockResolvedValue({
      data: undefined,
      error: { error: { code: 'ERR-NORM-004', message: 'Не задан параметр расчёта' } },
    } as never);

    renderCalculator();

    await userEvent.click(await screen.findByRole('button', { name: /pichan tayyorlash/i }));
    await userEvent.type(screen.getByLabelText(/oʻrim maydoni/i), '5');

    expect(await screen.findByText(/eʼlon qilinmagan/i)).toBeInTheDocument();
    expect(screen.getByTestId('calculator-sum')).toHaveTextContent('—');
  });

  // Scientific research is priced `Imtiyozli, ariza asosida` (decision:
  // task 11 brief) — not a number, not even a dash from an unresolved
  // estimate, and no `POST /calculations/estimate` call at all.
  it('shows the fixed privileged label for scientific research and calls no estimate endpoint', async () => {
    const { api } = await import('../../api/client');
    vi.mocked(api.GET).mockImplementation(mockRefs() as never);
    vi.mocked(api.POST).mockClear();

    renderCalculator();

    await userEvent.click(await screen.findByRole('button', { name: /ilmiy tadqiqot/i }));

    expect(await screen.findByTestId('calculator-sum')).toHaveTextContent('Imtiyozli');
    expect(screen.getByText(/ariza asosida/i)).toBeInTheDocument();
    expect(api.POST).not.toHaveBeenCalled();
  });
});
