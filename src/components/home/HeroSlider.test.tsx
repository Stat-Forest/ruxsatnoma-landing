import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HeroSlider } from './HeroSlider';
import { I18nProvider } from '../../i18n';

function renderSlider(onNavigate = vi.fn()) {
  return render(
    <I18nProvider>
      <HeroSlider onNavigate={onNavigate} />
    </I18nProvider>,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

it('advances by itself and can be driven by the dots', async () => {
  vi.useFakeTimers();
  renderSlider();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Elektron Ruxsatnoma/i);

  await act(async () => {
    vi.advanceTimersByTime(5300);
  });
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/bir daqiqada tekshiring/i);

  vi.useRealTimers();
  await userEvent.click(screen.getByRole('button', { name: /1-slayd/i }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Elektron Ruxsatnoma/i);
});

it('gives each dot a 44px hit area', () => {
  renderSlider();
  const dot = screen.getByRole('button', { name: /2-slayd/i });
  expect(dot).toHaveStyle({ height: '44px' });
});

it('stops the timer when it unmounts', () => {
  const clear = vi.spyOn(globalThis, 'clearInterval');
  const { unmount } = renderSlider();
  unmount();
  expect(clear).toHaveBeenCalled();
});

it('sends each slide’s primary and secondary action through onNavigate', async () => {
  const onNavigate = vi.fn();
  renderSlider(onNavigate);

  await userEvent.click(screen.getByRole('button', { name: /Ariza topshirish/i }));
  expect(onNavigate).toHaveBeenCalledWith('auth_login');

  await userEvent.click(screen.getByRole('button', { name: /Narxni hisoblash/i }));
  expect(onNavigate).toHaveBeenCalledWith('calculator');
});

it('advances to the third slide and back to the first through the dots', async () => {
  renderSlider();
  await userEvent.click(screen.getByRole('button', { name: /3-slayd/i }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/barchasi onlayn/i);

  await userEvent.click(screen.getByRole('button', { name: /1-slayd/i }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Elektron Ruxsatnoma/i);
});

it('keeps the atmosphere layer’s motion classes present for the reduced-motion contract', () => {
  const { container } = renderSlider();
  for (const cls of ['rays', 'drift-a', 'drift-b', 'flock']) {
    expect(container.querySelector(`.${cls}`)).not.toBeNull();
  }
});

beforeEach(() => {
  window.localStorage.clear();
});
