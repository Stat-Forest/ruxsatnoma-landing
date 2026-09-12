import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calculator as CalculatorIcon,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Home,
  Search,
  X,
} from 'lucide-react';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/button';
import { Scene, SCENE_KINDS, type SceneKind } from '../../components/art/Scene';
import { SERVICE_IMAGES } from '../../assets/img/services';
import supportBgImage from '../../assets/img/support-bg.jpg';
import { fetchServices, type Service } from '../../api/services';
import { pickLocalized, pickName } from '../../lib/localized';
import { useLanguage, useT } from '../../i18n/useT';
import type { UiLanguage } from '../../i18n/context';

export interface ServicesPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

type PageState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; services: Service[] };

/** `Scene`'s six illustrations are keyed by the same `code` the activity
 *  catalogue returns (task 11 brief) — but a code the catalogue might one
 *  day add before `Scene` grows a matching illustration must not crash the
 *  page, so this stays a guarded lookup, never a bare cast. */
function isSceneKind(code: string): code is SceneKind {
  return (SCENE_KINDS as readonly string[]).includes(code);
}

interface ServicesBannerText {
  homeBreadcrumb: string;
  servicesBreadcrumb: string;
  searchPlaceholder: string;
  pillDays: string;
  pillOnline: string;
  pillCalculator: string;
  searchResultsCount: (count: number) => string;
  noResultsTitle: string;
  noResultsSubtitle: string;
  resetSearch: string;
  scrollCue: string;
}

const SERVICES_BANNER_TEXT: Record<UiLanguage, ServicesBannerText> = {
  uz_latn: {
    homeBreadcrumb: 'Bosh sahifa',
    servicesBreadcrumb: 'Xizmatlar',
    searchPlaceholder: 'Xizmat nomi boʻyicha qidirish (masalan: chorva, asalari, pichan)...',
    pillDays: '15 kun — koʻrib chiqish muddati',
    pillOnline: '100% onlayn ariza',
    pillCalculator: 'Tariflar kalkulyatori',
    searchResultsCount: (c) => `Qidiruv natijasi: ${c} ta xizmat topildi`,
    noResultsTitle: 'Hech qanday xizmat topilmadi',
    noResultsSubtitle: 'Kiritilgan soʻz boʻyicha xizmat mavjud emas. Boshqa soʻz bilan qidirib koʻring.',
    resetSearch: 'Barchasini koʻrsatish',
    scrollCue: 'Xizmatlar roʻyxatiga oʻtish',
  },
  ru: {
    homeBreadcrumb: 'Главная',
    servicesBreadcrumb: 'Услуги',
    searchPlaceholder: 'Поиск по названию услуги (например: выпас, пасека, сенокос)...',
    pillDays: '15 дней — срок рассмотрения',
    pillOnline: '100% онлайн подача',
    pillCalculator: 'Калькулятор тарифов',
    searchResultsCount: (c) => `Результаты поиска: найдено ${c} услуг`,
    noResultsTitle: 'Услуги не найдены',
    noResultsSubtitle: 'По вашему запросу услуг не найдено. Попробуйте изменить параметры поиска.',
    resetSearch: 'Показать все',
    scrollCue: 'К списку услуг',
  },
  uz_cyrl: {
    homeBreadcrumb: 'Бош саҳифа',
    servicesBreadcrumb: 'Хизматлар',
    searchPlaceholder: 'Хизмат номи бўйича қидириш (масалан: чорва, асалари, пичан)...',
    pillDays: '15 кун — кўриб чиқиш муддати',
    pillOnline: '100% онлайн ариза',
    pillCalculator: 'Тарифлар калькулятори',
    searchResultsCount: (c) => `Қидирув натижаси: ${c} та хизмат топилди`,
    noResultsTitle: 'Ҳеч қандай хизмат топилмади',
    noResultsSubtitle: 'Киритилган сўз бўйича хизмат мавжуд эмас. Бошқа сўз билан қидириб кўринг.',
    resetSearch: 'Барчасини кўрсатиш',
    scrollCue: 'Хизматлар рўйхатига ўтиш',
  },
  en: {
    homeBreadcrumb: 'Home',
    servicesBreadcrumb: 'Services',
    searchPlaceholder: 'Search by service name (e.g. grazing, beekeeping, haymaking)...',
    pillDays: '15 days review SLA',
    pillOnline: '100% online application',
    pillCalculator: 'Fee calculator',
    searchResultsCount: (c) => `Search results: ${c} services found`,
    noResultsTitle: 'No services found',
    noResultsSubtitle: 'No services match your search terms. Try different keywords.',
    resetSearch: 'Show all',
    scrollCue: 'Explore all services',
  },
  kaa: {
    homeBreadcrumb: 'Bas bet',
    servicesBreadcrumb: 'Xızmetler',
    searchPlaceholder: 'Xızmet atı boyınsha izlew...',
    pillDays: '15 kún — kórip shıǵıw múddeti',
    pillOnline: '100% onlayn arza',
    pillCalculator: 'Kalkulyator',
    searchResultsCount: (c) => `Izlew nátiyjesi: ${c} xızmet tabıldı`,
    noResultsTitle: 'Xızmetler tabılmadı',
    noResultsSubtitle: 'Kiritilgen sóz boyınsha xızmet joq. Basqa sóz benen izlep kóriń.',
    resetSearch: 'Barlıǵın kórsetiw',
    scrollCue: 'Xızmetler dizimine ótiw',
  },
};

