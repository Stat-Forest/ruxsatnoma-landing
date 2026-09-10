import React from 'react';
import { Trees, ArrowRight, Phone, Mail, MapPin, Clock, Menu, X, Send, CirclePlay } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage, useT } from '../../i18n/useT';
import { LanguageMenu } from './LanguageMenu';
import { AnnouncementBar } from './AnnouncementBar';
import { fetchSiteSettings } from '../../api/site';
import type { SiteSettings } from '../../api/site';
import { pickLocalized } from '../../lib/localized';
import { CABINET_PATHS, goToCabinet } from '../../lib/cabinet';
import landingBg from '../../assets/img/newbg.webp';

export interface PublicLayoutProps {
  children?: React.ReactNode;
  onCheckPermit?: (permitNo: string) => void;
  onNavigate?: (page: string, params?: any) => void;
  activeNav?: string;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  onNavigate,
  activeNav = 'home',
}) => {
  const t = useT();
  const { language, setLanguage, uiLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [siteSettings, setSiteSettings] = React.useState<SiteSettings | null>(null);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeNav]);

  // `null` on any failure (`fetchSiteSettings`'s own contract) — the footer
  // and announcement strip simply render without contacts rather than break.
  React.useEffect(() => {
    let cancelled = false;
    fetchSiteSettings().then((settings) => {
      if (!cancelled) setSiteSettings(settings);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const navLinks = [
    { id: 'home', labelKey: 'nav.home', page: 'home' },
    { id: 'services', labelKey: 'nav.services', page: 'services' },
    { id: 'news', labelKey: 'nav.news', page: 'news' },
    { id: 'documents', labelKey: 'nav.documents', page: 'documents' },
    { id: 'about', labelKey: 'nav.about', page: 'about' },
    { id: 'contact', labelKey: 'nav.contact', page: 'contact' },
  ];

  const contacts = siteSettings?.contacts;
  const address = contacts ? pickLocalized(contacts.address, uiLanguage) : '';
  const hours = contacts ? pickLocalized(contacts.hours, uiLanguage) : '';

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#1A1F24]">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 xl:grid xl:grid-cols-[auto_1fr_auto]">
          {/* Logo */}
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-3 text-left focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2E7D4F] text-white flex items-center justify-center font-bold shadow-md border border-white/20 shrink-0">
              <Trees className="w-5.5 h-5.5" />
            </div>
            <div className="hidden sm:block whitespace-nowrap">
              <span className="block text-base font-bold text-white leading-tight tracking-tight whitespace-nowrap">
                {t('brand.name')}
              </span>
              <span className="block lg:hidden xl:block text-[11px] text-gray-200 whitespace-nowrap">
                {t('brand.tagline')}
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center space-x-0.5 xl:space-x-1 px-2">
            {navLinks.map((link) => {
              const isActive = activeNav === link.id || (link.id === 'news' && activeNav === 'news_item');
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate?.(link.page)}
                  className={`px-2 xl:px-3 py-2 rounded-xl text-[13px] xl:text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-white bg-[#237443] border border-white/30 shadow-sm'
                      : 'text-gray-200 hover:bg-white/15 hover:text-white'
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
                this site) — dropping it below 2xl costs no reachable action,
                since the mobile menu carries its own copy. */}
            <div className="hidden 2xl:block">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToCabinet(CABINET_PATHS.login)}
                className="!h-9 bg-transparent border-[#E4E7EA] text-white hover:bg-white/20 rounded-xl px-4 text-xs font-bold"
              >
                {t('action.cabinet')}
              </Button>
            </div>
            <Button
              variant="success"
              size="sm"
              onClick={() => onNavigate?.('auth_login')}
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
          <div data-testid="mobile-menu" className="lg:hidden border-t border-white/15 bg-[#17331B] px-4 pt-3 pb-5 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
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

      {/* ── Hero Banner Section (Only on Home Page) ──────────────── */}
      {activeNav === 'home' && (
        <section className="relative overflow-hidden border-b border-[#E4E7EA] text-white min-h-[calc(100vh-4rem)] flex items-center py-12 sm:py-16">
          {/* Background image container - Cropped to remove top & bottom black letterbox bars */}
          <div
            className="absolute -inset-y-16 inset-x-0 z-0 bg-cover bg-center transform scale-115"
            style={{ backgroundImage: `url(${landingBg})` }}
          />
          {/* Soft left gradient for text contrast */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0A1C0E]/70 via-[#0A1C0E]/35 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            {/* 4xl, not 3xl: at 768px the Russian h1 wraps onto a fourth line while
                the Uzbek one keeps three, and the hero is vertically centred — so
                that single extra line moved the whole banner on every language
                switch. Russian fits in three lines from 832px on. */}
            <div className="max-w-4xl space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/40 backdrop-blur-md text-white font-semibold text-xs rounded-full border border-white/30 shadow-lg">
                <Trees className="w-4 h-4 text-[#7FB98A]" />
                {t('hero.badge')}
              </span>

              <h1 className="text-3xl sm:text-6xl font-extrabold text-white leading-tight [text-shadow:_0_3px_14px_rgba(0,0,0,0.85)] tracking-tight">
                {t('hero.title')} <span className="text-[#64D88C]">{t('hero.titleAccent')}</span>
              </h1>

              <p className="text-base sm:text-xl text-gray-100 leading-relaxed max-w-2xl font-medium [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]">
                {t('hero.subtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Button
                  variant="success"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => onNavigate?.('auth_login')}
                  className="shadow-2xl hover:scale-105 active:scale-95 transition-transform bg-[#2E7D4F] hover:bg-[#23653F] px-8 py-4 text-base sm:text-lg font-bold rounded-xl"
                >
                  {t('hero.cta.apply')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate?.('calculator')}
                  className="bg-black/40 border-white/40 text-white hover:bg-black/60 backdrop-blur-md shadow-xl transition-colors font-semibold rounded-xl px-7 py-4 text-base"
                >
                  {t('hero.cta.calculator')}
                </Button>
              </div>

              {/* Trust Badges */}
              {/* Widened for the same reason: at 2xl the three Russian labels wrap
                  onto a second row (45px -> 89px) and the centred hero moved by
                  half of that. */}
              <div className="flex flex-wrap items-center gap-6 pt-6 text-xs sm:text-sm text-gray-200 font-medium border-t border-white/20 max-w-4xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#64D88C] animate-pulse" />
                  <span>{t('hero.trust.fast')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#64D88C]" />
                  <span>{t('hero.trust.qr')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#64D88C]" />
                  <span>{t('hero.trust.online')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#2E7D4F] flex items-center justify-center">
                <Trees className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">{t('brand.name')}</span>
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

        <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <div>{t('footer.copyright')}</div>
          <div>{t('footer.wcag')}</div>
        </div>
      </footer>
    </div>
  );
};
