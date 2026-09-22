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

it('advances by itself', async () => {
  vi.useFakeTimers();
  renderSlider();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Elektron Ruxsatnoma/i);

  await act(async () => {
    vi.advanceTimersByTime(5300);
  });
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/bir daqiqada tekshiring/i);
});



it('stops the timer when it unmounts', () => {
  const clear = vi.spyOn(globalThis, 'clearInterval');
  const { unmount } = renderSlider();
  unmount();
  expect(clear).toHaveBeenCalled();
});

it('sends the primary action through onNavigate', async () => {
  const onNavigate = vi.fn();
  renderSlider(onNavigate);

  await userEvent.click(screen.getByRole('button'));
  expect(onNavigate).toHaveBeenCalledWith('appeal_check');
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
  for (const slide of container.querySelectorAll<HTMLElement>('.hero-slide')) {
    expect(slide.style.transition).toBe('');
  }
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
});

beforeEach(() => {
  window.localStorage.clear();
});
