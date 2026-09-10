import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { VerifyPage } from './VerifyPage';
import { I18nProvider } from '../../i18n';

vi.mock('../../api/client', () => ({
  api: { GET: vi.fn() },
  BASE_URL: 'http://localhost:8000',
}));

vi.mock('../../api/applications', () => ({
  checkApplication: vi.fn(),
}));

// This page's own tests never touch `maplibre-gl` — that is
// `PermitContourMap.test.tsx`'s own job. The component is `React.lazy`-d
// here (it is the only reason `maplibre-gl` is in this build at all), so
// this mock stands in for the dynamic import. It renders unconditionally:
// whether the panel appears at all is now the PAGE's decision, and that is
// what the two tests below pin.
vi.mock('../../components/map/PermitContourMap', () => ({
  default: () => <div data-testid="permit-contour" />,
}));

import { api } from '../../api/client';
import { checkApplication } from '../../api/applications';

function renderVerify(initialEntries: string[] = ['/check']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <I18nProvider>
        <VerifyPage />
      </I18nProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  (api.GET as ReturnType<typeof vi.fn>).mockReset();
  (checkApplication as ReturnType<typeof vi.fn>).mockReset();
});

async function searchPermit(user: ReturnType<typeof userEvent.setup>, series: string, number: string) {
  await user.type(screen.getByLabelText(/seriya/i), series);
  await user.type(screen.getByLabelText(/raqam/i), number);
  await user.click(screen.getByRole('button', { name: /tekshirish/i }));
}

describe('VerifyPage — tab switcher', () => {
  it('switches between the permit and application arms', async () => {
    renderVerify();
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: /ariza holati/i }));

    expect(screen.getByLabelText(/ariza raqami/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/seriya/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /^ruxsatnoma$/i }));

    expect(screen.getByLabelText(/seriya/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/ariza raqami/i)).not.toBeInTheDocument();
  });
});

