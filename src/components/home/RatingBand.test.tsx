import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { RatingBand, type RatingBandState } from './RatingBand';
import { I18nProvider } from '../../i18n';

function renderBand(state: RatingBandState) {
  return render(
    <I18nProvider>
      <RatingBand state={state} />
    </I18nProvider>,
  );
}

it('shows a quiet placeholder while the summary is loading', () => {
  renderBand({ status: 'loading' });
  expect(screen.getByTestId('home-rating')).toBeInTheDocument();
});

it('says the ratings are unavailable rather than blank on a fetch failure', () => {
  renderBand({ status: 'error' });
  expect(screen.getByTestId('home-rating')).toHaveTextContent(/vaqtincha mavjud emas/i);
});

/**
 * The state that matters most (#174): below the k-anonymity threshold, the
 * band must say plainly there are not enough ratings — never print an
 * average computed over too few of them.
 */
it('says there are not enough ratings yet rather than printing an average', () => {
  renderBand({
    status: 'ready',
    summary: { published: false, average: null, count: 2, histogram: null, threshold: 5 },
  });
  expect(screen.getByTestId('home-rating')).toHaveTextContent(/yetarli baho/i);
  expect(screen.queryByText(/4[,.]\d/)).not.toBeInTheDocument();
});

it('draws the average, stars and histogram once published', () => {
  renderBand({
    status: 'ready',
    summary: {
      published: true,
      average: '4.2',
      count: 128,
      histogram: { '1': 1, '2': 2, '3': 5, '4': 20, '5': 100 },
      threshold: 5,
    },
  });
  expect(screen.getByText('4,2')).toBeInTheDocument();
  expect(screen.getByText(/128/)).toBeInTheDocument();
});

it('renders a dash rather than inventing an average when the field is somehow missing', () => {
  renderBand({
    status: 'ready',
    summary: { published: true, average: null, count: 10, histogram: { '5': 10 }, threshold: 5 },
  });
  expect(screen.getByText('—')).toBeInTheDocument();
});
