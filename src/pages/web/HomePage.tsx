import React, { useEffect, useState, useCallback } from 'react';
import { Link, useInRouterContext, useLocation } from 'react-router';
import {
  Search,
  QrCode,
  ArrowRight,
  FileCheck2,
  Users,
  Trees,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Sparkles,
  UserRound,
  Map as MapIcon,
  Calculator as CalculatorIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/FormControls';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { SkewedCarousel } from '../../components/ui/SkewedCarousel';
import { Typewriter } from '../../components/ui/Typewriter';
import { CALCULATOR_ANCHOR, PriceCalculator } from '../../components/calculator/PriceCalculator';
import { HeroSlider } from '../../components/home/HeroSlider';
import { LandingBackground } from '../../components/home/LandingBackground';
import { RatingBand, fetchRatingSummary, type RatingBandState } from '../../components/home/RatingBand';
import { PortalRatingSurvey } from '../../components/home/PortalRatingSurvey';
import { SeasonStrip } from '../../components/home/SeasonStrip';
import { Scene, SCENE_KINDS, type SceneKind } from '../../components/art/Scene';
import { SERVICE_IMAGES } from '../../assets/img/services';
import contactBgImage from '../../assets/img/contact-bg.jpg';
import statsBgImage from '../../assets/img/stats-bg.jpg';
import servicesPatternImg from '../../assets/img/services-pattern.jpg';
import darkGisTopoImg from '../../assets/img/dark_gis_topo.jpg';
import { useLanguage, useT } from '../../i18n/useT';
import type { UiLanguage } from '../../i18n/context';
import { api } from '../../api/client';
import { fetchNews, formatNewsDate, HOME_NEWS_COUNT, type NewsItem } from '../../api/news';
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

type NewsState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: NewsItem[] };

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
      'Oʻrmon xoʻjaligi ochiq deb belgilagan GIS qatlamlarini xaritada koʻrishingiz mumkin: kontur chegarasi, maydoni va nomi. Bandlik holati bu yerda koʻrsatilmaydi.',
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

const SafeLink: React.FC<React.ComponentProps<typeof Link>> = ({ to, children, ...props }) => {
  const inRouter = useInRouterContext();
  if (!inRouter) {
    return (
      <a href={typeof to === 'string' ? to : '#'} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} {...props}>
      {children}
    </Link>
  );
};

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

