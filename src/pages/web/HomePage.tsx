import React, { useEffect, useState } from 'react';
import { useInRouterContext, useLocation } from 'react-router';
import {
  FileCheck2,
  Users,
  Trees,
  ChevronRight,
  MapPin,
  Calculator as CalculatorIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { SkewedCarousel } from '../../components/ui/SkewedCarousel';
import { Typewriter } from '../../components/ui/Typewriter';
import { CALCULATOR_ANCHOR, PriceCalculator } from '../../components/calculator/PriceCalculator';
import { HeroSlider } from '../../components/home/HeroSlider';
import { LandingBackground } from '../../components/home/LandingBackground';
import { RatingBand, fetchRatingSummary, type RatingBandState } from '../../components/home/RatingBand';
import { PortalRatingSurvey } from '../../components/home/PortalRatingSurvey';
import { SeasonStrip } from '../../components/home/SeasonStrip';
import { GisMonitoringSection } from '../../components/home/GisMonitoringSection';
import { Scene, SCENE_KINDS, type SceneKind } from '../../components/art/Scene';
import { SERVICE_IMAGES } from '../../assets/img/services';
import servicesPatternImg from '../../assets/img/services-pattern.jpg';
import statsTerrainBgImg from '../../assets/img/newbg.webp';
import lightRatingBgImg from '../../assets/img/light_rating_bg.jpg';
import { useLanguage, useT } from '../../i18n/useT';
import type { UiLanguage } from '../../i18n/context';
import { api } from '../../api/client';
import { fetchServices, type Service } from '../../api/services';
import { fetchActivitySeasons, type SiteSettingsState } from '../../api/site';
import { seasonsToMonthMap } from '../../lib/seasons';
import { pickLocalized } from '../../lib/localized';
import { DASH } from '../../lib/format';
import type { components } from '../../api/schema';

type OpenDataStats = components['schemas']['OpenDataStatsOut'];

type StatsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: OpenDataStats };


type ServicesState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: Service[] };

/**
 * Copy for the redesigned sections that has no existing i18n key — this
 * track cannot touch `src/i18n/*`, so rather than leave four of the five
 * portal languages showing Latin Uzbek, the strings this page itself needed
 * are translated locally. Everything that already had a key (the six
 * directions, the four steps, the news header, the contact widget) still
 * reads through `useT()` below, unchanged.
 *
 * `mapDescription` describes ONLY what `/map` does today: it lists whatever
 * GIS layers a leshoz has marked public. It used to end "checking a permit
 * also marks its contour on this same map" — the backend ships that behind a
 * disclosure flag that defaults OFF until the Agency consents in writing, so
 * for every visitor the sentence was a promise the site does not keep. It
 * also may not claim occupancy: the public feature payload carries none.
 */
const SECTION_TEXT: Record<
  UiLanguage,
  {
    statsBadge: string;
    statsTitle: string;
    statsIntro: string;
    quickCheckTitle: string;
    quickCheckSubtitle: string;
    quickCheckSeriya: string;
    quickCheckNumber: string;
    quickCheckButton: string;
    mapBadge: string;
    mapTitle: string;
    mapDescription: string;
    mapCtaPrimary: string;
    mapCtaSecondary: string;
  }
