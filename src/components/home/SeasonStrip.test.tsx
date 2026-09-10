import { render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SeasonStrip } from './SeasonStrip';
import { I18nProvider } from '../../i18n';

const WINDOWS = {
  grazing: [4, 5, 6, 7, 8, 9, 10, 11],
  haymaking: [6, 7, 8],
  apiary: [4, 5, 6, 7, 8],
  recreation: [5, 6, 7, 8, 9, 10],
  deadwood: [1, 2, 3, 10, 11, 12],
  science: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

function renderStrip(windows: Record<string, number[]> = WINDOWS) {
  return render(
    <I18nProvider>
      <SeasonStrip windows={windows} />
    </I18nProvider>,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

it('marks the current month and labels each row open or closed', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-15'));
  renderStrip();

  const grazing = screen.getByTestId('season-row-grazing');
  expect(within(grazing).getByText(/ochiq/i)).toBeInTheDocument();
  const haymaking = screen.getByTestId('season-row-haymaking');
  expect(within(haymaking).getByText(/yopiq/i)).toBeInTheDocument();
  expect(screen.getByTestId('season-current-month')).toHaveTextContent(/sentabr/i);
});

it('always carries the provisional banner — the windows are not confirmed', () => {
  renderStrip();
  expect(screen.getByRole('note')).toHaveTextContent(/Agentlik tomonidan tasdiqlanadi/i);
});

it('renders every one of the six activities, even when a window is missing', () => {
  renderStrip({ grazing: [9] });
  for (const code of ['grazing', 'haymaking', 'apiary', 'recreation', 'deadwood', 'science']) {
    expect(screen.getByTestId(`season-row-${code}`)).toBeInTheDocument();
  }
});

/**
 * The defect this pins: `windows[code] ?? []` collapsed "the backend never
 * described this activity" into "closed all twelve months" — a citizen was
 * told an activity was shut when the truth was that nobody had said. An
 * absent key and an empty array are different answers.
 */
it('calls an activity the settings never mentioned unknown, not closed', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-15'));
  renderStrip({ grazing: [9], haymaking: [] });

  const missing = screen.getByTestId('season-row-apiary');
  expect(within(missing).getByText(/nomaʼlum/i)).toBeInTheDocument();
  expect(within(missing).queryByText(/yopiq/i)).not.toBeInTheDocument();

  // An empty array is a real answer, and that answer is "closed".
  const empty = screen.getByTestId('season-row-haymaking');
  expect(within(empty).getByText(/yopiq/i)).toBeInTheDocument();

  const open = screen.getByTestId('season-row-grazing');
  expect(within(open).getByText(/ochiq/i)).toBeInTheDocument();
});
