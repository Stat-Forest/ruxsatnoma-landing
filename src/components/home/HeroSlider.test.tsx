import { act, fireEvent, render, screen } from '@testing-library/react';
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

function heading() {
  return screen.getByRole('heading', { level: 1 });
}

/** Advances past one slide interval (5.2s) without leaving React mid-render. */
async function tick(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
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

/**
 * The slide cross-fade and the dot indicators used to carry their transition
 * as an INLINE style, where `motion.css`'s `prefers-reduced-motion` block
 * cannot reach it — and `motion.test.ts` scans that stylesheet, so it could
 * not see the escape either. Both are classes now; this pins that they are
 * still applied, so the media block has something to bite on.
 */
it('carries its transitions as classes, not inline styles', () => {
  const { container } = renderSlider();
  expect(container.querySelectorAll('.hero-slide')).toHaveLength(3);
  expect(container.querySelectorAll('.hero-dot')).toHaveLength(3);
  for (const slide of container.querySelectorAll<HTMLElement>('.hero-slide')) {
    expect(slide.style.transition).toBe('');
  }
});

/**
 * WCAG 2.2.2 (level A): anything auto-updating for more than five seconds
 * needs a pause mechanism, and the footer claims WCAG 2.2 AA. This ran a
 * 5.2s interval nothing could stop.
 */
it('stops and resumes autoplay through the pause button', async () => {
  vi.useFakeTimers();
  renderSlider();

  // `fireEvent`, not `userEvent`: a real pointer would also enter the hero
  // and pause it by hover, which is the other mechanism, not this one.
  const pause = screen.getByRole('button', { name: /toʻxtatish/i });
  fireEvent.click(pause);
  expect(pause).toHaveAttribute('aria-pressed', 'true');

  await tick(20000);
  expect(heading()).toHaveTextContent(/Elektron Ruxsatnoma/i);

  fireEvent.click(screen.getByRole('button', { name: /davom ettirish/i }));
  await tick(5300);
  expect(heading()).toHaveTextContent(/bir daqiqada tekshiring/i);
});

it('pauses while the pointer rests on the hero and resumes when it leaves', async () => {
  vi.useFakeTimers();
  const { container } = renderSlider();
  const hero = container.querySelector('section');
  expect(hero).not.toBeNull();

  fireEvent.mouseEnter(hero!);
  await tick(20000);
  expect(heading()).toHaveTextContent(/Elektron Ruxsatnoma/i);

  fireEvent.mouseLeave(hero!);
  await tick(5300);
  expect(heading()).toHaveTextContent(/bir daqiqada tekshiring/i);
});

it('never starts the interval for a viewer who asked for reduced motion', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  vi.useFakeTimers();
  renderSlider();

  await tick(30000);
  expect(heading()).toHaveTextContent(/Elektron Ruxsatnoma/i);

  // Still fully navigable by hand — reduced motion is not reduced function.
  fireEvent.click(screen.getByRole('button', { name: /3-slayd/i }));
  expect(heading()).toHaveTextContent(/barchasi onlayn/i);
});

beforeEach(() => {
  window.localStorage.clear();
});
