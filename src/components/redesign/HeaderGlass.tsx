import React, { useState, useEffect, useRef, useContext } from 'react';
import { Globe, ChevronDown, Check, User, Send, Menu, X, ArrowUpRight } from 'lucide-react';
import logoImg from '@/assets/img/logo.png';
import { I18nContext, LANGUAGES, type Language } from '../../i18n/context';
import { CABINET_PATHS, goToCabinet } from '../../lib/cabinet';

export interface HeaderGlassNavItem {
  id: string;
  label: string;
  page?: string;
  href?: string;
  external?: boolean;
}

export interface HeaderGlassProps {
  /** Currently active navigation ID */
  activeNav?: string;
  /** Navigation click callback */
  onNavigate?: (page: string, params?: unknown) => void;
  /** Custom handler for 'Kabinet' button click */
  onCabinetClick?: () => void;
  /** Custom handler for 'Ariza topshirish' button click */
  onApplyClick?: () => void;
  /** Explicit language code override */
  language?: Language;
  /** Callback when language is selected */
  onLanguageChange?: (lang: Language) => void;
  /** Optional custom navigation items */
  navItems?: HeaderGlassNavItem[];
  /** Optional extra CSS class names */
  className?: string;
  /** Portal title text override */
  portalTitle?: string;
  /** Agency title text override */
  agencyTitle?: string;
}

const DEFAULT_NAV_ITEMS: HeaderGlassNavItem[] = [
  { id: 'home', label: 'Bosh sahifa', page: 'home' },
  { id: 'services', label: 'Xizmatlar', page: 'services' },
  { id: 'news', label: 'Yangiliklar', page: 'news' },
  { id: 'documents', label: 'Hujjatlar', page: 'documents' },
  { id: 'about', label: 'Portal haqida', page: 'about' },
  { id: 'contact', label: 'Aloqa', page: 'contact' },
];

/**
 * HeaderGlass
 *
 * Glassmorphic navigation header designed with semi-transparent dark green (#0F3D2E)
 * and backdrop-blur styling. Includes a language switcher, 'Kabinet' portal access button,
 * and 'Ariza topshirish' action button with a soft pulsing glow.
 */
