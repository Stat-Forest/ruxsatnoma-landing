import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnnouncementBarRedesign } from './AnnouncementBarRedesign';

describe('AnnouncementBarRedesign', () => {
  it('renders default announcement text and Batafsil CTA', () => {
    render(<AnnouncementBarRedesign />);

    expect(
      screen.getByText('Oʻrmon fondi yerlaridan foydalanish uchun arizalar onlayn qabul qilinadi')
    ).toBeInTheDocument();
    expect(screen.getByText('Batafsil')).toBeInTheDocument();
  });

  it('renders custom text and custom CTA', () => {
    render(
      <AnnouncementBarRedesign
        text="Yangi qaror qabul qilindi"
        ctaText="Ko'rish"
      />
    );

    expect(screen.getByText('Yangi qaror qabul qilindi')).toBeInTheDocument();
    expect(screen.getByText("Ko'rish")).toBeInTheDocument();
  });

  it('renders live status dot with pulse indicator', () => {
    const { container } = render(<AnnouncementBarRedesign showLiveDot={true} />);

    const liveDot = screen.getByLabelText('Jonli holat indikatori');
    expect(liveDot).toBeInTheDocument();

    const pulsingElement = container.querySelector('.animate-pulse');
    expect(pulsingElement).toBeInTheDocument();
  });

  it('renders sliding arrow inside CTA link with hover group transition', () => {
    const { container } = render(<AnnouncementBarRedesign />);

    const ctaLink = screen.getByText('Batafsil').closest('a');
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink?.className).toContain('group');

    const arrowIcon = container.querySelector('svg.group-hover\\:translate-x-1');
    expect(arrowIcon).toBeInTheDocument();
  });

  it('calls onCtaClick when Batafsil link is clicked', () => {
    const handleCtaClick = vi.fn();
    render(<AnnouncementBarRedesign onCtaClick={handleCtaClick} />);

    const ctaLink = screen.getByText('Batafsil');
    fireEvent.click(ctaLink);

    expect(handleCtaClick).toHaveBeenCalledTimes(1);
  });

  it('calls onNavigate when ctaPage is configured without onCtaClick', () => {
    const handleNavigate = vi.fn();
    render(<AnnouncementBarRedesign onNavigate={handleNavigate} ctaPage="news" />);

    const ctaLink = screen.getByText('Batafsil');
    fireEvent.click(ctaLink);

    expect(handleNavigate).toHaveBeenCalledWith('news');
  });

  it('renders optional phone number and badge', () => {
    render(
      <AnnouncementBarRedesign
        phone="+998 71 123 45 67"
        badgeText="MUHIM"
      />
    );

    expect(screen.getByText('+998 71 123 45 67')).toBeInTheDocument();
    expect(screen.getByText('MUHIM')).toBeInTheDocument();
  });

  it('supports dismissible mode and closes on button click', () => {
    const handleDismiss = vi.fn();
    render(<AnnouncementBarRedesign dismissible onDismiss={handleDismiss} />);

    const closeBtn = screen.getAllByLabelText('Yopish')[0];
    fireEvent.click(closeBtn);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Batafsil')).not.toBeInTheDocument();
  });
});
