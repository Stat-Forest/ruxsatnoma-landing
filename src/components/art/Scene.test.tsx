import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Scene, SCENE_KINDS } from './Scene';

it('renders every catalogue activity', () => {
  for (const kind of SCENE_KINDS) {
    const { container, unmount } = render(<Scene kind={kind} height={178} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    unmount();
  }
});

it('keeps gradient ids unique per kind, so two scenes cannot share a fill', () => {
  render(
    <div>
      <Scene kind="grazing" height={100} />
      <Scene kind="apiary" height={100} />
    </div>,
  );
  const ids = Array.from(document.querySelectorAll('linearGradient')).map((n) => n.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it('is hidden from assistive technology — it carries no information', () => {
  const { container } = render(<Scene kind="deadwood" height={100} />);
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});
