import { useMemo, type ReactNode } from 'react';
import { ArrowRight, Calculator, CheckCircle2 } from 'lucide-react';

export interface HeroCtaButtonConfig {
  text?: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  ariaLabel?: string;
}

export interface HeroContentProps {
  /**
   * Pill badge text. Defaults to 'OLTI YO\'NALISH, BITTA PORTAL'.
   */
  badgeText?: string;

  /**
   * First tone of headline (pure white).
   */
  whiteTitle?: string;

  /**
   * Second tone of headline (vibrant gradient green).
   */
  gradientTitle?: string;

  /**
   * Descriptive subtitle below the headline.
   */
  subtitle?: string;

  /**
   * Primary call-to-action button configuration.
   */
  primaryCta?: HeroCtaButtonConfig;

  /**
   * Secondary call-to-action button configuration.
   */
  secondaryCta?: HeroCtaButtonConfig;

  /**
   * Quick trust points displayed underneath the CTA buttons.
   */
  trustItems?: string[];

  /**
   * Generic navigation handler matching portal conventions.
   */
  onNavigate?: (action: string) => void;

  /**
   * Callback when the primary CTA is clicked.
   */
  onPrimaryClick?: () => void;

  /**
   * Callback when the secondary CTA is clicked.
   */
  onSecondaryClick?: () => void;

  /**
   * Optional additional container CSS classes.
   */
  className?: string;
}

const DEFAULT_BADGE = "OLTI YO'NALISH, BITTA PORTAL";
const DEFAULT_WHITE_TITLE = 'Chorvadan asalarichilikkacha —';
const DEFAULT_GRADIENT_TITLE = 'barchasi onlayn';
const DEFAULT_SUBTITLE =
  'Chorva boqish, pichan tayyorlash, asalarichilik, dam olish va turizm, quruq shox-shabba yigʻish hamda ilmiy tadqiqot uchun rasmiy ruxsatnomalar yagona portalda.';
const DEFAULT_PRIMARY_TEXT = 'Xizmatlarni koʻrish';
const DEFAULT_SECONDARY_TEXT = 'Narxni hisoblash';
const DEFAULT_TRUST_ITEMS = [
  'Tezkor avtomatik koʻrib chiqish',
  'QR-kodli rasmiy hujjat',
  '100% Onlayn va xavfsiz',
];

/**
 * HeroContent Component (Redesign)
 *
 * Features:
 * 1. Pill badge with 'OLTI YO'NALISH, BITTA PORTAL' and a glowing, pulsing dot indicator.
 * 2. Two-tone headline (crisp white + emerald-to-mint gradient green) with staggered word-by-word fade-in animation.
 * 3. Primary CTA button with icon slide micro-animation and sheen reflection sweep.
 * 4. Secondary CTA button with icon tilt/scale micro-animation.
 * 5. Respects WCAG 2.2 prefers-reduced-motion accessibility standards.
 */
