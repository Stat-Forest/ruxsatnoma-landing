import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ServicesGrid } from './ServicesGrid';

describe('ServicesGrid', () => {
  it('renders exactly 6 permit category cards by default', () => {
    render(<ServicesGrid />);

    const articles = screen.getAllByTestId(/^service-card-/);
    expect(articles).toHaveLength(6);

    // Verify canonical permit category titles
    expect(screen.getByText('Chorva mollarini boqish')).toBeInTheDocument();
    expect(screen.getByText('Pichan tayyorlash')).toBeInTheDocument();
    expect(screen.getByText('Asalarichilik')).toBeInTheDocument();
    expect(screen.getByText('Dam olish va turizm')).toBeInTheDocument();
    expect(screen.getByText('Quruq shox-shabba yigʻish')).toBeInTheDocument();
    expect(screen.getByText('Ilmiy-tadqiqot ishlari')).toBeInTheDocument();
  });

  it('applies the soft green background (#EFF7F2) to each card', () => {
    render(<ServicesGrid />);

    const articles = screen.getAllByTestId(/^service-card-/);
    for (const card of articles) {
      // Background color should be #EFF7F2 (rgb(239, 247, 242))
      expect(card).toHaveStyle({ backgroundColor: '#EFF7F2' });
    }
  });

  it('applies staggered animation delays to the cards', () => {
    render(<ServicesGrid />);

    const articles = screen.getAllByTestId(/^service-card-/);
    articles.forEach((card, index) => {
      const expectedDelay = `${index * 80}ms`;
      expect(card).toHaveStyle({ animationDelay: expectedDelay });
    });
  });

  it('includes hover translateY and green-tinted shadow styles in scoped stylesheet', () => {
    const { container } = render(<ServicesGrid />);
    const styleEl = container.querySelector('style');
    expect(styleEl).not.toBeNull();
    const cssText = styleEl?.textContent ?? '';

    // Verify hover lift of translateY(-6px)
    expect(cssText).toContain('translateY(-6px)');

    // Verify green-tinted shadow
    expect(cssText).toContain('rgba(46, 125, 79, 0.22)');

    // Verify prefers-reduced-motion coverage
    expect(cssText).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssText).toContain('animation: none !important');
  });

  it('triggers onSelectCategory and onNavigate when a card is clicked', () => {
    const onSelectCategory = vi.fn();
    const onNavigate = vi.fn();

    render(
      <ServicesGrid
        onSelectCategory={onSelectCategory}
        onNavigate={onNavigate}
      />
    );

    const grazingCard = screen.getByTestId('service-card-grazing');
    fireEvent.click(grazingCard);

    expect(onSelectCategory).toHaveBeenCalledTimes(1);
    expect(onSelectCategory).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'grazing', code: 'grazing' })
    );

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith('applicant_wizard', { activity: 'grazing' });
  });

  it('triggers selection when pressing Enter or Space key', () => {
    const onSelectCategory = vi.fn();

    render(<ServicesGrid onSelectCategory={onSelectCategory} />);

    const card = screen.getByTestId('service-card-haymaking');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onSelectCategory).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: ' ' });
    expect(onSelectCategory).toHaveBeenCalledTimes(2);
  });

  it('renders custom title, subtitle, and badge if provided', () => {
    render(
      <ServicesGrid
        badge="Maxsus Boʻlim"
        title="Custom Title Here"
        subtitle="Custom Subtitle Here"
      />
    );

    expect(screen.getByText('Maxsus Boʻlim')).toBeInTheDocument();
    expect(screen.getByText('Custom Title Here')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle Here')).toBeInTheDocument();
  });
});
