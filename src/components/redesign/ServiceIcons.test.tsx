import { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  GrazingIcon,
  CowIcon,
  HaymakingIcon,
  ScytheIcon,
  BeekeepingIcon,
  BeeIcon,
  ApiaryIcon,
  RecreationIcon,
  TentIcon,
  TourismIcon,
  DeadwoodIcon,
  BranchIcon,
  ScientificIcon,
  ScienceIcon,
  ResearchIcon,
  MagnifyingGlassLeafIcon,
  ServiceIcon,
} from './ServiceIcons';

describe('ServiceIcons', () => {
  const icons = [
    { name: 'GrazingIcon / CowIcon', Component: GrazingIcon, Alias: CowIcon, code: 'grazing' },
    { name: 'HaymakingIcon / ScytheIcon', Component: HaymakingIcon, Alias: ScytheIcon, code: 'haymaking' },
    { name: 'BeekeepingIcon / BeeIcon', Component: BeekeepingIcon, Alias: BeeIcon, code: 'beekeeping' },
    { name: 'RecreationIcon / TentIcon', Component: RecreationIcon, Alias: TentIcon, code: 'recreation' },
    { name: 'DeadwoodIcon / BranchIcon', Component: DeadwoodIcon, Alias: BranchIcon, code: 'deadwood' },
    { name: 'ScientificIcon / MagnifyingGlassLeafIcon', Component: ScientificIcon, Alias: MagnifyingGlassLeafIcon, code: 'scientific' },
  ];

  it('renders each of the 6 distinct line-style icons with 24x24 viewBox', () => {
    for (const { Component, Alias } of icons) {
      const { container: c1, unmount: u1 } = render(<Component />);
      const svg1 = c1.querySelector('svg');
      expect(svg1).toBeInTheDocument();
      expect(svg1).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg1).toHaveAttribute('fill', 'none');
      expect(svg1).toHaveAttribute('stroke', 'currentColor');
      expect(svg1).toHaveAttribute('stroke-width', '2');
      expect(svg1).toHaveAttribute('stroke-linecap', 'round');
      expect(svg1).toHaveAttribute('stroke-linejoin', 'round');
      expect(svg1).toHaveAttribute('aria-hidden', 'true');
      u1();

      // Verify alias
      const { container: c2, unmount: u2 } = render(<Alias />);
      const svg2 = c2.querySelector('svg');
      expect(svg2).toBeInTheDocument();
      u2();
    }
  });

  it('supports custom size, color, strokeWidth, and className props', () => {
    const { container } = render(
      <CowIcon size={32} color="#10B981" strokeWidth={1.5} className="custom-cow" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
    expect(svg).toHaveAttribute('stroke', '#10B981');
    expect(svg).toHaveAttribute('stroke-width', '1.5');
    expect(svg).toHaveClass('custom-cow');
  });

  it('forwards refs correctly', () => {
    const ref = createRef<SVGSVGElement>();
    render(<BranchIcon ref={ref} />);
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });

  it('renders through the ServiceIcon dispatcher component', () => {
    const codes = ['grazing', 'haymaking', 'beekeeping', 'apiary', 'recreation', 'tourism', 'deadwood', 'science', 'scientific'];
    for (const code of codes) {
      const { container, unmount } = render(<ServiceIcon code={code} className={`icon-${code}`} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass(`icon-${code}`);
      unmount();
    }
  });

  it('provides all requested aliases', () => {
    expect(CowIcon).toBe(GrazingIcon);
    expect(ScytheIcon).toBe(HaymakingIcon);
    expect(BeeIcon).toBe(BeekeepingIcon);
    expect(ApiaryIcon).toBe(BeekeepingIcon);
    expect(TentIcon).toBe(RecreationIcon);
    expect(TourismIcon).toBe(RecreationIcon);
    expect(BranchIcon).toBe(DeadwoodIcon);
    expect(ScienceIcon).toBe(ScientificIcon);
    expect(ResearchIcon).toBe(ScientificIcon);
    expect(MagnifyingGlassLeafIcon).toBe(ScientificIcon);
  });
});
