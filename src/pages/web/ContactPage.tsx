import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Clock,
  Home,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import type { SiteSettingsState } from '../../api/site';
import { pickLocalized } from '../../lib/localized';
import { useLanguage, useT } from '../../i18n/useT';
import { AppealForm } from './AppealCheckPage';
import contactHeroBgImage from '../../assets/img/contact-hero.jpg';
import type { UiLanguage } from '../../i18n/context';

export interface ContactPageProps {
  onNavigate?: (page: string, params?: Record<string, unknown>) => void;
  /** Fetched ONCE by `routes.tsx`'s `Layout` and handed down. This page used
   *  to call `fetchSiteSettings()` itself while `PublicLayout` above it did
   *  the same, so every visit to `/contact` made the request twice. */
  siteSettings?: SiteSettingsState;
}

const CARD_GRID_CLASS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
};

interface ContactBannerText {
  homeBreadcrumb: string;
  contactBreadcrumb: string;
  scrollCue: string;
}

const CONTACT_BANNER_TEXT: Record<UiLanguage, ContactBannerText> = {
  uz_latn: {
    homeBreadcrumb: 'Bosh sahifa',
    contactBreadcrumb: 'Aloqa',
    scrollCue: 'Murojaat va aloqa',
  },
  ru: {
    homeBreadcrumb: 'Главная',
    contactBreadcrumb: 'Контакты',
    scrollCue: 'Форма и контакты',
  },
  uz_cyrl: {
    homeBreadcrumb: 'Бош саҳифа',
    contactBreadcrumb: 'Алоқа',
    scrollCue: 'Мурожаат ва алоқа',
  },
  en: {
    homeBreadcrumb: 'Home',
    contactBreadcrumb: 'Contact',
    scrollCue: 'Appeal and contacts',
  },
  kaa: {
    homeBreadcrumb: 'Bas bet',
    contactBreadcrumb: 'Baylanıs',
    scrollCue: 'Múráját hám baylanıs',
  },
};

/**
 * Task 14 (contact half) — `/contact`. The filing form is the exact one
 * `/appeal-check` already ships (`AppealForm`, re-exported from
 * `AppealCheckPage.tsx`) rather than a second copy: same
 * `POST /api/v1/public/appeals` call, same required-contact validation,
 * same success/error rendering — reusing it is what keeps this page and
 * `/appeal-check` from drifting apart on that one form.
 *
 * Every contact detail comes from `fetchSiteSettings()` and is rendered only
 * when present. The design canvas fills the address card with a literal
 * `[MANZIL]` placeholder and the CTA row with `[MUDDAT]` (the response
 * deadline) — both are genuinely unknown today (no address, no committed
 * SLA), so this page renders neither card nor line rather than a
 * placeholder standing in for a real value.
 */