/**
 * A2 — the full service catalogue. The six cards used to be constants here,
 * each carrying an invented "term" (a duration guess, in one case an
 * "up to 3 working days" promise the system has never honoured). They now
 * come from `GET /public/refs/activity-types` (`api/services.ts`) — nothing
 * on this page may render a service the catalog did not return, or a term
 * this page made up.
 */
export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const t = useT();
  const { language, uiLanguage } = useLanguage();
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [searchQuery, setSearchQuery] = useState('');
  const bannerText = SERVICES_BANNER_TEXT[uiLanguage] ?? SERVICES_BANNER_TEXT.uz_latn;

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    void (async () => {
      try {
        const services = await fetchServices();
        if (!cancelled) setState({ status: 'ready', services });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredServices =
    state.status === 'ready'
      ? state.services.filter((svc) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase().trim();
          const name = pickName(svc.name, language, svc.code).toLowerCase();
          const desc = (pickLocalized(svc.description, language) || '').toLowerCase();
          return name.includes(q) || desc.includes(q);
        })
      : [];

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeLineHeight, setActiveLineHeight] = useState<number>(0);
  const [headerHeight, setHeaderHeight] = useState<number>(132);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const dotRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const cardRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const measureHeader = () => {
      const header = document.querySelector('header');
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };
    measureHeader();
    window.addEventListener('resize', measureHeader);
    return () => window.removeEventListener('resize', measureHeader);
  }, []);

  const activeIndex = Math.max(
    0,
    filteredServices.findIndex((s) => s.id === activeCardId)
  );

  const updateLineHeight = React.useCallback((targetId: string | null) => {
    if (!targetId || typeof window === 'undefined') return;
    const dotEl = dotRefs.current.get(targetId);
    const trackEl = trackRef.current;
    if (dotEl && trackEl) {
      const dotRect = dotEl.getBoundingClientRect();
      const trackRect = trackEl.getBoundingClientRect();
      const h = dotRect.top + dotRect.height / 2 - trackRect.top;
      if (h > 0) {
        setActiveLineHeight(h);
      }
    }
  }, []);

  const scrollToCard = React.useCallback((id: string) => {
    setActiveCardId(id);
    const el = cardRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      updateLineHeight(id);
    }, 60);
  }, [updateLineHeight]);

  const updateScroll = React.useCallback(() => {
    if (
      typeof window === 'undefined' ||
      cardRefs.current.size === 0 ||
      filteredServices.length === 0
    )
      return;

    const scrollY = window.scrollY || window.pageYOffset;
    const scrollBottom = window.innerHeight + scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const isNearBottom = scrollBottom >= docHeight - 160;

    // If near bottom of the page, activate the very last card
    if (isNearBottom) {
      const lastService = filteredServices[filteredServices.length - 1];
      if (lastService) {
        setActiveCardId(lastService.id);
        updateLineHeight(lastService.id);
        return;
      }
    }

    const trackEl = trackRef.current;
    if (trackEl) {
      const trackRect = trackEl.getBoundingClientRect();
      if (trackRect.top > window.innerHeight * 0.45) {
        // Above the first card
        const firstService = filteredServices[0];
        if (firstService) {
          setActiveCardId(firstService.id);
          updateLineHeight(firstService.id);
          return;
        }
      }
    }

    const focusY = window.innerHeight * 0.46;
    let closestId: string | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < filteredServices.length; i++) {
      const svc = filteredServices[i];
      const el = cardRefs.current.get(svc.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();

      // Check if card is visible within the reading area
      if (rect.bottom > 100 && rect.top < window.innerHeight - 80) {
        const cardCenter = rect.top + rect.height / 2;
        const dist = Math.abs(cardCenter - focusY);
        if (dist < minDistance) {
          minDistance = dist;
          closestId = svc.id;
        }
      }
    }

    if (closestId) {
      setActiveCardId(closestId);
      updateLineHeight(closestId);
    }
  }, [filteredServices, updateLineHeight]);

  useEffect(() => {
    if (typeof window === 'undefined' || filteredServices.length === 0) return;

    const initialId = activeCardId || filteredServices[0].id;
    if (!activeCardId) {
      setActiveCardId(initialId);
    }

    const t1 = setTimeout(() => updateLineHeight(initialId), 60);
    const t2 = setTimeout(() => updateLineHeight(initialId), 250);

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [filteredServices, updateScroll, activeCardId, updateLineHeight]);

  // Group services into pairs for 2-column layout
  const serviceRows: Service[][] = [];
  for (let i = 0; i < filteredServices.length; i += 2) {
    serviceRows.push(filteredServices.slice(i, i + 2));
  }

  return (
    <div className="space-y-10 font-sans">
      {/* ── HERO BANNER ──────────────────────────────────────────────
          Full-bleed edge-to-edge flush with the dark green header (-mt-10).
          Calculated exactly so header + hero = 100vh of the visible screen. */}
      <section
        id="services-hero"
        style={{
          height: `calc(100vh - ${headerHeight}px)`,
          minHeight: '520px',
        }}
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-10 mb-8 sm:mb-12 overflow-hidden bg-[#0C2414] text-white flex flex-col justify-between"
      >
        {/* Background Image & Atmospheric Gradients — natural brightness with soft left-only text gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={supportBgImage}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-right sm:object-center transform scale-105 filter brightness-95 contrast-[1.05]"
          />
          {/* Soft directional gradient: dark on left for text legibility, clear and vibrant on center/right */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(5, 20, 10, 0.85) 0%, rgba(5, 20, 10, 0.65) 36%, rgba(5, 20, 10, 0.20) 65%, rgba(5, 20, 10, 0.05) 100%)',
            }}
          />
          {/* Subtle top/bottom edge integration */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(23, 51, 27, 0.40) 0%, transparent 25%, transparent 75%, rgba(12, 36, 20, 0.70) 100%)',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex flex-col justify-between pt-5 pb-5 sm:pt-7 sm:pb-6">
          {/* Top: Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="reveal flex items-center gap-2 text-xs text-[#BCE0C2] drop-shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{bannerText.homeBreadcrumb}</span>
            </button>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <span className="font-semibold text-white">{bannerText.servicesBreadcrumb}</span>
          </nav>

          {/* Center: Badge, Headings, Search bar & Quick highlight chips */}
          <div className="my-auto py-1 sm:py-2 space-y-4 max-w-3xl">
            {/* Badge & Headings */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="reveal inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A7F3D0] bg-black/40 border border-white/25 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                <span className="live w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_0_3px_rgba(74,222,128,.3)]" />
                <span>{t('services.badge')}</span>
              </div>

              <h1
                className="reveal text-3xl sm:text-4xl lg:text-5xl xl:text-5xl font-black text-white leading-[1.14] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: '.06s' }}
              >
                {t('services.title')}
              </h1>

              <p
                className="reveal text-sm sm:text-base text-[#E2F0E5] leading-relaxed max-w-2xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: '.12s' }}
              >
                {t('services.subtitle')}
              </p>
            </div>

            {/* Search bar & Quick highlight chips */}
            <div className="reveal pt-1 max-w-2xl space-y-3" style={{ animationDelay: '.18s' }}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7FE0A0] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={bannerText.searchPlaceholder}
                  className="w-full h-11 sm:h-13 pl-12 pr-10 rounded-xl bg-black/35 hover:bg-black/45 focus:bg-black/55 border border-white/30 focus:border-[#7FE0A0] text-white placeholder-white/70 text-sm sm:text-[15px] backdrop-blur-md outline-none transition-all duration-200 shadow-xl"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Tozalash"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick highlight chips */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/45 border border-white/20 text-xs text-[#D5EADB] backdrop-blur-md shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7FE0A0]" />
                  {bannerText.pillOnline}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/45 border border-white/20 text-xs text-[#D5EADB] backdrop-blur-md shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-[#7FE0A0]" />
                  {bannerText.pillDays}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate?.('calculator')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 hover:bg-black/55 border border-white/25 text-xs font-semibold text-white backdrop-blur-md shadow-sm transition-colors cursor-pointer"
                >
                  <CalculatorIcon className="w-3.5 h-3.5 text-[#9CE3AE]" />
                  <span>{bannerText.pillCalculator}</span>
                  <ArrowRight className="w-3 h-3 text-[#9CE3AE]" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom: Scroll cue / explorer button */}
          <div className="reveal pt-1 pb-1 flex items-center justify-between shrink-0" style={{ animationDelay: '.24s' }}>
            <button
              type="button"
              onClick={() => {
                const catalogEl = document.getElementById('services-catalog');
                if (catalogEl) {
                  catalogEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#BCE0C2] hover:text-white transition-colors cursor-pointer group"
            >
              <span>{bannerText.scrollCue}</span>
              <ChevronDown className="w-4 h-4 text-[#7FE0A0] group-hover:translate-y-0.5 transition-transform animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {state.status === 'loading' && (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          data-testid="services-loading"
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E4E7EA] rounded-2xl overflow-hidden flex flex-col"
            >
              <Skeleton height="h-[196px]" className="rounded-none" />
              <div className="p-6 space-y-4">
                <Skeleton height="h-6" width="w-3/4" />
                <Skeleton height="h-4" width="w-full" />
                <Skeleton height="h-4" width="w-4/5" />
                <div className="pt-4 border-t border-[#E4E7EA] flex items-center justify-between">
                  <Skeleton height="h-4" width="w-20" />
                  <Skeleton height="h-8" width="w-28" className="rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <Alert variant="danger" title={t('services.error.title')}>
          {t('services.error.text')}
        </Alert>
      )}

      {state.status === 'ready' && state.services.length === 0 && (
        <div
          data-testid="services-empty"
          className="bg-white border border-[#E4E7EA] rounded-2xl p-10 text-center space-y-2"
        >
          <p className="text-sm text-[#5A646D]">{t('services.empty')}</p>
        </div>
      )}

      {state.status === 'ready' && state.services.length > 0 && (
        <>
          {searchQuery.trim() && (
            <div className="flex items-center justify-between px-1 text-sm text-[#5A646D]">
              <span className="font-semibold text-[#123522]">
                {bannerText.searchResultsCount(filteredServices.length)}
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-[#2E7D4F] hover:underline cursor-pointer"
              >
                {bannerText.resetSearch}
              </button>
            </div>
          )}

          {filteredServices.length === 0 ? (
            <div className="bg-white border border-[#E4E7EA] rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#F0F7F1] text-[#2E7D4F] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#123522]">{bannerText.noResultsTitle}</h3>
                <p className="text-sm text-[#5A646D] max-w-md mx-auto">{bannerText.noResultsSubtitle}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                {bannerText.resetSearch}
              </Button>
            </div>
          ) : (
            /* ── 2-COLUMN CARDS CONTAINER WITH CENTRAL BORDER & GLOWING LIGHT ── */
            <div id="services-catalog" className="relative py-4 space-y-10 lg:space-y-16">
              {/* Continuous vertical line down the center on desktop */}
              <div
                ref={trackRef}
                aria-hidden="true"
                className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-[4px] pointer-events-none z-10"
              >
                {/* Inactive base line track */}
                <div className="absolute inset-0 bg-[#D4E8D8] rounded-full" />

                {/* Active green light progress beam with intense glow */}
                <div
                  className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#1F6E43] via-[#2E7D4F] to-[#4ADE80] rounded-full transition-all duration-300 ease-out"
                  style={{
                    height: `${activeLineHeight}px`,
                    boxShadow:
                      '0 0 10px rgba(74, 222, 128, 0.95), 0 0 20px rgba(46, 125, 79, 0.6), 0 0 32px rgba(74, 222, 128, 0.4)',
                  }}
                >
                  {/* Glowing Light Beacon Orb at the tip */}
                  {activeLineHeight > 10 && (
                    <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#4ADE80] shadow-[0_0_12px_#4ADE80,0_0_24px_rgba(74,222,128,0.95),0_0_36px_rgba(34,197,94,0.7)] flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                    </div>
                  )}
                </div>
              </div>

              {serviceRows.map((row, rowIdx) => {
                const idx0 = rowIdx * 2;
                const idx1 = rowIdx * 2 + 1;
                const isActive0 = activeCardId === row[0]?.id;
                const isPassed0 = idx0 < activeIndex;
                const isActive1 = row[1] ? activeCardId === row[1].id : false;
                const isPassed1 = idx1 < activeIndex;

                return (
                  <div key={rowIdx} className="relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-start">
                      {/* Left card (teparoqda / higher up) */}
                      {row[0] && (
                        <div
                          ref={(el) => {
                            if (el) cardRefs.current.set(row[0].id, el);
                            else cardRefs.current.delete(row[0].id);
                          }}
                          data-service-id={row[0].id}
                          onMouseEnter={() => {
                            setActiveCardId(row[0].id);
                            updateLineHeight(row[0].id);
                          }}
                          className="relative"
                        >
                          <ServiceCard
                            service={row[0]}
                            index={idx0}
                            language={language}
                            onNavigate={onNavigate}
                            isActive={isActive0}
                            onHover={() => {
                              setActiveCardId(row[0].id);
                              updateLineHeight(row[0].id);
                            }}
                          />
                          {/* Horizontal connector to center line on desktop */}
                          <div
                            aria-hidden="true"
                            className={`hidden lg:block absolute -right-12 top-1/2 -translate-y-1/2 w-12 transition-all duration-300 pointer-events-none ${
                              isActive0
                                ? 'border-t-[3px] border-[#2E7D4F] shadow-[0_0_12px_rgba(74,222,128,0.95)]'
                                : isPassed0
                                ? 'border-t-2 border-[#76BD8C]'
                                : 'border-t-2 border-[#D4E8D8]'
                            }`}
                          />
                          {/* Central Dot for Left card */}
                          <div
                            ref={(el) => {
                              if (el) dotRefs.current.set(row[0].id, el);
                              else dotRefs.current.delete(row[0].id);
                            }}
                            className="hidden lg:block absolute -right-12 top-1/2 -translate-y-1/2 translate-x-1/2 pointer-events-auto z-20"
                          >
                            <DotIndicator
                              index={idx0}
                              isActive={isActive0}
                              isPassed={isPassed0}
                              onClick={() => scrollToCard(row[0].id)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Right card (pastroqda / lower down) */}
                      {row[1] ? (
                        <div
                          ref={(el) => {
                            if (el) cardRefs.current.set(row[1].id, el);
                            else cardRefs.current.delete(row[1].id);
                          }}
                          data-service-id={row[1].id}
                          onMouseEnter={() => {
                            setActiveCardId(row[1].id);
                            updateLineHeight(row[1].id);
                          }}
                          className="relative lg:mt-24 xl:mt-28"
                        >
                          {/* Horizontal connector to center line on desktop */}
                          <div
                            aria-hidden="true"
                            className={`hidden lg:block absolute -left-12 top-1/2 -translate-y-1/2 w-12 transition-all duration-300 pointer-events-none ${
                              isActive1
                                ? 'border-t-[3px] border-[#2E7D4F] shadow-[0_0_12px_rgba(74,222,128,0.95)]'
                                : isPassed1
                                ? 'border-t-2 border-[#76BD8C]'
                                : 'border-t-2 border-[#D4E8D8]'
                            }`}
                          />
                          {/* Central Dot for Right card */}
                          <div
                            ref={(el) => {
                              if (el) dotRefs.current.set(row[1].id, el);
                              else dotRefs.current.delete(row[1].id);
                            }}
                            className="hidden lg:block absolute -left-12 top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-auto z-20"
                          >
                            <DotIndicator
                              index={idx1}
                              isActive={isActive1}
                              isPassed={isPassed1}
                              onClick={() => scrollToCard(row[1].id)}
                            />
                          </div>
                          <ServiceCard
                            service={row[1]}
                            index={idx1}
                            language={language}
                            onNavigate={onNavigate}
                            isActive={isActive1}
                            onHover={() => {
                              setActiveCardId(row[1].id);
                              updateLineHeight(row[1].id);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="hidden lg:block" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* The calculator lives on the home page as its own section
              (`routes.tsx`'s own `CALCULATOR_PATH` docstring: "a SECTION of
              the home page, not a page") — this card links there through the
              same `onNavigate('calculator')` contract the header CTA uses,
              rather than embedding a second `PriceCalculator` instance. */}
          <div className="reveal bg-[#123522] rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="p-3 bg-white/10 rounded-xl text-[#9CE3AE] shrink-0">
                <CalculatorIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t('tariffs.calculator.heading')}</h2>
                <p className="text-sm text-[#C4D8C9] mt-1">{t('tariffs.calculator.description')}</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate?.('calculator')}
              className="shrink-0"
            >
              {t('tariffs.calculator.submitCta')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

function DotIndicator({
  index,
  isActive,
  isPassed,
  onClick,
}: {
  index: number;
  isActive: boolean;
  isPassed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Xizmat #${index + 1}`}
      className={`group relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
        isActive
          ? 'w-9 h-9 bg-[#1F6E43] border-2 border-white text-white font-black text-xs shadow-[0_0_0_5px_rgba(74,222,128,0.5),0_0_24px_rgba(74,222,128,0.95)] scale-125 z-30'
          : isPassed
          ? 'w-7 h-7 bg-[#2E7D4F] border-2 border-[#4ADE80] text-white font-bold text-[11px] shadow-[0_0_10px_rgba(74,222,128,0.4)] hover:scale-115 hover:brightness-110 z-20'
          : 'w-7 h-7 bg-white border-2 border-[#BCD7C2] text-[#4A7A57] hover:border-[#2E7D4F] hover:text-[#2E7D4F] hover:scale-110 font-bold text-[11px] shadow-xs z-10'
      }`}
    >
      <span className="relative z-10">{String(index + 1).padStart(2, '0')}</span>
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[#4ADE80] animate-ping opacity-50 pointer-events-none"
        />
      )}
    </button>
  );
}

function ServiceCard({
  service,
  language,
  onNavigate,
  index,
  isActive,
  onHover,
}: {
  service: Service;
  language: string;
  onNavigate?: (page: string, params?: any) => void;
  index: number;
  isActive?: boolean;
  onHover?: () => void;
}) {
  const t = useT();
  const name = pickName(service.name, language, service.code);
  const description = pickLocalized(service.description, language);

  // A subtle accent hue per card index — cycles through 6 forest-tinted shades
  const accentPalette = [
    { line: '#2E7D4F', glow: 'rgba(46,125,79,0.35)', badge: 'bg-[#2E7D4F]' },
    { line: '#1A6B5A', glow: 'rgba(26,107,90,0.35)', badge: 'bg-[#1A6B5A]' },
    { line: '#3B6E2E', glow: 'rgba(59,110,46,0.35)', badge: 'bg-[#3B6E2E]' },
    { line: '#285C6E', glow: 'rgba(40,92,110,0.35)', badge: 'bg-[#285C6E]' },
    { line: '#4E6E2E', glow: 'rgba(78,110,46,0.35)', badge: 'bg-[#4E6E2E]' },
    { line: '#6E4E2E', glow: 'rgba(110,78,46,0.35)', badge: 'bg-[#6E4E2E]' },
  ];
  const accent = accentPalette[index % accentPalette.length];

  return (
    <div
      onMouseEnter={onHover}
      style={{
        animationDelay: `${Math.min(index, 8) * 0.08}s`,
        boxShadow: isActive
          ? `0 0 0 2px ${accent.line}, 0 24px 48px ${accent.glow}, 0 0 28px rgba(74,222,128,0.20)`
          : '0 4px 20px rgba(18,53,34,0.07)',
      }}
      className={`reveal group relative bg-white rounded-3xl overflow-hidden flex flex-col transition-all duration-400 cursor-pointer ${
        isActive
          ? 'ring-2 ring-[#4ADE80]/30 -translate-y-2 scale-[1.012]'
          : 'border border-[#DCE7DF] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(18,53,34,0.12)]'
      }`}
    >
      {/* ── Image zone ── tall, cinematic */}
      <div className="relative h-[240px] overflow-hidden bg-[#0C2810] flex-shrink-0">
        <div className="thumb-zoom absolute inset-0 transition-transform duration-700 group-hover:scale-105">
          {isSceneKind(service.code) && (
            <>
              {SERVICE_IMAGES[service.code] && (
                <img
                  src={SERVICE_IMAGES[service.code]}
                  alt={name}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              )}
              <div className={SERVICE_IMAGES[service.code] ? 'hidden' : 'w-full h-full'}>
                <Scene kind={service.code} height={240} />
              </div>
            </>
          )}
        </div>

        {/* Strong cinematic bottom gradient so text reads clearly */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(6,20,10,0.88) 0%, rgba(6,20,10,0.55) 38%, rgba(0,0,0,0.10) 65%, transparent 100%)',
          }}
        />

        {/* Index number — top left, subtle */}
        <div
          className="absolute left-4 top-4 text-[11px] font-black tracking-[.2em] text-white/60 drop-shadow"
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Processing days badge — top right pill */}
        <div className="absolute right-3.5 top-3.5 inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 shadow-sm">
          <Clock className="w-3 h-3 text-[#4ADE80]" />
          <span className="text-[11px] font-bold text-white">
            {service.processing_days} {t('services.card.daysUnit')}
          </span>
        </div>

        {/* Title overlaid on image — large, bold, white */}
        <div className="absolute left-0 right-0 bottom-0 px-5 pb-4 pt-8">
          <h3 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            {name}
          </h3>
        </div>

        {/* Active glow shimmer on top edge */}
        {isActive && (
          <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
            style={{ background: `linear-gradient(90deg, transparent, ${accent.line}, #4ADE80, ${accent.line}, transparent)` }}
          />
        )}
      </div>

      {/* ── Content zone ── */}
      <div className="flex flex-col flex-grow px-5 py-4 gap-3 relative">
        {/* Thin left accent line */}
        <div
          className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
          style={{ background: `linear-gradient(to bottom, ${accent.line}, #4ADE80)` }}
        />

        {/* Description */}
        {description ? (
          <p
            data-testid={`service-desc-${service.id}`}
            className="text-sm text-[#4E5C52] leading-relaxed flex-grow line-clamp-3"
          >
            {description}
          </p>
        ) : (
          <div className="flex-grow" />
        )}

        {/* Bottom row: separator + CTA */}
        <div className="pt-2 mt-auto">
          <button
            type="button"
            onClick={() => onNavigate?.('applicant_wizard', { activity: service.id })}
            className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer group/btn ${
              isActive
                ? 'bg-[#1F6E43] text-white shadow-[0_4px_16px_rgba(31,110,67,0.45)] hover:bg-[#185c37]'
                : 'bg-[#EFF7F2] text-[#1F6E43] border border-[#C4DECC] hover:bg-[#2E7D4F] hover:text-white hover:border-[#2E7D4F] hover:shadow-[0_4px_14px_rgba(46,125,79,0.35)]'
            }`}
          >
            <span>{t('services.card.apply')}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
