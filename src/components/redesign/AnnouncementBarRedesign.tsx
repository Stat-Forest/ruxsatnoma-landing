import React, { useState, useContext } from 'react';
import { ArrowRight, Phone, X } from 'lucide-react';
import { I18nContext } from '../../i18n/context';

export interface AnnouncementBarRedesignProps {
  /**
   * Main announcement message text or custom React node.
   * If omitted, falls back to i18n ('announcement.text') or default copy.
   */
  text?: React.ReactNode;

  /**
   * Call to action label.
   * Defaults to 'Batafsil' (or localized equivalent).
   */
  ctaText?: string;

  /**
   * CTA link href. If omitted, onCtaClick or onNavigate is triggered.
   */
  ctaHref?: string;

  /**
   * Target destination name for internal router navigation (e.g. 'news').
   */
  ctaPage?: string;

  /**
   * CTA click handler.
   */
  onCtaClick?: (e: React.MouseEvent) => void;

  /**
   * Internal page navigation callback.
   */
  onNavigate?: (page: string) => void;

  /**
   * Optional live status dot badge label (e.g., "YANGILIK", "E'LON", "JONLI").
   */
  badgeText?: string;

  /**
   * Whether to display the live status dot with soft pulse.
   * Defaults to true.
   */
  showLiveDot?: boolean;

  /**
   * Optional contact phone number displayed on desktop screens.
   */
  phone?: string | null;

  /**
   * Optional secondary action label (e.g., 'Murojaat holati').
   */
  secondaryActionText?: string;

  /**
   * Optional secondary action handler.
   */
  onSecondaryActionClick?: () => void;

  /**
   * Allows the announcement bar to be closed/dismissed by the user.
   * Defaults to false.
   */
  dismissible?: boolean;

  /**
   * Callback invoked when the user dismisses the announcement bar.
   */
  onDismiss?: () => void;

  /**
   * Additional Tailwind or CSS class names.
   */
  className?: string;

  /**
   * Custom inline styles.
   */
  style?: React.CSSProperties;
}

/**
 * AnnouncementBarRedesign
 *
 * Modern glassmorphic announcement bar designed for the portal redesign.
 * Features:
 * - Live-status dot with soft pulsing animation
 * - Clean high-contrast typography
 * - 'Batafsil' link where the arrow icon smoothly slides right on hover
 * - Full responsive layout for mobile and desktop
 * - Optional phone contact and secondary actions
 * - Graceful fallback with or without I18nProvider context
 */
export const AnnouncementBarRedesign: React.FC<AnnouncementBarRedesignProps> = ({
  text,
  ctaText,
  ctaHref,
  ctaPage = 'news',
  onCtaClick,
  onNavigate,
  badgeText,
  showLiveDot = true,
  phone,
  secondaryActionText,
  onSecondaryActionClick,
  dismissible = false,
  onDismiss,
  className = '',
  style,
}) => {
  const i18n = useContext(I18nContext);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const defaultText = i18n?.t
    ? i18n.t('announcement.text')
    : 'Oʻrmon fondi yerlaridan foydalanish uchun arizalar onlayn qabul qilinadi';

  const defaultCta = ctaText ?? (i18n?.t ? i18n.t('announcement.cta') : 'Batafsil');
  const defaultSecondary = secondaryActionText ?? (i18n?.t ? i18n.t('announcement.appealStatus') : 'Murojaat holati');

  const handleCtaClick = (e: React.MouseEvent) => {
    if (onCtaClick) {
      onCtaClick(e);
      return;
    }
    if (onNavigate && ctaPage) {
      e.preventDefault();
      onNavigate(ctaPage);
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondaryActionClick) {
      onSecondaryActionClick();
    } else if (onNavigate) {
      onNavigate('appeal_check');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <aside
      role="region"
      aria-label="E'lonlar paneli"
      className={`relative z-40 w-full min-h-[38px] sm:h-10 bg-gradient-to-r from-[#071F15] via-[#0D2D20] to-[#071F15] text-white border-b border-emerald-500/20 backdrop-blur-sm flex items-center transition-all ${className}`}
      style={{
        boxShadow: '0 1px 12px rgba(11, 45, 31, 0.4)',
        ...style,
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 w-full flex items-center justify-between gap-3 sm:gap-6 py-1.5 sm:py-0">
        {/* Left section: Live Dot + Badge + Announcement Text + 'Batafsil' CTA */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Live Status Indicator with soft pulse */}
          {showLiveDot && (
            <span
              className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0"
              title="Faol holat"
              aria-label="Jonli holat indikatori"
            >
              <span
                className="absolute inline-flex w-full h-full rounded-full bg-emerald-400/60 animate-pulse"
                aria-hidden="true"
              />
              <span
                className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                aria-hidden="true"
              />
            </span>
          )}

          {/* Optional Tag / Badge */}
          {badgeText && (
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
              {badgeText}
            </span>
          )}

          {/* Main Announcement Message */}
          <div className="text-[12px] sm:text-[13px] text-emerald-100/90 truncate font-medium leading-tight">
            {text ?? defaultText}
          </div>

          {/* 'Batafsil' Action Link with sliding arrow on hover */}
          <a
            href={ctaHref || '#'}
            onClick={handleCtaClick}
            className="group inline-flex items-center gap-1 sm:gap-1.5 text-[12px] sm:text-[13px] font-semibold text-emerald-300 hover:text-white transition-colors duration-200 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded-sm"
          >
            <span>{defaultCta}</span>
            <ArrowRight
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 group-hover:text-emerald-200 transition-transform duration-200 ease-out group-hover:translate-x-1 shrink-0"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* Right section: Contact phone, secondary link, dismiss */}
        <div className="hidden md:flex items-center gap-4 sm:gap-5 shrink-0 text-[12px] sm:text-[12.5px]">
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center gap-1.5 text-emerald-200/80 hover:text-white transition-colors duration-150"
            >
              <Phone className="w-3 h-3 text-emerald-400" aria-hidden="true" />
              <span>{phone}</span>
            </a>
          )}

          {(secondaryActionText || (!phone && defaultSecondary)) && (
            <button
              type="button"
              onClick={handleSecondaryClick}
              className="text-emerald-200/80 hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none"
            >
              {defaultSecondary}
            </button>
          )}

          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Yopish"
              className="p-1 -mr-1 text-emerald-300/70 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Mobile dismiss button if enabled */}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Yopish"
            className="md:hidden p-1 text-emerald-300/70 hover:text-white rounded shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default AnnouncementBarRedesign;
