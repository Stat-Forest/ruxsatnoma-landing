import React from 'react';
import { Phone, Mail, MapPin, Clock, Menu, X, Send, CirclePlay } from 'lucide-react';
import logoImg from '@/assets/img/ormonlogo.png';
import digitalCenterLogo from '@/assets/img/raqamlashtirishlogo.png';
import { Button } from '../ui/button';
import { useLanguage, useT } from '../../i18n/useT';
import { LanguageMenu } from './LanguageMenu';
import { AnnouncementBar } from './AnnouncementBar';
import type { SiteSettingsState } from '../../api/site';
import { pickLocalized } from '../../lib/localized';
import { CABINET_PATHS, goToCabinet } from '../../lib/cabinet';

export interface PublicLayoutProps {
  children?: React.ReactNode;
  onCheckPermit?: (permitNo: string) => void;
  onNavigate?: (page: string, params?: any) => void;
  activeNav?: string;
  /** Fetched ONCE by `routes.tsx`'s `Layout` and handed down — this
   *  component used to call `fetchSiteSettings()` itself, as did `HomePage`
   *  and `ContactPage`, so one page view made the request two or three
   *  times. Defaults to `loading`, which renders the same footer a failure
   *  does: no contacts, never a placeholder. */
  siteSettings?: SiteSettingsState;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  onNavigate,
  activeNav = 'home',
  siteSettings = { status: 'loading' },
}) => {
  const t = useT();
  const { language, setLanguage, uiLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeNav]);

  const [pill, setPill] = React.useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    ready: boolean;
  }>({ left: 0, top: 0, width: 0, height: 0, ready: false });

  const navRef = React.useRef<HTMLElement | null>(null);
  const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const updatePill = React.useCallback(() => {
    const currentKey = activeNav === 'news_item' ? 'news' : activeNav;
    const btn = buttonRefs.current.get(currentKey);
    if (btn && btn.offsetWidth > 0) {
      setPill({
        left: btn.offsetLeft,
        top: btn.offsetTop,
        width: btn.offsetWidth,
        height: btn.offsetHeight,
        ready: true,
      });
      return;
    }
    setPill((prev) => (prev.ready ? { ...prev, ready: false } : prev));
  }, [activeNav]);

  React.useLayoutEffect(() => {
    updatePill();
  }, [updatePill, uiLanguage]);

  React.useEffect(() => {
    updatePill();
    const nav = navRef.current;
    if (typeof ResizeObserver !== 'undefined' && nav) {
      const ro = new ResizeObserver(() => {
        updatePill();
      });
      ro.observe(nav);
      for (const btn of buttonRefs.current.values()) {
        ro.observe(btn);
      }
      return () => ro.disconnect();
    }
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [updatePill, activeNav]);

  const navLinks = [
    { id: 'home', labelKey: 'nav.home', page: 'home' },
    { id: 'services', labelKey: 'nav.services', page: 'services' },
    { id: 'news', labelKey: 'nav.news', page: 'news' },
    { id: 'documents', labelKey: 'nav.documents', page: 'documents' },
    { id: 'about', labelKey: 'nav.about', page: 'about' },
    { id: 'contact', labelKey: 'nav.contact', page: 'contact' },
  ];

  // Anything but `ready` renders without contacts rather than break — the
  // footer shows no row at all for a value it does not have, never a
  // placeholder (decision: never invent a number or a contact).
  const contacts = siteSettings.status === 'ready' ? siteSettings.data.contacts : null;
  const address = contacts ? pickLocalized(contacts.address, uiLanguage) : '';
  const hours = contacts ? pickLocalized(contacts.hours, uiLanguage) : '';

  return (
    <div className={`min-h-screen flex flex-col font-sans text-[#1A1F24] overflow-x-clip ${
      activeNav === 'home' ? 'bg-[#D8ECDE]' : activeNav === 'services' || activeNav === 'news' || activeNav === 'news_item' || activeNav === 'documents' || activeNav === 'about' || activeNav === 'contact' ? 'bg-[#EFF7F2]' : 'bg-white'
    }`}>
      {/* ── Top Header ─────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        activeNav === 'home'
          ? 'bg-[#17331B]/90 border-b border-white/15 text-white shadow-lg'
          : 'bg-[#17331B] border-b border-white/15 text-white shadow-md'
      }`}>
        {/* The 38px announcement strip (`design-canvas/Main.dc.html`) — editorial
            copy from i18n, live phone number from the site-settings endpoint. */}
        <AnnouncementBar phone={contacts?.phone} onNavigate={onNavigate} />

        {/* `xl:grid` with three columns is what stops the nav from sliding when
            the language changes: under plain `justify-between` its position followed
            the logo, and the Russian tagline makes the logo 71px wider than the
            Uzbek one. Below `xl` the tagline is hidden, so every language leaves
            the logo the same width and flex is enough there — and grid at that
            size squeezes the logo onto two lines instead. */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[72px] py-2 flex items-center justify-between gap-2 sm:gap-4 xl:grid xl:grid-cols-[auto_1fr_auto]">
          {/* Logo */}
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-3 text-left focus:outline-none shrink-0 group py-1"
          >
            <img
              src={logoImg}
              alt="Logo"
              className="w-12 h-12 object-contain shrink-0 drop-shadow-sm transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col justify-center items-center text-center max-w-[280px] md:max-w-[350px] lg:max-w-[450px] xl:max-w-[650px]">
              <span className="text-[8px] xl:text-[9px] text-white font-bold uppercase leading-tight mt-0.5">
                {t('brand.agency')}
              </span>
              <span className="text-[9px] xl:text-[10px] text-[#A7F3D0] font-extrabold uppercase tracking-wide leading-tight mt-0.5">
                {t('brand.portal')}
              </span>
            </div>
          </button>

          {/* Navigation Links with Smooth Sliding Indicator */}
          <nav
            ref={navRef}
            className="relative hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 px-2"
          >
            {/* Smooth Sliding Pill Indicator */}
            {pill.ready && (
              <span
                aria-hidden="true"
                className="nav-sliding-pill absolute rounded-xl bg-[#237443] border border-white/30 shadow-sm pointer-events-none"
                style={{
                  left: `${pill.left}px`,
                  top: `${pill.top}px`,
                  width: `${pill.width}px`,
                  height: `${pill.height}px`,
                  opacity: pill.ready ? 1 : 0,
                }}
              />
            )}

            {navLinks.map((link) => {
              const isActive = activeNav === link.id || (link.id === 'news' && activeNav === 'news_item');
              return (
                <button
                  key={link.id}
                  ref={(el) => {
                    if (el) buttonRefs.current.set(link.id, el);
                    else buttonRefs.current.delete(link.id);
                  }}
                  onClick={() => onNavigate?.(link.page)}
                  className={`relative z-10 px-2.5 xl:px-3.5 py-2 rounded-xl text-[13px] xl:text-sm font-semibold whitespace-nowrap transition-colors duration-300 cursor-pointer ${
                    isActive
                      ? `text-white ${!pill.ready ? 'bg-[#237443] border border-white/30 shadow-sm' : ''}`
                      : 'text-gray-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t(link.labelKey)}
                </button>
              );
            })}
          </nav>

          {/* Language Switcher & Auth Buttons */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0 justify-self-end">
            <LanguageMenu value={language} label={t('action.language')} onSelect={setLanguage} />

            {/* Wrapped rather than given `hidden` directly: `Button`'s own base
                class list carries `inline-flex`, and two display utilities in
                the same layer do not reliably override one another. `Kabinet`
                is a plain link into the adminka (decision: no session check on
                this site). It appears wherever the desktop nav does — it was
                inherited at `2xl` from the old `Kirish` button, which shared a
                destination with the CTA beside it and so cost nothing when
                hidden; this one is the entry to the cabinet Odilxon asked for,
                and a button nobody can see is the same as a button nobody
                asked for. Below `lg` the mobile menu carries its own copy. */}
            <div className="hidden lg:block">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToCabinet(CABINET_PATHS.login)}
                className="!h-9 bg-transparent border-[#E4E7EA] text-white hover:bg-white/20 rounded-xl px-4 text-xs font-bold"
              >
                {t('action.cabinet')}
              </Button>
            </div>
            {/* The wizard, not `auth_login`: the button says «Ariza
                topshirish», and `/login` sent a signed-in citizen to the
                dashboard instead of the application (the front door itself
                is the «Kabinet» button beside it). The adminka decides on
                arrival whether a sign-in comes first — `src/lib/cabinet.ts`. */}
            <Button
              variant="success"
              size="sm"
              onClick={() => onNavigate?.('applicant_wizard')}
              className="!h-9 bg-[#2E7D4F] hover:bg-[#23653F] text-white shadow-md font-bold rounded-xl px-3 sm:px-4 text-xs shrink-0"
            >
              {t('action.submitApplication')}
            </Button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E7EA] bg-transparent text-white hover:bg-white/20 transition-colors shrink-0"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div data-testid="mobile-menu" className="lg:hidden border-t border-white/15 bg-[#17331B] px-4 pt-3 pb-5 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="pb-3 mb-1 border-b border-white/15 flex items-center gap-3">
              <img
                src={logoImg}
                alt="Logo"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div className="flex flex-col text-left">

                <span className="text-[10px] text-white font-bold uppercase leading-tight mt-0.5">
                  {t('brand.agency')}
                </span>
                <span className="text-[10.5px] text-[#A7F3D0] font-extrabold uppercase tracking-wide leading-tight mt-0.5">
                  {t('brand.portal')}
                </span>
              </div>
            </div>
            {navLinks.map((link) => {
              const isActive = activeNav === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate?.(link.page);
                  }}
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                    isActive
                      ? 'text-white bg-[#237443] border border-white/30 shadow-sm'
                      : 'text-gray-200 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {t(link.labelKey)}
                </button>
              );
            })}
            <div className="pt-2 border-t border-white/15 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  goToCabinet(CABINET_PATHS.login);
                }}
                className="w-full !h-9 bg-transparent border-[#E4E7EA] text-white hover:bg-white/20 rounded-xl text-xs font-bold justify-center"
              >
                {t('action.cabinet')}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* The home hero lives in `HomePage`'s own `HeroSlider` since the stage 8
          redesign — three slides, its own atmosphere layer and its own copy.
          The layout no longer renders one, or the home page would carry two. */}

      {/* ── Main Content Slot ───────────────────────────────────── */}
      {children && <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">{children}</main>}

      {/* ── Footer ──────────────────────────────────────────────── */}
      {/* Ported from `design-canvas/Main.dc.html`'s footer. The three links
          that matched nothing in the route table (`gis_editor`,
          `normative_norms`, `prosecutor_portal` — decision #172) are gone,
          not repointed: the approved footer never carried them either. */}
      <footer id="public-footer" className="bg-[#123522] text-white pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <img
                src={logoImg}
                alt="Logo"
                className="w-12 h-12 object-contain shrink-0 mt-0.5 drop-shadow-sm"
              />
              <div className="flex flex-col text-left">

                <span className="font-bold text-[11px] text-white uppercase leading-snug mt-0.5">
                  {t('brand.agency')}
                </span>
                <span className="text-xs font-extrabold text-[#A7F3D0] uppercase tracking-wide mt-1">
                  {t('brand.portal')}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('footer.about')}
            </p>
            {(contacts?.social.telegram || contacts?.social.youtube) && (
              <div className="flex gap-2 pt-1">
                {contacts.social.telegram && (
                  <a
                    href={contacts.social.telegram}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Telegram"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#9CE3AE] transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                )}
                {contacts.social.youtube && (
                  <a
                    href={contacts.social.youtube}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="YouTube"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#9CE3AE] transition-colors"
                  >
                    <CirclePlay className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7FB98A] mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigate?.('applicant_wizard')} className="hover:text-white transition-colors text-left">
                  {t('footer.link.howToApply')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('verify')} className="hover:text-white transition-colors text-left">
                  {t('footer.link.verify')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('calculator')} className="hover:text-white transition-colors text-left">
                  {t('footer.link.calculator')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('map')} className="hover:text-white transition-colors text-left">
                  {t('footer.link.map')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('news')} className="hover:text-white transition-colors text-left">
                  {t('footer.link.news')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('appeal_check')} className="hover:text-white transition-colors text-left">
                  {t('footer.link.appealStatus')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7FB98A] mb-4">{t('footer.portal')}</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigate?.('about')} className="hover:text-white transition-colors text-left">
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('contact')} className="hover:text-white transition-colors text-left">
                  {t('nav.contact')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('documents')} className="hover:text-white transition-colors text-left">
                  {t('footer.link.documents')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('faq')} className="hover:text-white transition-colors text-left">
                  {t('footer.link.faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 — live contacts (`fetchSiteSettings`); renders nothing per
              row rather than a placeholder number when a value is missing. */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7FB98A] mb-4">{t('footer.contacts')}</h4>
            <ul className="space-y-3">
              {address && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0e3b26] flex items-center justify-center shrink-0 text-[#2ED177]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-gray-200 leading-snug pt-1">{address}</span>
                </li>
              )}
              {contacts?.phone && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0e3b26] flex items-center justify-center shrink-0 text-[#2ED177]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <a
                    href={`tel:${contacts.phone.replace(/[^\d+]/g, '')}`}
                    className="text-xs text-gray-200 hover:text-white transition-colors"
                  >
                    {contacts.phone}
                  </a>
                </li>
              )}
              {contacts?.email && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0e3b26] flex items-center justify-center shrink-0 text-[#2ED177]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <a href={`mailto:${contacts.email}`} className="text-xs text-gray-200 hover:text-white transition-colors">
                    {contacts.email}
                  </a>
                </li>
              )}
              {hours && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0e3b26] flex items-center justify-center shrink-0 text-[#2ED177]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-gray-200">{hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div>{t('footer.copyright')}</div>
            <div className="text-[11px] text-gray-400/80">{t('footer.wcag')}</div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl transition-colors shadow-sm">
            <img
              src={digitalCenterLogo}
              alt="Oʻrmon xoʻjaligini raqamlashtirish markazi"
              className="w-8 h-8 object-contain shrink-0 drop-shadow"
            />
            <span className="text-[12px] text-gray-200 font-medium">
              {t('footer.developedBy')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
