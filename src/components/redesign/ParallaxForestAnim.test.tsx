import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ParallaxForestAnim } from './ParallaxForestAnim';

describe('ParallaxForestAnim (Option C)', () => {
  it('renders SVG with accessible label and viewBox', () => {
    render(<ParallaxForestAnim ariaLabel="Test Parallax Forest" />);
    const region = screen.getByRole('region', { name: /test parallax forest/i });
    expect(region).toBeInTheDocument();

    const svg = region.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 1440 680');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('contains multi-layer parallax forest elements (distant mountains, mid-ground forest, foreground trees)', () => {
    const { container } = render(<ParallaxForestAnim />);

    // Distant mountain gradient and paths
    expect(container.querySelector('linearGradient[id^="pfa-mount-far-"]')).toBeInTheDocument();
    expect(container.querySelector('linearGradient[id^="pfa-mount-mid-"]')).toBeInTheDocument();

    // Mid-ground forest gradient
    expect(container.querySelector('linearGradient[id^="pfa-mid-forest-"]')).toBeInTheDocument();

    // Foreground forest and bark gradients
    expect(container.querySelector('linearGradient[id^="pfa-front-forest-"]')).toBeInTheDocument();
    expect(container.querySelector('linearGradient[id^="pfa-bark-"]')).toBeInTheDocument();
  });

  it('renders floating particle leaves across scene depths', () => {
    const { container } = render(<ParallaxForestAnim leafCount={24} showLeaves={true} />);
    // Leaves render as path elements with fill="currentColor"
    const leaves = container.querySelectorAll('svg path[fill="currentColor"]');
    expect(leaves.length).toBeGreaterThan(0);
  });

  it('supports disabling optional atmospheric layers via props', () => {
    const { container } = render(
      <ParallaxForestAnim
        showLeaves={false}
        showMist={false}
        showSunRays={false}
        showFireflies={false}
      />
    );

    // Leaves should not be rendered
    const leaves = container.querySelectorAll('svg path[fill="currentColor"]');
    expect(leaves.length).toBe(0);
  });

  it('renders overlay children correctly', () => {
    render(
      <ParallaxForestAnim>
        <div data-testid="hero-content">Hero Heading</div>
      </ParallaxForestAnim>
    );

    expect(screen.getByTestId('hero-content')).toBeInTheDocument();
    expect(screen.getByText('Hero Heading')).toBeInTheDocument();
  });

  it('handles pointer interactions without throwing errors', () => {
    const { container } = render(<ParallaxForestAnim interactive={true} />);
    const region = container.firstChild as HTMLElement;

    expect(() => {
      fireEvent.pointerMove(region, { clientX: 200, clientY: 150 });
      fireEvent.pointerLeave(region);
    }).not.toThrow();
  });

  it('supports different visual color themes', () => {
    const { container: morningContainer } = render(<ParallaxForestAnim theme="morning" />);
    expect(morningContainer.querySelector('linearGradient[id^="pfa-sky-"]')).toBeInTheDocument();

    const { container: duskContainer } = render(<ParallaxForestAnim theme="dusk" />);
    expect(duskContainer.querySelector('linearGradient[id^="pfa-sky-"]')).toBeInTheDocument();

    const { container: nightContainer } = render(<ParallaxForestAnim theme="night" />);
    expect(nightContainer.querySelector('linearGradient[id^="pfa-sky-"]')).toBeInTheDocument();
  });
});