describe('VerifyPage — permit arm', () => {
  const foundPermit = {
    found: true,
    status: 'амалда' as const,
    status_label: { uz_latn: 'Amalda' },
    valid_from: '2026-05-01',
    valid_to: '2026-11-01',
    organization: 'Burchmulla',
    activity_type: 'Chorva',
    signatures_valid: true,
    holder: 'A*** V***',
  };

  /**
   * The defect this pins: the map panel used to mount whatever the API sent.
   * `contour` is withheld until the Agency's disclosure setting is on — off
   * in production — so what a citizen actually got was a blank green
   * rectangle with zoom buttons and a legend for an invisible boundary.
   * No geometry, no panel, and no map title either.
   */
  it('mounts no map panel at all when the API sends no contour', async () => {
    (api.GET as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: foundPermit,
      error: undefined,
    });
    renderVerify();
    const user = userEvent.setup();

    await searchPermit(user, 'A', '123');

    expect(await screen.findByText(/амалда/i)).toBeInTheDocument();
    expect(screen.queryByTestId('permit-contour')).not.toBeInTheDocument();
    expect(screen.queryByText('Kontur xaritasi')).not.toBeInTheDocument();
    // The leshoz is still named — as text on the result card, not as a map.
    expect(screen.getByText('Burchmulla')).toBeInTheDocument();
  });

  it('draws the contour when the API actually sends one', async () => {
    (api.GET as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { ...foundPermit, contour: { type: 'Polygon', coordinates: [[[69.1, 41.2], [69.2, 41.2], [69.2, 41.3], [69.1, 41.2]]] } },
      error: undefined,
    });
    renderVerify();
    const user = userEvent.setup();

    await searchPermit(user, 'A', '123');

    expect(await screen.findByTestId('permit-contour')).toBeInTheDocument();
  });

  it('renders the miss alert, not a crash, on a found: false response', async () => {
    (api.GET as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { found: false },
      error: undefined,
    });
    renderVerify();
    const user = userEvent.setup();

    await searchPermit(user, 'A', '999999');

    expect(await screen.findByText('Ruxsatnoma Topilmadi')).toBeInTheDocument();
  });

  it('renders an error alert, not a crash, on a failed check', async () => {
    (api.GET as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: undefined,
      error: { error: { code: 'ERR-SYS-000', message: 'Server error' } },
    });
    renderVerify();
    const user = userEvent.setup();

    await searchPermit(user, 'A', '123');

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

describe('VerifyPage — application arm', () => {
  async function openApplicationTab(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('tab', { name: /ariza holati/i }));
  }

  async function searchApplication(user: ReturnType<typeof userEvent.setup>, number: string, phone: string) {
    await user.type(screen.getByLabelText(/ariza raqami/i), number);
    await user.type(screen.getByLabelText(/telefon/i), phone);
    await user.click(screen.getByRole('button', { name: /tekshirish/i }));
  }

  it('never calls the API and shows a validation message with an empty field', async () => {
    renderVerify();
    const user = userEvent.setup();
    await openApplicationTab(user);

    await user.type(screen.getByLabelText(/ariza raqami/i), 'AR-2026-004518');
    await user.click(screen.getByRole('button', { name: /tekshirish/i }));

    expect(await screen.findByText(/telefon raqamini kiriting/i)).toBeInTheDocument();
    expect(checkApplication).not.toHaveBeenCalled();
  });

  it('shows the next step for an application awaiting payment', async () => {
    (checkApplication as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      kind: 'success',
      data: {
        found: true,
        number: 'AR-2026-004518',
        status: 'awaiting_payment',
        status_label: { uz_latn: 'Toʻlov kutilmoqda' },
        activity_type: 'Chorva',
        organization: 'Burchmulla',
        next_step: 'Toʻlovni amalga oshiring',
        submitted_at: '2026-08-28',
      },
    });
    renderVerify();
    const user = userEvent.setup();
    await openApplicationTab(user);

    await searchApplication(user, 'AR-2026-004518', '+998901234567');

    expect(checkApplication).toHaveBeenCalledWith('AR-2026-004518', '+998901234567');
    expect(await screen.findByText(/Toʻlov kutilmoqda/)).toBeInTheDocument();
    expect(screen.getByText(/Toʻlovni amalga oshiring/)).toBeInTheDocument();
  });

  /**
   * A wrong number+phone pair must render identically to a genuinely unknown
   * number — this is the whole point of ruling that `{found: false}` is one
   * shape for both. The UI must not add anything (a different message, a
   * hint) that would let a caller tell the two apart.
   */
  it('shows the generic miss alert for both an unknown number and a mismatched phone', async () => {
    (checkApplication as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      kind: 'success',
      data: { found: false, number: null, status: null, status_label: null, activity_type: null, organization: null, next_step: null, submitted_at: null },
    });
    renderVerify();
    const user = userEvent.setup();
    await openApplicationTab(user);

    await searchApplication(user, 'AR-2026-000000', '+998900000000');

    expect(await screen.findByText('Ariza topilmadi')).toBeInTheDocument();
  });

  it('renders an error alert, not a crash, when the check fails', async () => {
    (checkApplication as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      kind: 'network-error',
    });
    renderVerify();
    const user = userEvent.setup();
    await openApplicationTab(user);

    await searchApplication(user, 'AR-2026-004518', '+998901234567');

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('never invents field values the API left null', async () => {
    (checkApplication as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      kind: 'success',
      data: {
        found: true,
        number: 'AR-2026-004518',
        status: 'submitted',
        status_label: { uz_latn: 'Qabul qilindi' },
        activity_type: null,
        organization: null,
        next_step: null,
        submitted_at: null,
      },
    });
    renderVerify();
    const user = userEvent.setup();
    await openApplicationTab(user);

    await searchApplication(user, 'AR-2026-004518', '+998901234567');

    expect(await screen.findByText('Qabul qilindi')).toBeInTheDocument();
    // Two em dashes: activity_type and organization, both null. submitted_at
    // is a third field but shares the same fallback text.
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
    // `next_step` is an omitted row, not an em dash, when absent.
    expect(screen.queryByText('Keyingi qadam')).not.toBeInTheDocument();
  });
});