const FORESTRY_HOTSPOTS = [
  { id: 1, name: "Burchmulla o'rmon xo'jaligi", area: '1 420 ga', type: 'Muhofaza etiladigan hudud', x: '74%', y: '47%' },
  { id: 2, name: 'Chotqol davlat biosfera', area: '4 560 ga', type: 'Tabiiy oʻrmon fondi', x: '27%', y: '35%' },
  { id: 3, name: "Zomin tog'-o'rmon qo'riqxonasi", area: '2 850 ga', type: 'Davlat oʻrmon yerlari', x: '52%', y: '79%' },
];

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
  const [calcRef, calcInView] = useInView<HTMLElement>({ threshold: 0.06 });
  const [mapRef, mapInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [newsRef, newsInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [quickSeries, setQuickSeries] = useState('');
  const [quickNumber, setQuickNumber] = useState('');
  const [statsState, setStatsState] = useState<StatsState>({ status: 'loading' });
  const [mapMode, setMapMode] = useState<'street' | 'satellite' | 'topo'>('satellite');
  const [activePin, setActivePin] = useState<number | null>(null);

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

  // The three news items used to be constants in the translation files — three
  // announcements written once, dated August 2026, under a heading that says
  // "news". They now come from the announcements module's anonymous route, and
  // the section says plainly when there is nothing to show rather than
  // inventing something (same posture as the statistics above).
  const [newsState, setNewsState] = useState<NewsState>({ status: 'loading' });
  const [slideIndex, setSlideIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchNews({ page: 1, pageSize: HOME_NEWS_COUNT });
        if (!cancelled) {
          if (data && Array.isArray(data.items)) {
            setNewsState({ status: 'ready', items: data.items });
            // Initialize slideIndex to items.length (start of middle set) when >= 3
            if (data.items.length >= 3) {
              setSlideIndex(data.items.length);
            }
          } else {
            setNewsState({ status: 'error' });
          }
        }
      } catch {
        if (!cancelled) setNewsState({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-enable transition after boundary wrap
  useEffect(() => {
    if (!enableTransition) {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setEnableTransition(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [enableTransition]);

  // Auto-advance news swiper steadily every 3.8 seconds ("slide bir tekisda aylanib tursin")
  useEffect(() => {
    if (newsState.status !== 'ready') return;
    const items = newsState.items ?? [];
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      if (items.length >= 3) {
        setIsTransitioning(true);
        setSlideIndex((prev) => prev + 1);
      } else {
        setSlideIndex((prev) => (prev + 1) % items.length);
      }
    }, 3800);

    return () => clearInterval(timer);
  }, [newsState]);

  const handlePrevNews = useCallback(() => {
    if (newsState.status !== 'ready') return;
    const items = newsState.items ?? [];
    if (items.length <= 1 || isTransitioning) return;

    if (items.length >= 3) {
      setIsTransitioning(true);
      setSlideIndex((prev) => prev - 1);
    } else {
      setSlideIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  }, [newsState, isTransitioning]);

  const handleNextNews = useCallback(() => {
    if (newsState.status !== 'ready') return;
    const items = newsState.items ?? [];
    if (items.length <= 1 || isTransitioning) return;

    if (items.length >= 3) {
      setIsTransitioning(true);
      setSlideIndex((prev) => prev + 1);
    } else {
      setSlideIndex((prev) => (prev + 1) % items.length);
    }
  }, [newsState, isTransitioning]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (newsState.status !== 'ready') return;
    const items = newsState.items ?? [];
    const count = items.length;
    if (count < 3) return;

    // Invisible seamless boundary reset
    if (slideIndex >= 2 * count) {
      setEnableTransition(false);
      setSlideIndex(slideIndex - count);
    } else if (slideIndex < count) {
      setEnableTransition(false);
      setSlideIndex(slideIndex + count);
    }
  };

  const handleDotClick = (targetIdx: number) => {
    if (newsState.status !== 'ready' || isTransitioning) return;
    const items = newsState.items ?? [];
    const count = items.length;
    if (count < 3) {
      setSlideIndex(targetIdx);
      return;
    }
    setIsTransitioning(true);
    setSlideIndex(count + targetIdx);
  };

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

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = `${quickSeries.trim()} ${quickNumber.trim()}`.trim();
    onNavigate?.('verify', query ? { query } : undefined);
  };

  return (
    <div className="relative space-y-16">
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
      <div className="!mb-0 mb-0">
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-10">
          <HeroSlider onNavigate={onNavigate} />
        </div>

        {/* ── 1. QUICK CHECK & APPLICATION STEPS UNIFIED CARD ────────── */}
        <section
          ref={quickCheckRef}
          className={`relative z-20 -mt-14 sm:-mt-16 !mb-0 mb-0 ${quickCheckInView ? 'reveal' : 'opacity-0'}`}
        >
          <div className="bg-white/95 backdrop-blur-xs border border-[#D6E6DB] rounded-2xl sm:rounded-3xl shadow-[0_16px_40px_rgba(18,53,34,0.08)] p-5 sm:p-7">
            {/* Top: Quick Check Form */}
            <form
              onSubmit={handleQuickSearch}
              className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-5"
            >
              <div className="flex items-center gap-3.5 shrink-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#F0F7F1] text-[#2E7D4F] flex items-center justify-center">
                  <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-[15px] font-extrabold text-[#1A1F24]">{sectionText.quickCheckTitle}</div>
                  <div className="text-xs text-[#5A646D]">{sectionText.quickCheckSubtitle}</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 flex-1">
                <div className="sm:w-32 shrink-0">
                  <Input
                    aria-label={sectionText.quickCheckSeriya}
                    placeholder={sectionText.quickCheckSeriya}
                    value={quickSeries}
                    onChange={(e) => setQuickSeries(e.target.value)}
                    touchSize
                  />
                </div>
                <div className="flex-1">
                  <Input
                    aria-label={sectionText.quickCheckNumber}
                    placeholder={sectionText.quickCheckNumber}
                    value={quickNumber}
                    onChange={(e) => setQuickNumber(e.target.value)}
                    touchSize
                  />
                </div>
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  className="font-bold shadow-md bg-[#2E7D4F] hover:bg-[#23653F] shrink-0"
                  leftIcon={<Search className="w-4 h-4" />}
                >
                  {sectionText.quickCheckButton}
                </Button>
              </div>
            </form>

            {/* Subtle Divider Line */}
            <div className="my-5 sm:my-6 border-t border-[#E8F0EA]" />

            {/* Bottom: Steps Header & Subtitle */}
            <div className="flex items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5ED] text-[#23653F] text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#2E7D4F]" />
                  {t('home.steps.sectionTitle')}
                </span>
                <span className="text-[12px] text-[#5A646D] hidden sm:inline">
                  • {t('home.steps.sectionSubtitle')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate?.('applicant_wizard')}
                className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#2E7D4F] hover:text-[#1B5E20] hover:underline cursor-pointer"
              >
                <span>{t('home.activities.applyLink')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Steps Grid inside the unified card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { Icon: UserRound, step: '01', bg: 'from-[#0F3822] to-[#1A5C37]', desc: t('home.steps.01.desc') },
                { Icon: MapIcon,   step: '02', bg: 'from-[#154A2B] to-[#206E3F]', desc: t('home.steps.02.desc') },
                { Icon: CalculatorIcon, step: '03', bg: 'from-[#1B5C35] to-[#28804D]', desc: t('home.steps.03.desc') },
                { Icon: QrCode,    step: '04', bg: 'from-[#237443] to-[#2EA862]', desc: t('home.steps.04.desc') },
              ].map(({ Icon, step, bg, desc }, idx) => (
                <div
                  key={idx}
                  className="relative group bg-[#F7FAF8] hover:bg-[#EFF6F1] border border-[#E0EBE2] hover:border-[#2E7D4F]/40 rounded-xl p-3.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${bg} flex items-center justify-center shrink-0 shadow-xs`}>
                          <Icon className="w-3.5 h-3.5 text-[#A7F3D0]" />
                        </div>
                        <span className="text-[10px] font-extrabold text-[#2E7D4F] uppercase tracking-wider">
                          {t('home.steps.stepPrefix')} {step}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-bold text-[#7D8A82] bg-white px-2 py-0.5 rounded-full border border-[#DCE7DF] shadow-xs">
                        {idx + 1}/4
                      </span>
                    </div>

                    <div className="text-[12.5px] font-bold text-[#123522] leading-snug">
                      {t(`home.steps.0${idx + 1}.title`)}
                    </div>
                    <p className="text-[11px] text-[#5A646D] leading-relaxed mt-1">
                      {desc}
                    </p>
                  </div>

                  {/* Arrow connecting to next step on desktop */}
                  {idx < 3 && (
                    <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full bg-white border border-[#D0E0D4] items-center justify-center text-[#2E7D4F] shadow-xs pointer-events-none group-hover:border-[#2E7D4F] transition-colors">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 2. SIX DIRECTIONS ───────────────────────────────────────── */}
      <section 
        ref={activitiesRef} 
        className="relative left-1/2 -translate-x-1/2 w-screen z-10 mt-6 sm:mt-8 pt-10 sm:pt-14 !mb-0 mb-0 pb-16 sm:pb-20 overflow-visible"
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
          <div className="absolute inset-0 bg-gradient-to-b from-[#E6F4EA]/60 via-transparent to-[#E6F4EA]/40" />
          {/* Top smooth blend from page background */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#E6F4EA] to-transparent pointer-events-none z-10" />
          {/* Seamless Bottom Gradient Blend into Section 3 (Medium Green) */}
          <div className="absolute bottom-0 inset-x-0 h-20 sm:h-32 bg-gradient-to-b from-transparent to-[#225336] pointer-events-none z-10" />
        </div>

        {/* Smudge blur layer for a completely seamless scattered transition into Section 3 */}
        <div className="absolute bottom-[-32px] inset-x-0 h-[64px] bg-[#225336] blur-[24px] pointer-events-none z-0" />

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
        className="relative left-1/2 -translate-x-1/2 w-screen !-mt-[1px] mb-0 pt-16 sm:pt-20 pb-28 sm:pb-40 overflow-hidden"
      >
        {/* Full-width Screen Background Image (Clear, Bright, No Dark Overlay) */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          style={{ maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 90%)' }}
        >
          <img 
            src={statsBgImage} 
            alt="Forest Statistics & Digital Analytics" 
            className="w-full h-full object-cover object-center opacity-100 scale-105 transition-transform duration-1000 hover:scale-100"
          />
          {/* Main vignette layer for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B2317]/30 via-transparent to-[#0B2317]/50 pointer-events-none z-0" />
          {/* Seamless Top Gradient Blend coming from Section 2 (Medium Green) */}
          <div className="absolute top-0 inset-x-0 h-20 sm:h-32 bg-gradient-to-b from-[#225336] to-transparent pointer-events-none z-10" />
        </div>

        {/* Seamless Bottom Gradient Blend into Section 4 (Light Green #D9EDDF) - generous dissolve into solid base */}
        <div className="absolute bottom-0 inset-x-0 h-48 sm:h-72 bg-gradient-to-b from-transparent via-[#D9EDDF]/70 via-60% to-[#D9EDDF] pointer-events-none z-0" />
        <div className="absolute bottom-0 inset-x-0 h-16 sm:h-24 bg-[#D9EDDF] pointer-events-none z-0" />

        {/* Content Container aligned with site grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`max-w-3xl mx-auto mb-10 text-center ${statsInView ? 'reveal' : 'opacity-0'}`}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#123522]/80 border border-[#34D399]/40 text-xs font-bold uppercase tracking-wider text-[#6EE7B7] backdrop-blur-md shadow-md">
              <Trees className="w-3.5 h-3.5 text-[#34D399]" />
              {sectionText.statsBadge}
            </span>
            <h2 className="mt-4 text-3xl sm:text-[42px] leading-tight font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {sectionText.statsTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-[15.5px] leading-relaxed text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] max-w-xl mx-auto">
              {sectionText.statsIntro} {t('home.opendata.kAnonymity.before')}{' '}
              <b className="text-white underline decoration-[#34D399]">
                {statsState.status === 'ready' ? statsState.data.k_anonymity_threshold : DASH}
              </b>{' '}
              {t('home.opendata.kAnonymity.after')}
            </p>
            {statsState.status === 'error' && (
              <p className="mt-2 text-sm text-[#FCD34D] font-bold drop-shadow">{t('home.opendata.unavailable')}</p>
            )}
          </div>

          {/* Grid of Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {stats.map((st, idx) => {
              const isLower = idx % 2 === 1;
              return (
                <div
                  key={st.testId}
                  className={`${statsInView ? 'reveal' : 'opacity-0'} ${isLower ? 'sm:mt-8 lg:mt-10' : 'sm:mt-0'}`}
                  style={{ animationDelay: `${idx * 0.12}s` }}
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
            })}
          </div>

          {/* Integrated Rating Band INSIDE the full-bleed section */}
          <div className={`mt-10 pt-6 border-t border-white/20 ${statsInView ? 'reveal' : 'opacity-0'}`} style={{ animationDelay: '0.45s' }}>
            <RatingBand state={ratingState} />
          </div>
        </div>
      </section>

      {/* ── 4. ACTIVITY SEASONS SCHEDULE ───────────────────────────── */}
      {shouldRenderSeasons && (
        <section
          ref={seasonsRef}
          data-testid="home-seasons"
          className="relative left-1/2 -translate-x-1/2 w-screen pt-16 sm:pt-24 pb-20 sm:pb-28 border-0 overflow-hidden"
          style={{
            backgroundColor: '#D9EDDF',
            marginTop: 'calc(-4rem - 1px)',
          }}
        >
          {/* Faint Botanical Line-Art Pattern Background Image (matching Section 2) */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img 
              src={servicesPatternImg} 
              alt="Mavsumlar jadvali pattern" 
              className="w-full h-full object-cover object-center opacity-30 blur-[0.5px] brightness-95"
            />
            {/* Light softening veil for optimal matrix legibility */}
            <div className="absolute inset-0 bg-[#D9EDDF]/50 backdrop-blur-[0.5px] pointer-events-none" />
            {/* Gentle edge gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#D9EDDF]/60 via-transparent to-[#D9EDDF]/40 pointer-events-none" />
            {/* Top smooth blend from Section 3 */}
            <div className="absolute top-0 inset-x-0 h-20 sm:h-32 bg-gradient-to-b from-[#D9EDDF] to-transparent pointer-events-none z-10" />
            {/* Seamless Bottom Gradient Blend into Section 5b (Dark #0a2015) */}
            <div className="absolute bottom-0 inset-x-0 h-24 sm:h-36 bg-gradient-to-b from-transparent to-[#0a2015] pointer-events-none z-10" />
          </div>

          <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 ${seasonsInView ? 'reveal' : 'opacity-0'}`}>
            <SeasonStrip windows={seasonWindows} />
          </div>
        </section>
      )}

      {/* ── 5b. PRICE CALCULATOR ───────────────────────────────────── */}
      {/* Was its own `/tariffs` screen until the news register took that slot
          in the header. It is one form over two anonymous endpoints, and a
          visitor who wants a figure now gets it without leaving the page. */}
      <section
        ref={calcRef}
        aria-labelledby="calculator-heading"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen z-20 overflow-hidden"
        style={{
          marginTop: 'calc(-4rem - 1px)',
          backgroundImage: `url(${contactBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#0a2015]/40 pointer-events-none z-0" />
        {/* Top & Bottom seamless gradient shadow overlays */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#0a2015] via-[#0a2015]/70 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#0a2015]/70 to-[#0a2015] pointer-events-none z-10" />
        <div className={`relative max-w-7xl mx-auto px-6 py-10 sm:py-14 space-y-6 ${calcInView ? 'reveal' : 'opacity-0'}`}>
          <div className="relative z-10 text-center space-y-2 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-[11px] font-bold uppercase tracking-wider text-[#9CE3AE] shadow-xs backdrop-blur-sm">
              <CalculatorIcon className="w-3 h-3 text-[#9CE3AE]" />
              {t('tariffs.header.badge')}
            </span>
            <h2 id="calculator-heading" className="text-3xl sm:text-[42px] font-black text-white tracking-tight drop-shadow-md text-center">
              {t('tariffs.header.title')}
            </h2>
            <p className="text-xs sm:text-[13px] text-[#C4D8C9] leading-relaxed">{t('tariffs.header.subtitle')}</p>
          </div>
          <div className="relative z-10">
            <PriceCalculator />
          </div>
        </div>
      </section>

      {/* ── 6. MAP BAND ──────────────────────────────────────────────
          Decorative preview only — the interactive map (maplibre, the real
          contours) lives at `/map`, a screen a different track owns. */}
      {/* ── 6. MAP BAND ──────────────────────────────────────────────
          Decorative preview only — the interactive map (maplibre, the real
          contours) lives at `/map`, a screen a different track owns. */}
      {/* ── 6. MAP BAND ──────────────────────────────────────────────
          Decorative preview only — the interactive map (maplibre, the real
          contours) lives at `/map`, a screen a different track owns. */}
      <section
        ref={mapRef as any}
        className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen z-10 py-16 sm:py-20 lg:py-24 overflow-hidden ${mapInView ? 'reveal' : 'opacity-0'}`}
        style={{
          marginTop: 'calc(-4rem - 1px)',
          backgroundColor: '#071A0E',
          backgroundImage: `url(${darkGisTopoImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for contrast, depth and mood */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071A0E]/70 via-[#071A0E]/50 to-[#071A0E]/80 pointer-events-none z-0" />

        {/* Top blend to connect seamlessly with Section 5b (Calculator) */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#0a2015] via-[#0a2015]/60 to-transparent pointer-events-none z-10" />

        {/* Bottom smooth fade into the light green landing background */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-b from-transparent via-[#071A0E]/50 to-[#D8ECDE] pointer-events-none z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] lg:rounded-[28px] overflow-hidden border border-white/20 bg-[#081E12]/85 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] grid grid-cols-1 lg:grid-cols-2">
            {/* Left side: Information & Controls */}
            <div
              className="relative p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden"
              style={{
                backgroundImage: `url(${darkGisTopoImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'left center',
              }}
            >
              {/* Subtle dark gradient overlay to guarantee text contrast and smooth glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#06180D]/85 via-[#0A2315]/75 to-[#0E2C1B]/80 pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#4ADE80]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#9CE3AE] backdrop-blur-md">
                  {sectionText.mapBadge}
                </span>
                <h2 className="mt-4 text-2xl sm:text-[32px] leading-tight font-black text-white tracking-tight drop-shadow-md">
                  {sectionText.mapTitle}
                </h2>
                <p className="mt-4 text-sm sm:text-[15.5px] leading-relaxed text-[#D2E7DA] drop-shadow-xs">
                  {sectionText.mapDescription}
                </p>
              </div>

              <div className="relative z-10 mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate?.('map')}
                  className="inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-[#2E7D4F] hover:bg-[#23653F] text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{sectionText.mapCtaPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('map')}
                  className="inline-flex items-center h-12 px-5 rounded-xl border border-white/30 text-white text-sm font-bold hover:bg-white/10 hover:border-white/50 transition-colors cursor-pointer backdrop-blur-xs"
                >
                  {sectionText.mapCtaSecondary}
                </button>
              </div>
            </div>

            {/* Right side: Interactive Multi-mode GIS Map with live controls and hotspot markers */}
            <div className="relative bg-[#0D2417] min-h-[360px] sm:min-h-[440px] overflow-hidden flex items-center justify-center">
              {/* Smooth gradient blend on the left edge into the card on desktop */}
              <div className="hidden lg:block absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#081E12] via-[#081E12]/60 to-transparent pointer-events-none z-10" />

              {/* Real Live Map embed matching active mode */}
              <iframe
                key={mapMode}
                title={`GIS xaritasi — ${mapMode}`}
                src={
                  mapMode === 'satellite'
                    ? 'https://maps.google.com/maps?q=41.45,69.85&t=k&z=10&ie=UTF8&iwloc=&output=embed'
                    : mapMode === 'topo'
                      ? 'https://www.openstreetmap.org/export/embed.html?bbox=69.60%2C41.35%2C70.25%2C41.70&layer=cyclemap'
                      : 'https://www.openstreetmap.org/export/embed.html?bbox=68.90%2C41.10%2C69.65%2C41.45&layer=mapnik'
                }
                className="w-full h-full min-h-[360px] sm:min-h-[440px] border-0"
                loading="lazy"
              />

              {/* Top Floating Control Bar */}
              <div className="absolute top-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                {/* Status chip */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D2417]/90 backdrop-blur-md border border-[#2E7D4F]/50 shadow-lg text-[11px] font-bold text-white pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse shrink-0" />
                  <span className="whitespace-nowrap">
                    {mapMode === 'satellite'
                      ? t('home.map.satellite')
                      : mapMode === 'topo'
                        ? t('home.map.topo')
                        : t('home.map.osm')}
                  </span>
                </div>

                {/* Layer Switcher */}
                <div className="flex items-center gap-1 bg-[#0A1D13]/90 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg pointer-events-auto">
                  {(
                    [
                      { id: 'street', label: t('home.map.mode.street') },
                      { id: 'satellite', label: t('home.map.mode.satellite') },
                      { id: 'topo', label: t('home.map.mode.topo') },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setMapMode(mode.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        mapMode === mode.id
                          ? 'bg-[#2E7D4F] text-white shadow-xs scale-[1.02]'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive GIS Hotspot Pins */}
              {FORESTRY_HOTSPOTS.map((spot) => (
                <div
                  key={spot.id}
                  style={{ left: spot.x, top: spot.y }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
                  onMouseEnter={() => setActivePin(spot.id)}
                  onMouseLeave={() => setActivePin(null)}
                  onClick={() => setActivePin(activePin === spot.id ? null : spot.id)}
                >
                  <div className="relative group/pin">
                    <span className="absolute -inset-1.5 rounded-full bg-[#4ADE80]/35 animate-ping" />
                    <div className="relative w-5 h-5 rounded-full bg-[#123522] border-2 border-[#4ADE80] flex items-center justify-center text-white shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                    </div>

                    {/* Popover Card */}
                    {activePin === spot.id && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2.5 rounded-xl bg-[#0D2618]/95 backdrop-blur-md border border-[#2E7D4F]/60 shadow-xl text-white z-30 pointer-events-none">
                        <div className="text-xs font-black text-white">{spot.name}</div>
                        <div className="mt-0.5 text-[10px] text-[#A3E5B5] flex items-center justify-between">
                          <span>{t('home.map.area')}</span>
                          <span className="font-bold font-mono">{spot.area}</span>
                        </div>
                        <div className="text-[9.5px] text-white/60 mt-0.5">{spot.type}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Bottom Floating Bar */}
              <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
                {/* Coordinates HUD chip */}
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] text-[#A8D5B5] font-mono border border-white/10 pointer-events-auto">
                  <span>41°32'N 69°58'E</span>
                  <span className="text-white/30">•</span>
                  <span>1:50 000</span>
                </div>

                {/* Full-screen CTA button */}
                <button
                  type="button"
                  onClick={() => onNavigate?.('map')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#123522]/90 hover:bg-[#123522] text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg transition-all hover:scale-105 cursor-pointer pointer-events-auto ml-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#9CE3AE]" />
                  <span>{t('home.map.openFull')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. NEWS & ANNOUNCEMENTS — 3-CARD SWIPER ──────────────────── */}
      <section ref={newsRef} className="relative z-20">
        <div className={`text-center mb-8 mt-4 ${newsInView ? 'reveal' : 'opacity-0'}`}>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0F7F1] border border-[#D9EBDC] text-[10px] font-bold uppercase tracking-wider text-[#23653F]">
            {t('home.news.badge')}
          </span>
          <h2 className="mt-2 text-3xl sm:text-[42px] leading-tight font-black text-[#123522] tracking-tight">
            {t('home.news.sectionTitle')}
          </h2>
          <div className="mt-3 flex justify-center">
            <SafeLink
              to="/news"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2E7D4F] hover:text-[#1B5E20] hover:underline transition-colors"
            >
              <span>{t('home.news.viewAllLink')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </SafeLink>
          </div>
        </div>

        <div
          data-testid="home-news"
          className="relative group/swiper px-1 sm:px-2"
        >
          {/* Side Arrow Buttons (positioned on the sides of the cards) */}
          {newsState.status === 'ready' && (newsState.items ?? []).length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevNews}
                aria-label="Oldingi yangilik"
                className="absolute -left-2 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#D5E6DA] hover:border-[#2E7D4F] text-[#123522] hover:text-[#2E7D4F] hover:bg-[#F0F7F1] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextNews}
                aria-label="Keyingi yangilik"
                className="absolute -right-2 sm:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#D5E6DA] hover:border-[#2E7D4F] text-[#123522] hover:text-[#2E7D4F] hover:bg-[#F0F7F1] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {newsState.status === 'loading' && <p className="text-xs text-[#5A646D]">{t('home.news.loading')}</p>}
          {newsState.status === 'error' && <p className="text-xs text-[#92400E]">{t('home.news.failed')}</p>}
          {newsState.status === 'ready' && (newsState.items ?? []).length === 0 && (
            <p className="text-xs text-[#5A646D]">{t('home.news.empty')}</p>
          )}

          {/* 1 Item view */}
          {newsState.status === 'ready' && (newsState.items ?? []).length === 1 && (
            <div className="max-w-xl mx-auto py-2">
              {(newsState.items ?? []).map((item) => (
                <SafeLink
                  key={item.id}
                  to={`/news/${item.id}`}
                  data-testid={`home-news-${item.id}`}
                  className={`block bg-white border-2 border-[#2E7D4F]/60 rounded-2xl overflow-hidden shadow-[0_16px_36px_rgba(18,53,34,0.12)] ring-4 ring-[#2E7D4F]/10 hover:shadow-[0_22px_44px_rgba(18,53,34,0.16)] transition-all duration-300 group ${newsInView ? 'reveal' : 'opacity-0'}`}
                >
                  <div className="h-2 bg-gradient-to-r from-[#1B5E20] via-[#34D399] to-[#2E7D4F]" />
                  <div className="p-6 sm:p-7 flex flex-col justify-between min-h-[220px]">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs text-[#767F87] font-semibold">{formatNewsDate(item.publish_from)}</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] text-[#1E5631] text-[10.5px] font-extrabold uppercase tracking-wide border border-[#C2E3CB]">
                          <Sparkles className="w-3 h-3 text-[#2E7D4F]" /> {t('home.news.urgent')}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-[#123522] group-hover:text-[#1E6B3D] transition-colors leading-snug">
                        {pickLocalized(item.title, language)}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#5A646D] line-clamp-3">
                        {pickLocalized(item.body, language)}
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-[#F0F5F2] flex items-center justify-between text-xs font-bold text-[#2E7D4F]">
                      <span className="flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                        {t('home.news.readMore')} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10.5px] font-normal text-[#8A969F]">
                        {t('home.news.officialNews')}
                      </span>
                    </div>
                  </div>
                </SafeLink>
              ))}
            </div>
          )}

          {/* 2 Items view */}
          {newsState.status === 'ready' && (newsState.items ?? []).length === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto py-2 items-stretch">
              {(newsState.items ?? []).map((item, idx) => {
                const isCenter = idx === (slideIndex % 2);
                return (
                  <div key={item.id} className="h-full flex flex-col">
                    <SafeLink
                      to={`/news/${item.id}`}
                      data-testid={`home-news-${item.id}`}
                      onClick={() => setSlideIndex(idx)}
                      className={`flex flex-col justify-between h-full rounded-2xl overflow-hidden transition-all duration-500 group ${
                        isCenter
                          ? 'bg-white border-2 border-[#2E7D4F] shadow-none md:scale-105 z-20'
                          : 'bg-white/95 border border-[#D6E6DB] hover:border-[#7FB98A]'
                      } ${newsInView ? 'reveal' : 'opacity-0'}`}
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      <div className={`h-2 shrink-0 ${isCenter ? 'bg-gradient-to-r from-[#1B5E20] via-[#34D399] to-[#2E7D4F]' : 'bg-[#2E7D4F]'}`} />
                      <div className="p-6 flex flex-col justify-between flex-1">
                        <div>
                          <span className="text-[12.5px] text-[#767F87] font-semibold">{formatNewsDate(item.publish_from)}</span>
                          <h3 className="mt-3 text-base sm:text-lg font-bold text-[#123522] group-hover:text-[#1E6B3D] transition-colors leading-snug">
                            {pickLocalized(item.title, language)}
                          </h3>
                          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#5A646D] line-clamp-3">
                            {pickLocalized(item.body, language)}
                          </p>
                        </div>
                        <div className="mt-5 pt-3 border-t border-[#F0F5F2] flex items-center justify-between text-xs font-bold text-[#2E7D4F]">
                          <span className="flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                            {t('home.news.readMore')} <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </SafeLink>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3+ Items: Infinite Smooth Sliding Carousel */}
          {newsState.status === 'ready' && (newsState.items ?? []).length >= 3 && (
            <div className="space-y-6 py-2">
              <div className="overflow-hidden py-4 -my-4">
                <div
                  onTransitionEnd={handleTransitionEnd}
                  style={{
                    transform: `translateX(-${
                      isMobile
                        ? slideIndex * 100
                        : (slideIndex - 1) * (100 / 3)
                    }%)`,
                    transition: enableTransition
                      ? 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1)'
                      : 'none',
                  }}
                  className="flex items-stretch will-change-transform"
                >
                  {[
                    ...(newsState.items ?? []),
                    ...(newsState.items ?? []),
                    ...(newsState.items ?? []),
                  ].map((item, idx) => {
                    const isCenter = idx === slideIndex;
                    return (
                      <div
                        key={`slide-${idx}-${item.id}`}
                        className={`w-full md:w-1/3 shrink-0 px-2.5 sm:px-3 py-3 flex flex-col ${newsInView ? 'reveal' : 'opacity-0'}`}
                        style={{ animationDelay: `${(idx % 3) * 150}ms` }}
                      >
                        <SafeLink
                          to={`/news/${item.id}`}
                          data-testid={idx === slideIndex ? `home-news-${item.id}` : undefined}
                          onClick={(e) => {
                            if (!isCenter) {
                              e.preventDefault();
                              if (!isTransitioning) {
                                setIsTransitioning(true);
                                setSlideIndex(idx);
                              }
                            }
                          }}
                          className={`flex flex-col justify-between h-full rounded-2xl overflow-hidden transition-all duration-700 ease-out group cursor-pointer ${
                            isCenter
                              ? 'bg-white border-2 border-[#2E7D4F] shadow-none md:scale-105 z-20'
                              : 'bg-white/95 border border-[#D6E6DB] hover:border-[#7FB98A] md:scale-95 opacity-80 hover:opacity-100 z-10'
                          }`}
                        >
                          {/* Top accent bar */}
                          <div
                            className={`h-2 shrink-0 transition-all duration-700 ${
                              isCenter
                                ? 'bg-gradient-to-r from-[#1B5E20] via-[#34D399] to-[#2E7D4F]'
                                : 'bg-[#2E7D4F]/30 group-hover:bg-[#2E7D4F]'
                            }`}
                          />

                          {/* Equalized Content Body */}
                          <div className="p-6 sm:p-6.5 flex flex-col justify-between flex-1">
                            <div>
                              <div className="flex items-center justify-between gap-2 min-h-[24px]">
                                <span className="text-xs font-semibold text-[#767F87] flex items-center gap-1.5">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isCenter ? 'bg-[#2E7D4F]' : 'bg-[#767F87]'
                                    }`}
                                  />
                                  {formatNewsDate(item.publish_from)}
                                </span>
                                {isCenter ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] text-[#1E5631] text-[10.5px] font-extrabold uppercase tracking-wide border border-[#C2E3CB]">
                                    <Sparkles className="w-3 h-3 text-[#2E7D4F]" />
                                    {t('home.news.urgent')}
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium text-[#8A969F]">
                                    {t('home.news.official')}
                                  </span>
                                )}
                              </div>

                              <h3
                                className="mt-3 font-bold text-[#123522] group-hover:text-[#1E6B3D] transition-colors leading-snug line-clamp-2 text-base sm:text-lg min-h-[3rem]"
                              >
                                {pickLocalized(item.title, language)}
                              </h3>

                              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#5A646D] line-clamp-3 min-h-[4rem]">
                                {pickLocalized(item.body, language)}
                              </p>
                            </div>

                            <div className="mt-5 pt-3 border-t border-[#F0F5F2] flex items-center justify-between text-xs font-bold text-[#2E7D4F]">
                              <span className="group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                                {isCenter ? t('home.news.readMore') : t('home.news.view')}{' '}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-[10.5px] font-normal text-[#8A969F]">
                                {t('home.news.officialNews')}
                              </span>
                            </div>
                          </div>
                        </SafeLink>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Pagination Dots */}
              <div className="flex items-center justify-center gap-2 pt-3">
                {(newsState.items ?? []).map((dotItem, dotIdx) => {
                  const rawCount = (newsState.items ?? []).length;
                  const activeDot = rawCount > 0 ? ((slideIndex % rawCount) + rawCount) % rawCount : 0;
                  const isActive = dotIdx === activeDot;
                  return (
                    <button
                      key={dotItem.id}
                      type="button"
                      onClick={() => handleDotClick(dotIdx)}
                      aria-label={`Yangilik ${dotIdx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'w-8 bg-[#2E7D4F] shadow-xs'
                          : 'w-2 bg-[#D1DFD6] hover:bg-[#A6BEAF]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 8. PORTAL QUALITY RATING SURVEY (Baholash) ───────────────── */}
      {!isTest && (
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 w-full">
          <PortalRatingSurvey />
        </section>
      )}
    </div>
  );
};

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