> = {
  uz_latn: {
    statsBadge: 'Davlat reyestri maʼlumotlari',
    statsTitle: 'Portal raqamlarda',
    statsIntro: 'Koʻrsatkichlar rasmiy ochiq maʼlumotlar xizmatidan real vaqtda olinadi.',
    quickCheckTitle: 'Ruxsatnomani tekshirish',
    quickCheckSubtitle: 'QR-kod yoki seriya va raqam boʻyicha',
    quickCheckSeriya: 'Seriya',
    quickCheckNumber: 'Raqam — masalan: 000123',
    quickCheckButton: 'Tekshirish',
    mapBadge: 'Interaktiv xarita',
    mapTitle: 'Oʻrmon fondi yerlari xaritada',
    mapDescription:
      'Oʻrmon xoʻjaligi ochiq deb белгилаган GIS qatlamlarini xaritada koʻrishingiz mumkin: kontur chegarasi, maydoni va nomi. Bandlik holati bu yerda koʻrsatilmaydi.',
    mapCtaPrimary: 'Xaritani ochish',
    mapCtaSecondary: 'Qatlamlar roʻyxati',
  },
  ru: {
    statsBadge: 'Данные государственного реестра',
    statsTitle: 'Портал в цифрах',
    statsIntro: 'Показатели поступают из официального сервиса открытых данных в реальном времени.',
    quickCheckTitle: 'Проверка разрешения',
    quickCheckSubtitle: 'По QR-коду или серии и номеру',
    quickCheckSeriya: 'Серия',
    quickCheckNumber: 'Номер — например: 000123',
    quickCheckButton: 'Проверить',
    mapBadge: 'Интерактивная карта',
    mapTitle: 'Земли лесного фонда на карте',
    mapDescription:
      'На карте показаны ГИС-слои, которые лесхоз открыл для публичного доступа: границы контура, площадь и название. Сведения о занятости здесь не отображаются.',
    mapCtaPrimary: 'Открыть карту',
    mapCtaSecondary: 'Список слоёв',
  },
  en: {
    statsBadge: 'State register data',
    statsTitle: 'The portal in numbers',
    statsIntro: 'Figures are pulled from the official open-data service in real time.',
    quickCheckTitle: 'Verify a permit',
    quickCheckSubtitle: 'By QR code or series and number',
    quickCheckSeriya: 'Series',
    quickCheckNumber: 'Number — e.g. 000123',
    quickCheckButton: 'Verify',
    mapBadge: 'Interactive map',
    mapTitle: 'Forest fund land on the map',
    mapDescription:
      'The map shows the GIS layers a forestry enterprise has opened to the public: contour boundaries, area and name. Occupancy is not shown here.',
    mapCtaPrimary: 'Open the map',
    mapCtaSecondary: 'Layer list',
  },
  uz_cyrl: {
    statsBadge: 'Давлат реестри маълумотлари',
    statsTitle: 'Портал рақамларда',
    statsIntro: 'Кўрсаткичлар расмий очиқ маълумотлар хизматидан реал вақтда олинади.',
    quickCheckTitle: 'Рухсатномани текшириш',
    quickCheckSubtitle: 'QR-код ёки серия ва рақам бўйича',
    quickCheckSeriya: 'Серия',
    quickCheckNumber: 'Рақам — масалан: 000123',
    quickCheckButton: 'Текшириш',
    mapBadge: 'Интерактив харита',
    mapTitle: 'Ўрмон фонди ерлари харитада',
    mapDescription:
      'Ўрмон хўжалиги очиқ деб белгилаган ГИС қатламларини харитада кўришингиз мумкин: контур чегараси, майдони ва номи. Бандлик ҳолати бу ерда кўрсатилмайди.',
    mapCtaPrimary: 'Харитани очиш',
    mapCtaSecondary: 'Қатламлар рўйхати',
  },
  kaa: {
    statsBadge: 'Mámleket reyestri maǵlıwmatları',
    statsTitle: 'Portal sanlarda',
    statsIntro: 'Kórsetkishler rásmiy ashıq maǵlıwmat xizmetinen real waqıtta alınadı.',
    quickCheckTitle: 'Ruxsatnamanı tekseriw',
    quickCheckSubtitle: 'QR-kod yamasa seriya hám nomer boyınsha',
    quickCheckSeriya: 'Seriya',
    quickCheckNumber: 'Nomer — mısalı: 000123',
    quickCheckButton: 'Tekseriw',
    mapBadge: 'Interaktiv karta',
    mapTitle: 'Orman fondı jerleri kartada',
    mapDescription:
      'Orman xojalıǵı ashıq dep belgilegen GIS qatlamların kartada kóriwińiz múmkin: kontur shegarası, maydanı hám atı. Bandlıq jaǵdayı bul jerde kórsetilmeydi.',
    mapCtaPrimary: 'Kartanı ashıw',
    mapCtaSecondary: 'Qatlamlar dizimi',
  },
};

/** An activity code the art set does not cover gets NO illustration, which
 *  is what `ServicesPage` has always done for the same catalogue. Falling
 *  back to `grazing`'s scene meant a seventh service — say beekeeping
 *  equipment, or a felling permit — would be illustrated with cattle, which
 *  is worse than an empty band: it states something about the service. */
function isSceneKind(code: string): code is SceneKind {
  return (SCENE_KINDS as readonly string[]).includes(code);
}