export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigate,
  siteSettings = { status: 'loading' },
}) => {
  const t = useT();
  const { uiLanguage } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const bannerText = CONTACT_BANNER_TEXT[uiLanguage] ?? CONTACT_BANNER_TEXT.uz_latn;

  // Responsive header measurement for precise 100vh hero height
  const [headerHeight, setHeaderHeight] = useState(132);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const measure = () => {
      const header = document.querySelector('header');
      if (header) setHeaderHeight(header.offsetHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const contacts = siteSettings.status === 'ready' ? siteSettings.data.contacts : null;
  const loaded = siteSettings.status !== 'loading';
  const address = contacts ? pickLocalized(contacts.address, uiLanguage) : '';
  const hours = contacts ? pickLocalized(contacts.hours, uiLanguage) : '';

  const cards: { icon: React.ReactNode; label: string; value: string; note: string }[] = [];
  if (contacts?.phone) {
    cards.push({
      icon: <Phone className="w-5 h-5 text-[#E8F8EE]" />,
      label: t('contact.card.phone'),
      value: contacts.phone,
      note: hours || '',
    });
  }
  if (contacts?.email) {
    cards.push({
      icon: <Mail className="w-5 h-5 text-[#E8F8EE]" />,
      label: t('contact.card.email'),
      value: contacts.email,
      note: t('contact.card.emailNote'),
    });
  }
  if (address) {
    cards.push({
      icon: <MapPin className="w-5 h-5 text-[#E8F8EE]" />,
      label: t('contact.card.address'),
      value: address,
      note: '',
    });
  }

  return (
    <div data-testid="contact-page" className="font-sans bg-[#EFF7F2]">
      {/* ── HERO BANNER ──────────────────────────────────────────────
          Full-bleed edge-to-edge flush with the dark green header (-mt-10).
          Calculated exactly so header + hero = 100vh of the visible screen. */}
      <section
        id="contact-hero"
        style={{
          height: `calc(100vh - ${headerHeight}px)`,
          minHeight: '480px',
        }}
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-10 overflow-hidden bg-[#0C2414] text-white flex flex-col justify-between"
      >
        {/* Background Image & Atmospheric Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={contactHeroBgImage}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center transform scale-105 filter brightness-95 contrast-[1.02]"
          />
          {/* Dark on left for text legibility, clear on right */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(5,20,10,0.92) 0%, rgba(5,20,10,0.70) 42%, rgba(5,20,10,0.25) 72%, rgba(5,20,10,0.05) 100%)',
            }}
          />
          {/* Top/bottom edge integration */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(23,51,27,0.45) 0%, transparent 28%, transparent 72%, rgba(12,36,20,0.75) 100%)',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex flex-col justify-between pt-5 pb-5 sm:pt-7 sm:pb-6">
          {/* Top: Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hero-fade-up flex items-center gap-2 text-xs text-[#BCE0C2] drop-shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{bannerText.homeBreadcrumb}</span>
            </button>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <span className="font-semibold text-white">{bannerText.contactBreadcrumb}</span>
          </nav>

          {/* Center: Badge, Headings, Subtitle */}
          <div className="my-auto py-1 sm:py-2 space-y-4 max-w-3xl">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="hero-fade-up inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A7F3D0] bg-black/40 border border-white/25 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span>{t('nav.contact')}</span>
              </div>

              <h1
                className="hero-fade-up text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.14] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: '.08s' }}
              >
                {t('contact.hero.title')}
              </h1>

              <p
                className="hero-fade-up text-sm sm:text-base text-[#E2F0E5] leading-relaxed max-w-2xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: '.14s' }}
              >
                {t('contact.hero.body')}
              </p>
            </div>
          </div>

          {/* Bottom: Smooth scroll indicator */}
          <div className="hero-fade-up pt-1 pb-1 flex items-center shrink-0" style={{ animationDelay: '.2s' }}>
            <button
              type="button"
              onClick={() => {
                contentRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#BCE0C2] hover:text-white transition-colors cursor-pointer group"
            >
              <span>{bannerText.scrollCue}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7FE0A0] group-hover:translate-y-0.5 transition-transform animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTACT CONTENT ─────────────────────────────────────────── */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#EFF7F2] py-12 sm:py-16 pb-20 -mb-10">
        <div ref={contentRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Compact Modern Contact Cards */}
          {loaded && cards.length > 0 && (
            <section className={`grid grid-cols-1 gap-4 sm:gap-5 ${CARD_GRID_CLASS[Math.min(cards.length, 3)]}`}>
              {cards.map((card, idx) => (
                <div
                  key={card.label}
                  className="hero-fade-up card-lift group relative bg-white/95 backdrop-blur-sm rounded-2xl p-4.5 sm:p-5 border border-[#D5E6DA] hover:border-[#2E7D4F] shadow-xs hover:shadow-md transition-all duration-500 ease-out hover:-translate-y-1 flex items-start gap-4 overflow-hidden cursor-default"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* Top glowing bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2E7D4F] via-[#34D399] to-[#059669] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none" />

                  {/* Left indicator accent line */}
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#2E7D4F] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out transform -translate-x-1 group-hover:translate-x-0 pointer-events-none" />

                  {/* Icon Container */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2E7D4F] via-[#246B42] to-[#123522] text-white flex items-center justify-center shrink-0 shadow-xs shadow-[#2E7D4F]/25 group-hover:scale-110 group-hover:rotate-2 transition-all duration-500 ease-out mt-0.5">
                    {card.icon}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#738A7A]">
                      {card.label}
                    </div>
                    <div className="mt-1 text-base sm:text-lg font-bold text-[#123522] group-hover:text-[#23653F] transition-colors duration-300 break-words leading-snug">
                      {card.value}
                    </div>
                    {card.note && (
                      <div className="mt-1 text-xs text-[#526B5A] leading-tight">
                        {card.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Form & Side Action Panels */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.18fr_1fr] gap-6 sm:gap-8 items-start">
            <div className="hero-fade-up">
              <AppealForm />
            </div>

            <div className="flex flex-col gap-6">
              {/* Check appeal card */}
              <div className="hero-fade-up card-lift group relative bg-gradient-to-br from-white via-[#F6FBF8] to-[#EAF6EE] rounded-3xl p-6 sm:p-7 border border-[#CCE4D3] hover:border-[#2E7D4F] shadow-sm hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#34D399]/15 blur-2xl pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2E7D4F] via-[#34D399] to-[#059669] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex items-center justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E7D4F] via-[#23653F] to-[#123522] text-white flex items-center justify-center shadow-md shadow-[#2E7D4F]/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shrink-0">
                    <Search className="w-5 h-5 text-[#E8F8EE]" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#E3F4E8] px-3 py-1 rounded-full border border-[#BDE3C8]">
                    Tezkor tekshirish
                  </span>
                </div>

                <h3 className="mt-4 text-lg sm:text-xl font-bold text-[#123522] group-hover:text-[#1E5631] transition-colors leading-snug">
                  {t('contact.appeal.title')}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#4E6354] leading-relaxed">
                  {t('contact.appeal.body')}
                </p>

                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  className="mt-5 !rounded-xl !border-[#CCE4D3] hover:!border-[#1E5631] hover:!bg-[#1E5631] hover:!text-white font-bold text-xs sm:text-sm !py-3 shadow-xs hover:shadow-md transition-all duration-300 group/btn"
                  onClick={() => onNavigate?.('appeal_check')}
                >
                  <span className="flex items-center gap-2">
                    {t('appeal.form.submit')}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1 text-[#2E7D4F] group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                </Button>
              </div>

              {/* Leshoz information card */}
              <div className="hero-fade-up card-lift group relative bg-gradient-to-br from-[#0F321B] via-[#164726] to-[#0A2614] text-white rounded-3xl p-6 sm:p-7 border border-[#276B3C] shadow-lg shadow-[#0F321B]/15 hover:shadow-2xl hover:border-[#4ADE80]/60 transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#4ADE80]/10 blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#4ADE80] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A7F3D0] bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/15">
                    Rasmiy reyestr
                  </span>
                </div>

                <h3 className="mt-4 text-lg sm:text-xl font-bold text-white group-hover:text-[#A7F3D0] transition-colors leading-snug">
                  {t('contact.leshoz.title')}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#D4EDDC] leading-relaxed">
                  {t('contact.leshoz.body')}
                </p>

                <button
                  type="button"
                  onClick={() => onNavigate?.('documents')}
                  className="mt-5 w-full inline-flex items-center justify-between px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-[#0F321B] border border-white/25 hover:border-white font-bold text-xs sm:text-sm backdrop-blur-md shadow-xs hover:shadow-lg transition-all duration-300 group/btn cursor-pointer"
                >
                  <span>{t('contact.leshoz.cta')}</span>
                  <ArrowRight className="w-4 h-4 text-[#4ADE80] group-hover/btn:text-[#0F321B] group-hover/btn:translate-x-1 transition-all" />
                </button>
              </div>

              {/* Social links & working schedule card */}
              <div className="hero-fade-up relative bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-[#CCE4D3] shadow-xs hover:shadow-md transition-all duration-500 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#738A7A]">
                    <Clock className="w-3.5 h-3.5 text-[#2E7D4F]" />
                    <span>{t('contact.social.title')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#2E7D4F] font-semibold bg-[#EAF7EE] px-2.5 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    <span>Onlayn xizmat</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {contacts?.social.telegram && (
                    <a
                      href={contacts.social.telegram}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/30 text-[#0088cc] font-bold text-xs sm:text-sm hover:bg-[#0088cc] hover:text-white hover:border-[#0088cc] shadow-xs hover:shadow-md hover:shadow-[#0088cc]/25 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span>Telegram</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  )}
                  {contacts?.social.youtube && (
                    <a
                      href={contacts.social.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#cc0000] font-bold text-xs sm:text-sm hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000] shadow-xs hover:shadow-md hover:shadow-[#cc0000]/25 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span>YouTube</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  )}
                  {!contacts?.social.telegram && !contacts?.social.youtube && (
                    <div className="text-xs text-[#526B5A]">
                      Ishonch telefoni orqali har ish kuni 9:00 dan 18:00 gacha bogʻlanishingiz mumkin.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};
