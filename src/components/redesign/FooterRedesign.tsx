import React, { useContext } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import logoImg from '../../assets/img/ormonlogo.png';
import digitalCenterLogo from '../../assets/img/raqamlashtirishlogo.png';
import { I18nContext } from '../../i18n/context';
import type { SiteSettingsState } from '../../api/site';
import { pickLocalized } from '../../lib/localized';

export interface FooterRedesignProps {
  /** Optional navigation callback used across the application. */
  onNavigate?: (page: string, params?: Record<string, unknown>) => void;
  /** Site settings containing dynamic contacts, phone, hours, and socials. */
  siteSettings?: SiteSettingsState;
  /** Optional container class name */
  className?: string;
  /** Whether to render the organic wave-shaped top border (defaults to true) */
  showWave?: boolean;
}

/** Fallback dictionary in case component is rendered outside of I18nProvider */
const FALLBACK_STRINGS: Record<string, string> = {
  'brand.agency': 'O‘rmon va yashil hududlarni ko‘paytirish, cho‘llanishga qarshi kurashish agentligi',
  'brand.portal': 'Ruxsatnoma olish portali',
  'footer.about':
    'Oʻzbekiston Respublikasi Oʻrmon va yashil hududlarni koʻpaytirish, choʻllanishga qarshi kurashish agentligining rasmiy ruxsatnomalar axborot tizimi.',
  'footer.services': 'Xizmatlar',
  'footer.portal': 'Portal',
  'footer.contacts': 'Aloqa va ma’lumot',
  'footer.link.howToApply': 'Ariza berish tartibi',
  'footer.link.verify': 'Ruxsatnoma tekshirish',
  'footer.link.calculator': 'Narx kalkulyatori',
  'footer.link.map': 'Boʻsh konturlar xaritasi',
  'footer.link.news': 'Yangiliklar va eʼlonlar',
  'footer.link.appealStatus': 'Murojaat holati',
  'footer.link.documents': 'Hujjatlar va meʼyorlar',
  'footer.link.faq': 'Koʻp beriladigan savollar',
  'footer.copyright': '© 2026 Oʻrmon va yashil hududlarni koʻpaytirish, choʻllanishga qarshi kurashish agentligi. Barcha huquqlar himoyalangan.',
  'footer.wcag': 'WCAG 2.2 AA Muvofiq dizayn-tizimi',
  'footer.developedBy': '“Oʻrmon xoʻjaligini raqamlashtirish markazi” tomonidan ishlab chiqilgan',
  'nav.about': 'Portal haqida',
  'nav.contact': 'Bogʻlanish',
};