export const HeaderGlass: React.FC<HeaderGlassProps> = ({
  activeNav = 'home',
  onNavigate,
  onCabinetClick,
  onApplyClick,
  language: propLanguage,
  onLanguageChange,
  navItems = DEFAULT_NAV_ITEMS,
  className = '',
  portalTitle,
  agencyTitle,
}) => {
  // Gracefully consume I18nContext if available, otherwise fall back to internal state
  const i18n = useContext(I18nContext);
  const [internalLanguage, setInternalLanguage] = useState<Language>('uz_latn');
  const activeLanguage = propLanguage ?? i18n?.language ?? internalLanguage;

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click or escape key
  useEffect(() => {
    if (!langMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangMenuOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!langMenuRef.current?.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [langMenuOpen]);

  // Handle language selection
  const handleSelectLanguage = (code: Language) => {
    setLangMenuOpen(false);
    if (onLanguageChange) {
      onLanguageChange(code);
    } else if (i18n?.setLanguage) {
      i18n.setLanguage(code);
    } else {
      setInternalLanguage(code);
    }
  };

  // Handle Cabinet click with fallback
  const handleCabinet = () => {
    if (onCabinetClick) {
      onCabinetClick();
      return;
    }
    try {
      goToCabinet(CABINET_PATHS.login);
    } catch {
      if (onNavigate) {
        onNavigate('cabinet');
      } else {
        window.location.href = '/login';
      }
    }
  };

  // Handle Application submission click
  const handleApply = () => {
    if (onApplyClick) {
      onApplyClick();
    } else if (onNavigate) {
      onNavigate('auth_login');
    } else {
      try {
        goToCabinet(CABINET_PATHS.wizard);
      } catch {
        window.location.href = '/my/applications/new';
      }
    }
  };

  // Resolve active language presentation
  const currentLangObj =
    LANGUAGES.find((lang) => lang.code === activeLanguage) ?? LANGUAGES[1];

  // Localized title strings
  const displayedAgency =
    agencyTitle ??
    (i18n?.t ? i18n.t('brand.agency') : 'O‘rmon va yashil hududlarni ko‘paytirish, cho‘llanishga qarshi kurashish agentligi');
  const displayedPortal =
    portalTitle ??
    (i18n?.t ? i18n.t('brand.portal') : 'Ruxsatnoma olish portali');

  return (
    <>
      <style>{`
        @keyframes softGlowPulse {
          0%, 100% {
            box-shadow: 0 0 14px rgba(16, 185, 129, 0.45), 0 0 28px rgba(16, 185, 129, 0.2);
          }
          50% {
            box-shadow: 0 0 24px rgba(52, 211, 153, 0.8), 0 0 42px rgba(16, 185, 129, 0.45);
          }
        }
        .animate-soft-glow-pulse {
          animation: softGlowPulse 2.6s ease-in-out infinite;
        }
      `}</style>

      <header
        role="banner"
        className={`sticky top-0 z-50 w-full bg-[#0F3D2E]/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/15 transition-colors duration-300 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* ── Brand / Logo ────────────────────────────────────────── */}
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="flex items-center gap-3 text-left focus:outline-none shrink-0 group py-1 cursor-pointer"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-emerald-400/20 blur-sm group-hover:bg-emerald-400/40 transition-colors" />
                <img
                  src={logoImg}
                  alt="Ruxsatnoma Logo"
                  className="relative w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left max-w-[260px] md:max-w-[340px] lg:max-w-[420px]">
                <span className="text-[9px] lg:text-[10px] text-white/90 font-bold uppercase tracking-tight leading-tight line-clamp-2">
                  {displayedAgency}
                </span>
                <span className="text-[10px] lg:text-[11px] text-emerald-300 font-extrabold uppercase tracking-wide leading-tight mt-0.5">
                  {displayedPortal}
                </span>
              </div>
            </button>

            {/* ── Desktop Navigation Links ──────────────────────────── */}
            <nav
              aria-label="Asosiy navigatsiya"
              className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 px-2"
            >
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.href) {
                        window.location.href = item.href;
                      } else if (item.page) {
                        onNavigate?.(item.page);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold shadow-inner border border-white/20'
                        : 'text-emerald-100/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* ── Actions: Language Switcher, Kabinet, Ariza CTA ────── */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Language Switcher */}
              <div ref={langMenuRef} className="relative">
                <button
                  type="button"
                  data-testid="header-glass-language-trigger"
                  aria-label={`Tilni tanlash: ${currentLangObj.title}`}
                  aria-haspopup="menu"
                  aria-expanded={langMenuOpen}
                  onClick={() => setLangMenuOpen((prev) => !prev)}
                  className={`flex h-9 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs font-semibold text-white transition-all backdrop-blur-sm cursor-pointer ${
                    langMenuOpen
                      ? 'border-white/40 bg-white/20 shadow-sm'
                      : 'border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/25'
                  }`}
                >
                  <Globe className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>{currentLangObj.label}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      langMenuOpen ? 'rotate-180 text-white' : 'text-emerald-200/80'
                    }`}
                  />
                </button>

                {langMenuOpen && (
                  <div
                    role="menu"
                    data-testid="header-glass-language-dropdown"
                    className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/15 bg-[#0F3D2E]/95 backdrop-blur-xl p-1 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-200/70 border-b border-white/10 mb-1">
                      Tilni tanlang
                    </div>
                    {LANGUAGES.map(({ code, label, title }) => {
                      const selected = code === activeLanguage;
                      return (
                        <button
                          key={code}
                          type="button"
                          role="menuitemradio"
                          aria-checked={selected}
                          onClick={() => handleSelectLanguage(code)}
                          className={`flex h-10 w-full items-center justify-between gap-2.5 rounded-xl px-3 text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                            selected
                              ? 'bg-emerald-600/40 text-white font-semibold border border-emerald-400/30'
                              : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 truncate">
                            <span
                              className={`w-6 shrink-0 text-xs font-bold ${
                                selected ? 'text-emerald-300' : 'text-emerald-200/60'
                              }`}
                            >
                              {label}
                            </span>
                            <span className="truncate">{title}</span>
                          </span>
                          {selected && (
                            <Check className="h-4 w-4 shrink-0 text-emerald-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Kabinet Button */}
              <button
                type="button"
                onClick={handleCabinet}
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 hover:border-white/35 backdrop-blur-sm text-white text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95"
              >
                <User className="h-3.5 w-3.5 text-emerald-300" />
                <span>Kabinet</span>
              </button>

              {/* Ariza topshirish Button with Soft Pulsing Glow */}
              <div className="relative inline-flex group">
                {/* Soft ambient pulsing halo */}
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 opacity-65 blur-md group-hover:opacity-95 transition-opacity duration-300 animate-pulse pointer-events-none" />

                {/* Main CTA Button */}
                <button
                  type="button"
                  onClick={handleApply}
                  className="relative inline-flex items-center gap-1.5 sm:gap-2 h-9 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-500 border border-emerald-300/40 shadow-lg animate-soft-glow-pulse active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white drop-shadow" />
                  <span className="whitespace-nowrap">Ariza topshirish</span>
                </button>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
                aria-expanded={mobileMenuOpen}
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/15 backdrop-blur-sm transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ───────────────────────────── */}
        {mobileMenuOpen && (
          <div
            data-testid="header-glass-mobile-menu"
            className="lg:hidden border-t border-white/10 bg-[#0F3D2E]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200"
          >
            {/* Mobile Branding Bar */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <img
                src={logoImg}
                alt="Logo"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white/90 font-bold uppercase leading-tight">
                  {displayedAgency}
                </span>
                <span className="text-[11px] text-emerald-300 font-extrabold uppercase tracking-wide mt-0.5">
                  {displayedPortal}
                </span>
              </div>
            </div>

            {/* Mobile Links */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (item.href) {
                        window.location.href = item.href;
                      } else if (item.page) {
                        onNavigate?.(item.page);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold border border-white/20'
                        : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.external && <ArrowUpRight className="h-4 w-4 text-emerald-300/80" />}
                  </button>
                );
              })}
            </div>

            {/* Mobile Kabinet Button */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCabinet();
                }}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                <User className="h-4 w-4 text-emerald-300" />
                <span>Kabinet</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default HeaderGlass;
