import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GrowingTreeAnim } from './GrowingTreeAnim';

describe('GrowingTreeAnim', () => {
  it('renders SVG with accessible label and viewBox', () => {
    render(<GrowingTreeAnim />);
    const svg = screen.getByRole('img', { name: /o‘sayotgan daraxt animatsiyasi/i });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 600 600');
  });

  it('contains sun layer with radial gradients by default', () => {
    const { container } = render(<GrowingTreeAnim />);
    expect(container.querySelector('#sun-layer')).toBeInTheDocument();
    expect(container.querySelector('radialGradient[id^="gt-sun-"]')).toBeInTheDocument();
  });

  it('contains trunk, branches, canopy and continuously falling leaves', () => {
    const { container } = render(<GrowingTreeAnim />);
    expect(container.querySelector('#trunk-layer')).toBeInTheDocument();
    expect(container.querySelector('#branches-layer')).toBeInTheDocument();
    expect(container.querySelector('#canopy-layer')).toBeInTheDocument();
    expect(container.querySelector('#falling-leaves-layer')).toBeInTheDocument();

    const falling1 = container.querySelector('.gta-falling-leaf-1');
    const falling2 = container.querySelector('.gta-falling-leaf-2');
    const falling3 = container.querySelector('.gta-falling-leaf-3');
    expect(falling1).toBeInTheDocument();
    expect(falling2).toBeInTheDocument();
    expect(falling3).toBeInTheDocument();
  });

  it('allows disabling sun and falling leaves via props', () => {
    const { container } = render(<GrowingTreeAnim showSun={false} showFallingLeaves={false} />);
    expect(container.querySelector('#sun-layer')).toBeNull();
    expect(container.querySelector('#falling-leaves-layer')).toBeNull();
  });

  it('includes reduced-motion CSS rules for WCAG compliance', () => {
    const { container } = render(<GrowingTreeAnim />);
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeInTheDocument();
    expect(styleTag?.textContent).toContain('prefers-reduced-motion: reduce');
  });
});