export const FooterRedesign: React.FC<FooterRedesignProps> = ({
  onNavigate,
  siteSettings,
  className = '',
  showWave = true,
}) => {
  const i18n = useContext(I18nContext);

  const t = (key: string): string => {
    if (i18n?.t) {
      const translation = i18n.t(key);
      if (translation && translation !== key) return translation;
    }
    return FALLBACK_STRINGS[key] ?? key;
  };

  const uiLanguage = i18n?.uiLanguage ?? 'uz_latn';
  const contacts = siteSettings?.status === 'ready' ? siteSettings.data.contacts : null;
  const address = contacts ? pickLocalized(contacts.address, uiLanguage) : '';
  const hours = contacts ? pickLocalized(contacts.hours, uiLanguage) : '';

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Circular Social media configuration
  const socialItems = [
    {
      id: 'telegram',
      name: 'Telegram',
      href: contacts?.social?.telegram || 'https://t.me/urmon_agentligi',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
        </svg>
      ),
    },
    {
      id: 'youtube',
      name: 'YouTube',
      href: contacts?.social?.youtube || 'https://youtube.com/@urmon_agentligi',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      href: 'https://instagram.com/urmon_agentligi',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      href: 'https://facebook.com/urmon.agentligi',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      href: 'https://x.com/urmon_agentligi',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <footer
      id="public-footer-redesign"
      className={`relative w-full text-white font-sans ${className}`}
      role="contentinfo"
    >
      {/* ── 1. Organic Wave-Shaped Top Border ─────────────────────────────── */}
      {showWave && (
        <div className="w-full overflow-hidden leading-none select-none pointer-events-none -mb-[1px]">
          <svg
            className="w-full h-12 sm:h-16 md:h-20 lg:h-24 block"
            viewBox="0 0 1440 96"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Soft secondary organic wave contour for layered visual depth */}
            <path
              d="M0,38 C220,78 440,16 700,50 C960,84 1200,22 1440,42 L1440,96 L0,96 Z"
              fill="#144C38"
              opacity="0.45"
            />
            {/* Primary organic wave contour in deep green #0F3D2E */}
            <path
              d="M0,54 C260,18 520,84 780,44 C1040,12 1260,72 1440,48 L1440,96 L0,96 Z"
              fill="#0F3D2E"
            />
            {/* Subtle nature highlight crest line */}
            <path
              d="M0,54 C260,18 520,84 780,44 C1040,12 1260,72 1440,48"
              stroke="#2ED177"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
      )}

      {/* ── 2. Main Deep Green Body with Watermark Texture ────────────────── */}
      <div
        className="relative bg-[#0F3D2E] text-white pt-12 pb-8 overflow-hidden"
        style={{ backgroundColor: '#0F3D2E' }}
      >
        {/* Subtle Leaf-Pattern Watermark Texture (SVG) */}
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          {/* Repeating Botanical Leaf SVG Pattern */}
          <svg
            className="absolute inset-0 w-full h-full text-[#A7F3D0] opacity-[0.038]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="footer-leaf-pattern"
                width="120"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                {/* Curved delicate twig stem */}
                <path
                  d="M18,98 Q42,62 76,28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                {/* Stylized leaf pair 1 */}
                <path
                  d="M38,72 C28,66 33,53 50,58 C51,68 45,74 38,72 Z"
                  fill="currentColor"
                />
                <path
                  d="M48,62 C60,52 72,59 67,72 C57,74 50,69 48,62 Z"
                  fill="currentColor"
                />
                {/* Stylized leaf pair 2 */}
                <path
                  d="M58,47 C50,37 54,25 70,32 C71,42 65,49 58,47 Z"
                  fill="currentColor"
                />
                <path
                  d="M68,37 C78,27 90,35 86,47 C76,49 70,43 68,37 Z"
                  fill="currentColor"
                />
                {/* Terminal leaf */}
                <path
                  d="M76,28 C72,16 84,12 92,22 C90,32 82,32 76,28 Z"
                  fill="currentColor"
                />

                {/* Floating Elm / Oak silhouette leaf with central vein */}
                <path
                  d="M26,24 C16,34 16,49 31,54 C46,59 56,44 51,29 C46,14 36,14 26,24 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M26,24 Q36,39 46,44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M31,32 Q37,31 41,35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                />
                <path
                  d="M35,39 Q29,41 27,47"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                />

                {/* Small fluttering leaflets */}
                <path
                  d="M96,82 C91,77 93,69 101,72 C103,79 99,84 96,82 Z"
                  fill="currentColor"
                />
                <path
                  d="M103,92 C99,87 101,79 109,82 C111,89 107,94 103,92 Z"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footer-leaf-pattern)" />
          </svg>

          {/* Large Botanical Watermark Leaves (Top-Right Silhouettes) */}
          <svg
            className="absolute -top-10 -right-12 w-80 h-80 sm:w-96 sm:h-96 text-[#6EE7B7] opacity-[0.045]"
            viewBox="0 0 260 260"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M130,10 C160,10 230,50 250,110 C265,155 240,210 200,245 C160,280 110,270 70,240 C30,210 10,155 25,105 C45,45 100,10 130,10 Z M130,30 C105,60 95,120 95,230 C115,230 125,190 135,145 C145,100 150,50 130,30 Z" />
            <path
              d="M130,40 Q125,140 120,250"
              stroke="#0F3D2E"
              strokeWidth="5"
              fill="none"
            />
            <path
              d="M125,90 Q170,75 210,95"
              stroke="#0F3D2E"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M123,130 Q175,120 220,150"
              stroke="#0F3D2E"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M125,100 Q75,85 45,115"
              stroke="#0F3D2E"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M122,140 Q70,135 40,175"
              stroke="#0F3D2E"
              strokeWidth="4"
              fill="none"
            />
          </svg>

          {/* Large Botanical Watermark Silhouette (Bottom-Left) */}
          <svg
            className="absolute -bottom-12 -left-12 w-64 h-64 sm:w-80 sm:h-80 text-[#34D399] opacity-[0.035]"
            viewBox="0 0 200 200"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15,185 C45,155 75,95 135,55 C165,35 185,25 190,25 C185,45 165,80 135,115 C95,165 45,185 15,185 Z" />
            <path
              d="M15,185 Q85,115 190,25"
              stroke="#0F3D2E"
              strokeWidth="3.5"
              fill="none"
            />
          </svg>
        </div>

        {/* ── 3. Footer Content Columns ────────────────────────────────────── */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12">
            {/* Column 1: Brand, Description & Circular Social Icons (Col span 4) */}
            <div className="lg:col-span-4 space-y-5">
              {/* Logo & Agency Header */}
              <div className="flex items-start gap-3.5">
                <img
                  src={logoImg}
                  alt="O‘rmon xo‘jaligi agentligi ramzi"
                  className="w-13 h-13 object-contain shrink-0 mt-0.5 drop-shadow-md"
                />
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[11px] sm:text-xs text-white uppercase tracking-tight leading-snug">
                    {t('brand.agency')}
                  </span>
                  <span className="text-xs sm:text-[13px] font-extrabold text-[#A7F3D0] uppercase tracking-wide mt-1">
                    {t('brand.portal')}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-emerald-100/75 leading-relaxed pr-2">
                {t('footer.about')}
              </p>

              {/* Circular Social Icons */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7FB98A] mb-3">
                  Ijtimoiy tarmoqlar
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {socialItems.map((social) => (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.name}
                      title={social.name}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#2E7D4F] border border-white/15 hover:border-emerald-400/50 flex items-center justify-center text-white/90 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Verified Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2ED177]" />
                <span>Rasmiy davlat axborot portali</span>
              </div>
            </div>

            {/* Column 2: Services / Xizmatlar (Col span 3) */}
            <div className="lg:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7FB98A] mb-4 flex items-center gap-1.5">
                <span>{t('footer.services')}</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-emerald-100/80">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('applicant_wizard')}
                    className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                    <span>{t('footer.link.howToApply')}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('verify')}
                    className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                    <span>{t('footer.link.verify')}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('calculator')}
                    className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                    <span>{t('footer.link.calculator')}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('map')}
                    className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                    <span>{t('footer.link.map')}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('news')}
                    className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                    <span>{t('footer.link.news')}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('appeal_check')}
                    className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                    <span>{t('footer.link.appealStatus')}</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Portal & Documents (Col span 2) */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7FB98A] mb-4">
                {t('footer.portal')}
              </h4>
              <ul className="space-y-2.5 text-xs text-emerald-100/80">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('about')}
                    className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                    <span>{t('nav.about')}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('contact')}
                    className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                    <span>{t('nav.contact')}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('documents')}
                    className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                    <span>{t('footer.link.documents')}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('faq')}
                    className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 transition-colors" />
                    <span>{t('footer.link.faq')}</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Contacts & Working Hours (Col span 3) */}
            <div className="lg:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7FB98A] mb-4">
                {t('footer.contacts')}
              </h4>
              <ul className="space-y-3.5">
                {address && (
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#2ED177] mt-0.5 border border-white/10">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-emerald-100/90 leading-snug pt-1">
                      {address}
                    </span>
                  </li>
                )}
                {contacts?.phone && (
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#2ED177] border border-white/10">
                      <Phone className="w-4 h-4" />
                    </div>
                    <a
                      href={`tel:${contacts.phone.replace(/[^\d+]/g, '')}`}
                      className="text-xs text-emerald-100/90 hover:text-white font-medium transition-colors"
                    >
                      {contacts.phone}
                    </a>
                  </li>
                )}
                {contacts?.email && (
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#2ED177] border border-white/10">
                      <Mail className="w-4 h-4" />
                    </div>
                    <a
                      href={`mailto:${contacts.email}`}
                      className="text-xs text-emerald-100/90 hover:text-white transition-colors break-all"
                    >
                      {contacts.email}
                    </a>
                  </li>
                )}
                {hours && (
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#2ED177] border border-white/10">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-emerald-100/90">{hours}</span>
                  </li>
                )}

                {/* Quick Call-Center Hotline Card */}
                <li className="pt-2">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-emerald-300">
                        Yagona ishonch telefoni
                      </div>
                      <div className="text-sm font-bold text-white tracking-wide">
                        1199 / +998 71 200-00-00
                      </div>
                    </div>
                    <a
                      href="tel:1199"
                      aria-label="Qo‘ng‘iroq qilish"
                      className="w-8 h-8 rounded-full bg-[#2E7D4F] hover:bg-[#23653F] text-white flex items-center justify-center shadow transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* ── 4. Bottom Bar: Copyright, Developer, WCAG & Scroll-to-Top ─────────────── */}
          <div className="border-t border-white/15 pt-6 flex flex-col lg:flex-row justify-between items-center text-xs text-emerald-200/70 gap-4">
            <div className="text-center lg:text-left">
              {t('footer.copyright')}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-xl transition-colors shadow-sm">
                <img
                  src={digitalCenterLogo}
                  alt="Oʻrmon xoʻjaligini raqamlashtirish markazi"
                  className="w-7 h-7 object-contain shrink-0 drop-shadow"
                />
                <span className="text-[11.5px] text-emerald-100/90 font-medium">
                  {t('footer.developedBy')}
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2ED177]" />
                <span>{t('footer.wcag')}</span>
              </span>

              {/* Circular Back-to-Top Button */}
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Sahifa boshiga qaytish"
                title="Sahifa boshiga qaytish"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#2E7D4F] border border-white/15 hover:border-emerald-400/50 flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterRedesign;