export function HeroContent({
  badgeText = DEFAULT_BADGE,
  whiteTitle = DEFAULT_WHITE_TITLE,
  gradientTitle = DEFAULT_GRADIENT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  primaryCta,
  secondaryCta,
  trustItems = DEFAULT_TRUST_ITEMS,
  onNavigate,
  onPrimaryClick,
  onSecondaryClick,
  className = '',
}: HeroContentProps) {
  const whiteWords = useMemo(
    () => (whiteTitle ? whiteTitle.trim().split(/\s+/) : []),
    [whiteTitle],
  );

  const gradientWords = useMemo(
    () => (gradientTitle ? gradientTitle.trim().split(/\s+/) : []),
    [gradientTitle],
  );

  const handlePrimaryClick = () => {
    if (primaryCta?.onClick) {
      primaryCta.onClick();
    } else if (onPrimaryClick) {
      onPrimaryClick();
    } else if (onNavigate) {
      onNavigate('services');
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryCta?.onClick) {
      secondaryCta.onClick();
    } else if (onSecondaryClick) {
      onSecondaryClick();
    } else if (onNavigate) {
      onNavigate('calculator');
    }
  };

  const primaryLabel = primaryCta?.text || DEFAULT_PRIMARY_TEXT;
  const secondaryLabel = secondaryCta?.text || DEFAULT_SECONDARY_TEXT;

  return (
    <div className={`relative z-10 flex flex-col items-start max-w-2xl text-left ${className}`.trim()}>
      <style>{`
        @keyframes heroWordFadeIn {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.96);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .hero-word-fade {
          opacity: 0;
          animation: heroWordFadeIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hero-gradient-text {
          background: linear-gradient(135deg, #4ADE80 0%, #86EFAC 50%, #22C55E 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-word-fade {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>

      {/* Pill Badge with Pulsing Dot */}
      <div
        className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/45 border border-emerald-500/30 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.25)] hover:border-emerald-400/50 hover:bg-black/55 transition-all duration-300"
        role="status"
        aria-label={badgeText}
      >
        <span className="relative flex h-2 w-2 items-center justify-center" aria-hidden="true">
          <span className="live absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
        </span>
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300 select-none">
          {badgeText}
        </span>
      </div>

      {/* Headline with Two-tone Text & Word-by-Word Fade-In */}
      <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tight font-sans">
        {/* Tone 1: White Words */}
        {whiteWords.map((word, idx) => (
          <span key={`white-word-${idx}`}>
            <span
              className="hero-word-fade inline-block text-white"
              style={{ animationDelay: `${idx * 55}ms` }}
            >
              {word}
            </span>
            {idx < whiteWords.length - 1 ? ' ' : ' '}
          </span>
        ))}

        {/* Tone 2: Gradient Green Words */}
        {gradientWords.length > 0 && (
          <span className="block sm:inline sm:ml-1.5 mt-1 sm:mt-0">
            {gradientWords.map((word, idx) => {
              const delay = (whiteWords.length + idx) * 55;
              return (
                <span key={`gradient-word-${idx}`}>
                  <span
                    className="hero-word-fade hero-gradient-text inline-block font-black drop-shadow-[0_2px_12px_rgba(74,222,128,0.15)]"
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    {word}
                  </span>
                  {idx < gradientWords.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </span>
        )}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#DCE8DE] max-w-xl font-normal">
          {subtitle}
        </p>
      )}

      {/* Call To Action Buttons with Icon Micro-Animations */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        {/* Primary CTA Button */}
        {primaryCta?.href ? (
          <a
            href={primaryCta.href}
            aria-label={primaryCta.ariaLabel || primaryLabel}
            className="group relative inline-flex items-center justify-center gap-3 h-12 sm:h-13 px-6 sm:px-7 rounded-xl bg-gradient-to-r from-[#2E7D4F] to-[#23653F] hover:from-[#358e5a] hover:to-[#287347] text-white text-sm sm:text-base font-bold shadow-[0_12px_28px_rgba(46,125,79,0.38)] hover:shadow-[0_16px_36px_rgba(46,125,79,0.52)] transition-all duration-300 active:scale-[0.98] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            />
            <span className="relative z-10">{primaryLabel}</span>
            <span className="relative z-10 flex items-center justify-center transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:scale-105">
              {primaryCta.icon || <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200 transition-colors duration-200 group-hover:text-white" />}
            </span>
          </a>
        ) : (
          <button
            type="button"
            onClick={handlePrimaryClick}
            aria-label={primaryCta?.ariaLabel || primaryLabel}
            className="group relative inline-flex items-center justify-center gap-3 h-12 sm:h-13 px-6 sm:px-7 rounded-xl bg-gradient-to-r from-[#2E7D4F] to-[#23653F] hover:from-[#358e5a] hover:to-[#287347] text-white text-sm sm:text-base font-bold shadow-[0_12px_28px_rgba(46,125,79,0.38)] hover:shadow-[0_16px_36px_rgba(46,125,79,0.52)] transition-all duration-300 active:scale-[0.98] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            />
            <span className="relative z-10">{primaryLabel}</span>
            <span className="relative z-10 flex items-center justify-center transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:scale-105">
              {primaryCta?.icon || <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200 transition-colors duration-200 group-hover:text-white" />}
            </span>
          </button>
        )}

        {/* Secondary CTA Button */}
        {secondaryCta?.href ? (
          <a
            href={secondaryCta.href}
            aria-label={secondaryCta.ariaLabel || secondaryLabel}
            className="group relative inline-flex items-center justify-center gap-2.5 h-12 sm:h-13 px-6 sm:px-7 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/25 hover:border-emerald-400/50 text-white text-sm sm:text-base font-bold backdrop-blur-md shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="relative z-10 flex items-center justify-center transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-110">
              {secondaryCta.icon || <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 transition-colors duration-200 group-hover:text-emerald-300" />}
            </span>
            <span className="relative z-10">{secondaryLabel}</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={handleSecondaryClick}
            aria-label={secondaryCta?.ariaLabel || secondaryLabel}
            className="group relative inline-flex items-center justify-center gap-2.5 h-12 sm:h-13 px-6 sm:px-7 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/25 hover:border-emerald-400/50 text-white text-sm sm:text-base font-bold backdrop-blur-md shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="relative z-10 flex items-center justify-center transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-110">
              {secondaryCta?.icon || <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 transition-colors duration-200 group-hover:text-emerald-300" />}
            </span>
            <span className="relative z-10">{secondaryLabel}</span>
          </button>
        )}
      </div>

      {/* Trust Items Strip */}
      {trustItems && trustItems.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-y-2.5 gap-x-5">
          {trustItems.map((item) => (
            <div
              key={item}
              className="group/trust inline-flex items-center gap-2 text-xs font-semibold text-[#C7DCCB] transition-colors duration-200 hover:text-white"
            >
              <CheckCircle2 className="w-4 h-4 text-[#7FE0A0] transition-transform duration-300 ease-out group-hover/trust:scale-115 group-hover/trust:text-[#9CE3AE]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HeroContent;