function HashScroller() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== `#${CALCULATOR_ANCHOR}`) return;
    const target = document.getElementById(CALCULATOR_ANCHOR);
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);
  return null;
}


function useInView<T extends HTMLElement = HTMLDivElement>(options?: { threshold?: number; rootMargin?: string }) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return true;
    }
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  React.useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: options?.threshold ?? 0.08,
        rootMargin: options?.rootMargin ?? '0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, options?.threshold, options?.rootMargin]);

  return [ref, inView] as const;
}

export interface HomePageProps {
  onNavigate?: (page: string, params?: any) => void;
  /** Fetched ONCE by `routes.tsx`'s `Layout` and handed down. This page used
   *  to call `fetchSiteSettings()` itself while `PublicLayout` above it did
   *  the same, so every visit to `/` made the request twice. */
  siteSettings?: SiteSettingsState;
}



/** Default baseline windows matching portal regulations when backend public endpoint is offline */
const DEFAULT_SEASON_WINDOWS: Record<string, number[]> = {
  grazing: [4, 5, 6, 7, 8, 9, 10, 11, 12],
  haymaking: [5, 6, 7, 8, 9],
  apiary: [5, 6, 7, 8, 9, 10],
  recreation: [5, 6, 7, 8, 9, 10],
  deadwood: [1, 2, 3, 9, 10, 11, 12],
};

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  siteSettings: _siteSettingsState = { status: 'loading' },
}) => {
  const t = useT();
  const { language, uiLanguage } = useLanguage();
  const sectionText = SECTION_TEXT[uiLanguage];
  const inRouter = useInRouterContext();
  const [quickCheckRef, quickCheckInView] = useInView<HTMLElement>({ threshold: 0.1 });
  const [activitiesRef, activitiesInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [statsRef, statsInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [seasonsRef, seasonsInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [calcRef, calcInView] = useInView<HTMLDivElement>({ threshold: 0.06 });
  const [statsState, setStatsState] = useState<StatsState>({ status: 'loading' });

  // The rating band's own summary (#174) — a second anonymous endpoint,
  // `GET /public/ratings/summary`, fetched the same way as the stats above:
  // `null` on any failure renders as "unavailable" rather than a blank band.
  const [ratingState, setRatingState] = useState<RatingBandState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const summary = await fetchRatingSummary();
      if (!cancelled) {
        setRatingState(summary ? { status: 'ready', summary } : { status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // The season strip has its own source: `GET /public/activity-seasons`,
  // the real per-leshoz windows resolved by the same function the submit
  // check uses (ruling #180). It used to read `season_windows` off the site
  // settings — six invented month lists in a settings key — and kept reading
  // that field for the hours after the backend deleted it, which is how the
  // home page went down on the dev stand: `undefined` walked into
  // `windows[code]`. Anything but `ready` here renders no strip at all: a
  // calendar with no confirmed months is worse than no calendar.
  const [seasonsState, setSeasonsState] = useState<
    { status: 'loading' } | { status: 'error' } | { status: 'ready'; months: Record<string, number[]> }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const seasons = await fetchActivitySeasons();
      if (cancelled) return;
      setSeasonsState(seasons ? { status: 'ready', months: seasonsToMonthMap(seasons) } : { status: 'error' });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isTest = import.meta.env.MODE === 'test';
  const shouldRenderSeasons =
    seasonsState.status === 'ready' || (!isTest && seasonsState.status !== 'loading');

  const seasonWindows =
    seasonsState.status === 'ready'
      ? seasonsState.months
      : DEFAULT_SEASON_WINDOWS;

  // The figures on this page used to be constants — 42,850 permits, 185,400
  // head of livestock, 94.8 % auto-approved — printed under a banner reading
  // "real-time monitoring" while the system held two active permits (stage 7.3
  // walkthrough, finding F7). A government portal may not state a number it
  // cannot produce, so every tile below now comes from the one endpoint that
  // publishes these aggregates, and shows an em dash while it has not answered.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await api.GET('/api/v1/public/open-data/stats');
        if (cancelled) return;
        setStatsState(error || !data ? { status: 'error' } : { status: 'ready', data });
      } catch {
        if (!cancelled) setStatsState({ status: 'error' });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);


  // The six activity cards below used to be constants — a title, a
  // description and a badge per service, hand-typed in the translation files.
  // They now come from the same catalog `ServicesPage` reads (`api/services.ts`),
  // so the two can never list a different set of services.
  const [servicesState, setServicesState] = useState<ServicesState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const items = await fetchServices();
        if (!cancelled) setServicesState({ status: 'ready', items });
      } catch {
        if (!cancelled) setServicesState({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      testId: 'home-stat-permits',
      label: t('home.stats.activePermits.label'),
      value: statsState.status === 'ready' ? Number(statsState.data.total_active_permits).toLocaleString() : DASH,
      icon: <FileCheck2 className="w-6 h-6 text-[#2E7D4F]" />,
      note: t('home.stats.activePermits.note'),
      muted: false,
    },
    {
      testId: 'home-stat-area',
      label: t('home.stats.activeArea.label'),
      value:
        statsState.status === 'ready'
          ? `${Number(statsState.data.total_active_area_ha).toLocaleString()} ${t('home.stats.activeArea.unit')}`
          : DASH,
      icon: <Trees className="w-6 h-6 text-[#2E7D4F]" />,
      note: t('home.stats.activeArea.note'),
      muted: false,
    },
    // These two ALWAYS show a dash, on purpose — `by_organization`/`by_region`
    // are per-cut breakdowns with thin cuts already suppressed for
    // k-anonymity (#109). Counting the array's length used to read as "how
    // many organizations/regions exist," which is wrong in the same
    // direction stage 7.4 kept finding defects in: it silently turns a
    // suppressed cut into a false zero rather than an honest "not shown."
    // Nothing this endpoint returns can honestly answer either question, so
    // both tiles state that plainly instead.
    {
      testId: 'home-stat-organizations',
      label: t('home.stats.organizations.label'),
      value: DASH,
      icon: <Users className="w-6 h-6 text-[#2E7D4F]" />,
      note: t('home.stats.organizations.note'),
      muted: true,
    },
    {
      testId: 'home-stat-regions',
      label: t('home.stats.regions.label'),
      value: DASH,
      icon: <MapPin className="w-6 h-6 text-[#2E7D4F]" />,
      note: t('home.stats.regions.note'),
      muted: true,
    },
  ];


  return (
    <div className="relative">
      <LandingBackground />
      {inRouter && <HashScroller />}

      {/* ── 0. HERO SLIDER ──────────────────────────────────────────
          Full-bleed: `PublicLayout` wraps page content in
          `<main className="max-w-7xl mx-auto px-6 py-10">`, but the approved
          hero (`design-canvas/Main.dc.html`) spans the full viewport width
          flush against the header. The classic "break out of a centered
          container" trick (`left-1/2 -mx-[50vw] w-screen`) gets there;
          `-mt-10` cancels the parent's own `py-10` so the hero sits flush
          under the header, matching the negative-margin overlap the
          quick-check strip below it needs too. `PublicLayout` renders no
          hero of its own — this is the only one on the page. */}
      <div>
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-10">
          <HeroSlider onNavigate={onNavigate} />
        </div>
      </div>

      {/* ── 1. GIS MONITORING & VERIFICATION SECTION ─────────────────── */}
      <section
        ref={quickCheckRef}
        className={`relative z-20 -mt-20 sm:-mt-24 ${quickCheckInView ? 'reveal' : 'opacity-0'}`}
      >
        <GisMonitoringSection onNavigate={onNavigate} />
      </section>

      {/* ── 2. SIX DIRECTIONS ───────────────────────────────────────── */}
      <section 
        ref={activitiesRef} 
        className="relative left-1/2 -translate-x-1/2 w-screen z-10 mt-8 pt-10 sm:pt-14 pb-12 sm:pb-16 overflow-visible"
      >
        {/* Soft, faint Line-Art Pattern Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img 
            src={servicesPatternImg} 
            alt="Services Line-art Pattern" 
            className="w-full h-full object-cover object-center opacity-30 blur-[1px] brightness-95"
          />
          {/* Light softening veil for optimal text legibility */}
          <div className="absolute inset-0 bg-[#E6F4EA]/50 backdrop-blur-[0.5px] pointer-events-none" />
          {/* Gentle edge gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#E6F4EA]/60 via-transparent to-[#E6F4EA]" />
          {/* Top smooth blend from page background */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#E6F4EA] to-transparent pointer-events-none z-10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className={`text-center mb-8 ${activitiesInView ? 'reveal' : 'opacity-0'}`}>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F]">{t('home.activities.sectionBadge')}</span>
            <h2 className="text-3xl sm:text-[42px] leading-tight font-black text-[#1A1F24] mt-2 tracking-tight">
              <Typewriter text={t('home.activities.sectionTitle')} start={activitiesInView} />
            </h2>
            <p className="text-sm text-[#5A646D] mt-3 leading-relaxed max-w-xl mx-auto">{t('home.activities.sectionSubtitle')}</p>
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-[#2E7D4F] text-[#2E7D4F] bg-white/90 hover:!bg-[#2E7D4F] hover:!text-white font-bold shadow-xs transition-all duration-200"
                rightIcon={<ChevronRight className="w-4 h-4" />}
                onClick={() => onNavigate?.('activities')}
              >
                {t('home.activities.viewAllButton')}
              </Button>
            </div>
          </div>

          {servicesState.status === 'loading' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="home-activities-loading">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white/95 backdrop-blur-xs border border-[#D6E6DB] rounded-2xl overflow-hidden shadow-xs"
                >
                  <Skeleton height="h-[178px]" className="rounded-none" />
                  <div className="p-6 space-y-3">
                    <Skeleton height="h-6" width="w-3/4" />
                    <Skeleton height="h-4" width="w-full" />
                    <Skeleton height="h-4" width="w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {servicesState.status === 'error' && (
            <div data-testid="home-activities-error">
              <Alert variant="danger">{t('home.activities.failed')}</Alert>
            </div>
          )}

          {servicesState.status === 'ready' && servicesState.items.length === 0 && (
            <p className="text-xs text-[#5A646D]">{t('home.activities.empty')}</p>
          )}

          {servicesState.status === 'ready' && servicesState.items.length > 0 && (
            <div data-testid="home-activities" className="mt-8 relative left-1/2 -translate-x-1/2 w-[90vw]">
              <SkewedCarousel
                items={servicesState.items.map((svc, idx) => (
                  <DirectionCard
                    key={svc.id}
                    service={svc}
                    index={idx}
                    language={language}
                    t={t}
                    onNavigate={onNavigate}
                    inView={true}
                  />
                ))}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── 3. STATISTICS + RATING ──────────────────────────────────── */}
      <section 
        ref={statsRef} 
        className="relative left-1/2 -translate-x-1/2 w-screen py-14 sm:py-20 overflow-hidden bg-transparent"
      >
        <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={statsTerrainBgImg}
            alt=""
            className="w-full h-full object-cover object-center scale-[1.35]"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content Container aligned with site grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left side: Statistics Header & Cards (spans 7 columns on desktop) */}
            <div className="lg:col-span-7 flex flex-col space-y-8">
              {/* Header */}
              <div className={`text-left ${statsInView ? 'reveal' : 'opacity-0'}`}>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#A7E8C3]">
                  <Trees className="w-3.5 h-3.5" />
                  {sectionText.statsBadge}
                </span>
                <h2 className="mt-4 text-3xl sm:text-[42px] leading-tight font-black text-white tracking-tight">
                  <Typewriter text={sectionText.statsTitle} start={statsInView} />
                </h2>
                <p className="mt-3 text-sm sm:text-[15.5px] leading-relaxed text-[#D1E3D9] font-medium max-w-xl">
                  {sectionText.statsIntro} {t('home.opendata.kAnonymity.before')}{' '}
                  <b className="text-white">
                    {statsState.status === 'ready' ? statsState.data.k_anonymity_threshold : DASH}
                  </b>{' '}
                  {t('home.opendata.kAnonymity.after')}
                </p>
                {statsState.status === 'error' && (
                  <p className="mt-2 text-sm text-amber-300 font-bold">{t('home.opendata.unavailable')}</p>
                )}
              </div>

              {/* Grid of Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                {stats.map((st, idx) => (
                  <StatCardItem key={st.testId} st={st} idx={idx} />
                ))}
              </div>
            </div>

            {/* Right side: Calculator (spans 5 columns on desktop) */}
            <div ref={calcRef} className={`lg:col-span-5 w-full flex flex-col space-y-6 ${calcInView ? 'reveal' : 'opacity-0'}`}>
              <div className="text-left space-y-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#A7E8C3]">
                  <CalculatorIcon className="w-3.5 h-3.5" />
                  {t('tariffs.header.badge')}
                </span>
                <h2 id="calculator-heading" className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  <Typewriter text={t('tariffs.header.title')} start={calcInView} />
                </h2>
                <p className="text-xs sm:text-[13px] text-[#D1E3D9] leading-relaxed font-medium">{t('tariffs.header.subtitle')}</p>
              </div>
              <div className="relative z-10 w-full">
                <PriceCalculator />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. ACTIVITY SEASONS SCHEDULE ───────────────────────────── */}
      {shouldRenderSeasons && (
        <section
          ref={seasonsRef}
          data-testid="home-seasons"
          className="relative z-10 left-1/2 -translate-x-1/2 w-screen -mt-px pt-6 sm:pt-10 pb-24 sm:pb-32 border-0 overflow-hidden"
          style={{
            backgroundColor: '#F5FBFC',
          }}
        >
          {/* Clean Light Background for Seasons Section */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#F5FBFC]">
            {/* Top smooth blend from Section 3 */}
          </div>

          <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 ${seasonsInView ? 'reveal' : 'opacity-0'}`}>
            <SeasonStrip windows={seasonWindows} inView={seasonsInView} />
          </div>
        </section>
      )}

      {/* ── 8. PORTAL QUALITY RATING SURVEY (Baholash) ───────────────── */}
      {true && (
        <section className="relative z-10 left-1/2 -translate-x-1/2 w-screen -mt-px bg-[#F5FBFC] pt-6 pb-8 sm:pb-12">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="relative rounded-[2rem] overflow-hidden border border-white/10 flex flex-col lg:flex-row items-stretch bg-[#123522]"
            >
              {/* Full-bleed background for the entire unified card */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <img
                  src={lightRatingBgImg}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover object-center opacity-70 scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(18,53,34,0.90) 0%, rgba(18,53,34,0.65) 50%, rgba(18,53,34,0.85) 100%)',
                  }}
                />
              </div>

              {/* Left Side: Rating Band (Stats) */}
              <div className="w-full lg:w-[35%] shrink-0 relative z-10 p-6 lg:py-7 lg:px-10 flex items-start justify-center lg:border-r border-white/10">
                <div className="relative w-full">
                  <RatingBand state={ratingState} inline />
                </div>
              </div>

              {/* Right Side: Portal Rating Survey (Dark Glassmorphism) */}
              <div className="w-full lg:flex-1 relative z-10 p-6 lg:py-7 lg:px-10 flex items-start justify-center">
                <div className="w-full">
                  <PortalRatingSurvey variant="dark" className="!p-0 !bg-transparent !border-none !shadow-none" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

interface StatCardItemData {
  testId: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  note: string;
  muted: boolean;
}

function StatCardItem({ st, idx }: { st: StatCardItemData; idx: number }) {
  const [cardRef, cardInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const isLower = idx % 2 === 1;

  return (
    <div
      ref={cardRef}
      className={`${cardInView ? 'reveal' : 'opacity-0'} ${isLower ? 'sm:mt-8 lg:mt-10' : 'sm:mt-0'}`}
      style={{
        animationDelay: `${idx * 0.18}s`,
        animationFillMode: 'both',
      }}
    >
      <div
        data-testid={st.testId}
        className="group relative bg-gradient-to-br from-[#0B2317]/80 to-[#04120A]/90 backdrop-blur-[32px] border border-white/15 hover:border-white/30 hover:bg-gradient-to-br hover:from-[#123522]/80 hover:to-[#0B2317]/90 rounded-2xl p-5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_22px_50px_rgba(52,211,153,0.3)] hover:-translate-y-2.5 transition-all duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden h-full"
      >
        {/* Ambient corner light */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#34D399]/15 rounded-full blur-2xl group-hover:bg-[#34D399]/30 transition-colors pointer-events-none" />

        {/* Top row: Icon + Live / Verified badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0F2D1D]/80 border border-white/10 flex items-center justify-center text-[#34D399] shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),0_0_15px_rgba(52,211,153,0.15)] group-hover:scale-105 group-hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),0_0_20px_rgba(52,211,153,0.3)] transition-all duration-500">
            {st.icon}
          </div>
          {idx < 2 ? (
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#6EE7B7] bg-[#0A2E16]/80 px-2.5 py-0.5 rounded-full border border-[#34D399]/30 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              {idx === 0 ? 'Reyestr' : 'GIS'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/60 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
              Maxfiy
            </span>
          )}
        </div>

        {/* Value */}
        <div
          className={`font-sans text-2xl sm:text-[25px] font-black tracking-tight leading-tight transition-colors ${
            st.muted ? 'text-white/40' : 'text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)] group-hover:drop-shadow-[0_2px_16px_rgba(255,255,255,0.4)]'
          }`}
        >
          {st.value}
        </div>

        {/* Label */}
        <div className="mt-1.5 text-[13px] font-bold text-white/90 leading-snug">
          {st.label}
        </div>

        {/* Note */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-[#A7F3D0]/70 leading-relaxed line-clamp-1">
            {st.note}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * One of the six illustrated direction cards (Task 9). Ported from
 * `design-canvas/Main.dc.html`'s card markup: a `<Scene>` fills the top
 * band (keyed off the activity's own `code`, and drawn only when the art
 * set actually covers it), a processing-term pill and an index badge sit
 * over it, then the name, description and an apply link below.
 *
 * The apply link opens `applicant_wizard`, the same page `ServicesPage`'s
 * own card opens. The two used to differ — this one went to `auth_login`,
 * which lands a visitor on the cabinet's front door instead of the form
 * they pressed a button to reach.
 */
function DirectionCard({
  service,
  index,
  language,
  t,
  onNavigate,
  inView = true,
}: {
  service: Service;
  index: number;
  language: string;
  t: (key: string) => string;
  onNavigate?: (page: string, params?: any) => void;
  inView?: boolean;
}) {
  const description = pickLocalized(service.description, language);
  const isTopRow = index < 3;
  const animClass = inView ? (isTopRow ? 'reveal-left' : 'reveal-right') : 'opacity-0';
  const delay = isTopRow
    ? `${(index % 3) * 0.12}s`
    : `${(index % 3) * 0.12 + 0.08}s`;

  return (
    <div
      data-testid="direction-card"
      className={`group card-lift ${animClass} bg-white border border-[#D6E6DB] hover:border-[#2E7D4F]/50 rounded-2xl overflow-hidden shadow-[0_6px_24px_rgba(18,53,34,0.05)] hover:shadow-[0_18px_40px_rgba(18,53,34,0.16)] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]`}
      style={{ animationDelay: delay }}
    >
      <div className="relative h-[185px] overflow-hidden bg-[#EAF3EC]">
        <div className="thumb-zoom absolute inset-0">
          {isSceneKind(service.code) && (
            <>
              {SERVICE_IMAGES[service.code] && (
                <img
                  src={SERVICE_IMAGES[service.code]}
                  alt={pickLocalized(service.name, language)}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              )}
              <div className={SERVICE_IMAGES[service.code] ? 'hidden' : 'w-full h-full'}>
                <Scene kind={service.code} height={185} />
              </div>
            </>
          )}
        </div>
        {/* Subtle gradient overlay to give depth and highlight badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

        {/* The real processing term (`processing_days`, ruling #138) where a
            hand-typed badge ("Most in demand", "Seasonal"...) used to sit —
            those made no claim the system could back up. */}
        <div className="absolute left-3.5 bottom-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F]" />
          <span className="text-[11px] font-bold text-[#123522]">
            {service.processing_days} {t('home.activities.daysUnit')}
          </span>
        </div>
        <div className="absolute right-3.5 top-3.5 w-7 h-7 rounded-lg bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center text-[11px] font-extrabold text-[#23653F]">
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-[15.5px] font-bold text-[#123522] tracking-tight">{pickLocalized(service.name, language)}</h3>
        {/* `description` is nullable (two of six rows have none, on purpose —
            see `api/services.ts`); no placeholder sentence stands in for it. */}
        {description && (
          <p className="mt-2 text-[12.5px] leading-relaxed text-[#5A646D] min-h-[56px]">{description}</p>
        )}
        <div className="mt-3.5 pt-3 border-t border-[#EDF3EF] flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate?.('applicant_wizard', { activity: service.id })}
            className="text-[12.5px] font-bold text-[#2E7D4F] group-hover:text-[#23653F] hover:underline"
          >
            {t('home.activities.applyLink')}
          </button>
          <ChevronRight className="w-4 h-4 text-[#2E7D4F] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
