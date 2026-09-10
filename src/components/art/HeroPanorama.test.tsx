import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PermitSlideArt, ServicesSlideArt, VerifySlideArt } from './HeroPanorama';

const HERO_SLIDE_ART = [PermitSlideArt, VerifySlideArt, ServicesSlideArt];

it('draws one panorama per hero slide', () => {
  expect(HERO_SLIDE_ART).toHaveLength(3);
  for (const Art of HERO_SLIDE_ART) {
    const { container, unmount } = render(<Art />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    unmount();
  }
});

it('keeps gradient ids unique across the three slides, which all sit in the DOM at once', () => {
  render(
    <div>
      {HERO_SLIDE_ART.map((Art, i) => (
        // eslint-disable-next-line react/no-array-index-key -- fixed, never reordered
        <Art key={i} />
      ))}
    </div>,
  );
  const ids = Array.from(document.querySelectorAll('linearGradient, radialGradient')).map((n) => n.id);
  expect(ids.length).toBeGreaterThan(0);
  expect(new Set(ids).size).toBe(ids.length);
});

it('is decoration — hidden from assistive technology', () => {
  for (const Art of HERO_SLIDE_ART) {
    const { container, unmount } = render(<Art />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    unmount();
  }
});
