import React, { useEffect, useState } from 'react';
import { Link, useInRouterContext, useLocation } from 'react-router';
import {
  Search,
  QrCode,
  ArrowRight,
  FileCheck2,
  Users,
  Trees,
  ChevronRight,
  PhoneCall,
  ExternalLink,
  MapPin,
  UserRound,
  Map as MapIcon,
  Calculator as CalculatorIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/FormControls';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { CALCULATOR_ANCHOR, PriceCalculator } from '../../components/calculator/PriceCalculator';
import { HeroSlider } from '../../components/home/HeroSlider';
import { LandingBackground } from '../../components/home/LandingBackground';
import { RatingBand, fetchRatingSummary, type RatingBandState } from '../../components/home/RatingBand';
import { SeasonStrip } from '../../components/home/SeasonStrip';
import { Scene, SCENE_KINDS, type SceneKind } from '../../components/art/Scene';
import { SERVICE_IMAGES } from '../../assets/img/services';
import supportBgImage from '../../assets/img/support-bg.jpg';
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
  { id: 1, name: "Burchmulla o'rmon xo'jaligi", area: '1 420 ga', type: 'Muhofaza etiladigan hudud', x: '35%', y: '30%' },
  { id: 2, name: 'Chotqol davlat biosfera', area: '4 560 ga', type: 'Tabiiy oʻrmon fondi', x: '68%', y: '45%' },
  { id: 3, name: "Zomin tog'-o'rmon qo'riqxonasi", area: '2 850 ga', type: 'Davlat oʻrmon yerlari', x: '50%', y: '72%' },
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  siteSettings: siteSettingsState = { status: 'loading' },
}) => {
  const t = useT();
  const { language, uiLanguage } = useLanguage();
  const sectionText = SECTION_TEXT[uiLanguage];
  const inRouter = useInRouterContext();
  const [quickCheckRef, quickCheckInView] = useInView<HTMLElement>({ threshold: 0.1 });
  const [activitiesRef, activitiesInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [statsRef, statsInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [seasonsRef, seasonsInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [stepsRef, stepsInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [calcRef, calcInView] = useInView<HTMLElement>({ threshold: 0.06 });
  const [mapRef, mapInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [newsRef, newsInView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [supportRef, supportInView] = useInView<HTMLElement>({ threshold: 0.08 });
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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchNews({ page: 1, pageSize: HOME_NEWS_COUNT });
        if (!cancelled) {
          if (data && Array.isArray(data.items)) {
            setNewsState({ status: 'ready', items: data.items });
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

  // The support CTA's live phone/hours (Task 10) — same `siteSettingsState`
  // the season strip below reads, so one fetch feeds both. Renders nothing
  // per row when the value is missing, same posture as the footer.
  const ctaContacts = siteSettingsState.status === 'ready' ? siteSettingsState.data.contacts : null;
  const ctaPhone = ctaContacts?.phone ?? '';
  const ctaHours = ctaContacts ? pickLocalized(ctaContacts.hours, language) : '';

  return (
    <div className="relative space-y-16 font-sans">
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

        {/* ── 1. QUICK CHECK STRIP ─────────────────────────────────────
            Overlaps the hero's bottom edge, matching `Main.dc.html`'s own
            `margin-top: -56px` treatment. The hero and the strip share ONE
            wrapper on purpose: the page root is `space-y-16`, which under
            Tailwind v4 puts `margin-bottom: 4rem` on every child but the
            last — on the hero, that 64px pushed the strip clear of it and
            the `-mt-14` overlap netted out to an 8px gap (Oybek's
            screenshot, 2026-09-10). Inside a shared wrapper the gap lands
            after the strip, where it belongs. */}
        <section
          ref={quickCheckRef}
          className={`relative z-10 -mt-14 sm:-mt-16 ${quickCheckInView ? 'reveal' : 'opacity-0'}`}
        >
        <form
          onSubmit={handleQuickSearch}
          className="bg-white/95 backdrop-blur-xs border border-[#D6E6DB] rounded-2xl shadow-[0_12px_32px_rgba(18,53,34,0.08)] px-6 py-6 sm:px-8 sm:py-7 flex flex-col lg:flex-row lg:items-center gap-5"
        >
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#F0F7F1] text-[#2E7D4F] flex items-center justify-center">
              <QrCode className="w-6 h-6" />
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
        </section>
      </div>

      {/* ── 2. SIX DIRECTIONS ───────────────────────────────────────── */}
      <section ref={activitiesRef} className="relative z-10 space-y-6 overflow-hidden">
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${activitiesInView ? 'reveal' : 'opacity-0'}`}>
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F]">{t('home.activities.sectionBadge')}</span>
            <h2 className="text-2xl font-bold text-[#1A1F24] mt-2">{t('home.activities.sectionTitle')}</h2>
            <p className="text-sm text-[#5A646D] mt-2 leading-relaxed">{t('home.activities.sectionSubtitle')}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            onClick={() => onNavigate?.('activities')}
          >
            {t('home.activities.viewAllButton')}
          </Button>
        </div>

        {/* The six illustrated cards below come from the same catalog
            `ServicesPage` reads (`api/services.ts`), each keyed off the
            activity's `code` to the matching `<Scene>` — never the reverse,
            so the two pages can never list a different set of services. */}
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

        {/* A plain `<p>` here used to say the catalog failed to load with no
            `role="alert"` — a screen-reader user was never told the section
            failed, unlike `ServicesPage`'s own catalog error a click away.
            Same `Alert` component, same posture. The wrapping `data-testid`
            disambiguates this alert from the price calculator's own — both
            read `/public/refs/activity-types` and so fail together. */}
        {servicesState.status === 'error' && (
          <div data-testid="home-activities-error">
            <Alert variant="danger">{t('home.activities.failed')}</Alert>
          </div>
        )}

        {servicesState.status === 'ready' && servicesState.items.length === 0 && (
          <p className="text-xs text-[#5A646D]">{t('home.activities.empty')}</p>
        )}

        {servicesState.status === 'ready' && servicesState.items.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="home-activities"
          >
            {servicesState.items.map((svc, idx) => (
              <DirectionCard
                key={svc.id}
                service={svc}
                index={idx}
                language={language}
                t={t}
                onNavigate={onNavigate}
                inView={activitiesInView}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 3. STATISTICS + RATING ──────────────────────────────────── */}
      <section ref={statsRef} className="relative z-10">
        <div className={`max-w-xl mb-8 ${statsInView ? 'reveal' : 'opacity-0'}`}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0F7F1] border border-[#D9EBDC] text-xs font-bold uppercase tracking-wider text-[#23653F]">
            {sectionText.statsBadge}
          </span>
          <h2 className="mt-4 text-2xl sm:text-[38px] leading-tight font-black text-[#123522] tracking-tight">
            {sectionText.statsTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-[15.5px] leading-relaxed text-[#5A646D]">
            {sectionText.statsIntro} {t('home.opendata.kAnonymity.before')}{' '}
            <b className="text-[#1A1F24]">
              {statsState.status === 'ready' ? statsState.data.k_anonymity_threshold : DASH}
            </b>{' '}
            {t('home.opendata.kAnonymity.after')}
          </p>
          {statsState.status === 'error' && (
            <p className="mt-2 text-sm text-[#B45309]">{t('home.opendata.unavailable')}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start mb-6 sm:mb-8">
          {stats.map((st, idx) => {
            const isLower = idx % 2 === 1; // 1-card va 3-card teparoqda (idx 0, 2), 2-card va 4-card pastroqda (idx 1, 3)
            return (
              <div
                key={st.testId}
                data-testid={st.testId}
                className={`group relative card-lift ${
                  statsInView ? 'reveal' : 'opacity-0'
                } bg-white/95 backdrop-blur-sm border border-[#D6E6DB] hover:border-[#2E7D4F]/50 rounded-2xl p-5 shadow-[0_6px_24px_rgba(18,53,34,0.05)] hover:shadow-[0_18px_38px_rgba(18,53,34,0.12)] transition-all duration-300 overflow-hidden ${
                  isLower ? 'sm:mt-8 lg:mt-10' : 'sm:mt-0'
                }`}
                style={{ animationDelay: `${idx * 0.12}s` }}
              >
                {/* Top subtle highlight gradient bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#2E7D4F] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Ambient corner light */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#2E7D4F]/5 rounded-full blur-2xl group-hover:bg-[#2E7D4F]/10 transition-colors pointer-events-none" />

                {/* Top row: Icon + Live / Verified badge */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EEF7F1] to-[#DCF0E2] border border-[#C2E6CD] flex items-center justify-center text-[#2E7D4F] shadow-xs group-hover:scale-105 transition-transform duration-200">
                    {st.icon}
                  </div>
                  {idx < 2 ? (
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#23653F] bg-[#E8F5ED] px-2.5 py-0.5 rounded-full border border-[#C6E7D0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      {idx === 0 ? 'Reyestr' : 'GIS'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#767F87] bg-[#F4F6F5] px-2 py-0.5 rounded-full border border-[#E0E5E2]">
                      Maxfiy
                    </span>
                  )}
                </div>

                {/* Value / Raqam (smaller, sharper modern font) */}
                <div
                  className={`font-sans text-2xl sm:text-[25px] font-black tracking-tight leading-tight ${
                    st.muted ? 'text-[#9AA3AB]' : 'text-[#123522]'
                  }`}
                >
                  {st.value}
                </div>

                {/* Sarlavha (kichikroq va ixcham) */}
                <div className="mt-1.5 text-[13px] font-bold text-[#1A1F24] leading-snug">
                  {st.label}
                </div>

                {/* Izoh / Note (pastki chegara chizig'i bilan) */}
                <div className="mt-3 pt-2.5 border-t border-[#EDF3EF] flex items-center justify-between">
                  <span className="text-[11px] text-[#717C85] leading-relaxed line-clamp-1">
                    {st.note}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={statsInView ? 'reveal' : 'opacity-0'} style={{ animationDelay: '0.45s' }}>
          <RatingBand state={ratingState} />
        </div>
      </section>

      {/* ── 4. SEASON CALENDAR (ruling #180) ────────────────────────
          Only when `/public/activity-seasons` has actually answered: a
          calendar with no confirmed months is worse than no calendar, so a
          failed fetch renders nothing here rather than inventing a set. An
          activity the backend reports as unconfigured is absent from
          `months` and the strip draws it as UNKNOWN, not as closed. */}
      {seasonsState.status === 'ready' && (
        <section ref={seasonsRef} className={`relative z-10 ${seasonsInView ? 'reveal' : 'opacity-0'}`}>
          <SeasonStrip windows={seasonsState.months} />
        </section>
      )}

      {/* ── 5. HOW IT WORKS — FOUR STEPS ─────────────────────────────── */}
      <section ref={stepsRef} className="relative z-10">
        <div className={`max-w-xl mb-5 ${stepsInView ? 'reveal' : 'opacity-0'}`}>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0F7F1] border border-[#D9EBDC] text-[10px] font-bold uppercase tracking-wider text-[#23653F]">
            {t('home.steps.sectionBadge')}
          </span>
          <h2 className="mt-2 text-xl sm:text-2xl leading-tight font-black text-[#123522] tracking-tight">
            {t('home.steps.sectionTitle')}
          </h2>
          <p className="mt-1 text-xs sm:text-[12.5px] leading-relaxed text-[#5A646D]">
            {t('home.steps.sectionSubtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Luminous pipeline connecting line behind cards on desktop */}
          <div className="hidden lg:block absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-[#2E7D4F]/15 via-[#34D399]/35 to-[#2E7D4F]/15 z-0 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { Icon: UserRound, bg: 'linear-gradient(135deg, #0F3822 0%, #1A5C37 100%)', tag: 'OneID / E-IMZO' },
              { Icon: MapIcon, bg: 'linear-gradient(135deg, #154A2B 0%, #206E3F 100%)', tag: 'GIS Maydon' },
              { Icon: CalculatorIcon, bg: 'linear-gradient(135deg, #1B5C35 0%, #28804D 100%)', tag: 'Avto Toʻlov' },
              { Icon: QrCode, bg: 'linear-gradient(135deg, #237443 0%, #2EA862 100%)', tag: 'Rasmiy QR PDF' },
            ].map(({ Icon, bg, tag }, idx) => (
              <div
                key={idx}
                className={`group relative card-lift ${
                  stepsInView ? 'reveal' : 'opacity-0'
                } bg-white/95 backdrop-blur-sm border border-[#D6E6DB] hover:border-[#2E7D4F]/50 rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_20px_rgba(18,53,34,0.05)] hover:shadow-[0_14px_32px_rgba(18,53,34,0.11)] transition-all duration-300 flex flex-col justify-between overflow-hidden`}
                style={{ animationDelay: `${idx * 0.12}s` }}
              >
                {/* Top green accent sheen on hover */}
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#2E7D4F] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Soft ambient corner light */}
                <div className="absolute -top-8 -right-8 w-20 h-20 bg-[#2E7D4F]/5 rounded-full blur-xl group-hover:bg-[#2E7D4F]/12 transition-colors pointer-events-none" />

                <div>
                  {/* Top row: Gradient icon + Watermark Step Number */}
                  <div className="flex items-center justify-between gap-2.5 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shadow-[0_3px_12px_rgba(18,53,34,0.15)] group-hover:scale-105 group-hover:shadow-[0_5px_16px_rgba(46,125,79,0.25)] transition-all duration-300"
                      style={{ background: bg }}
                    >
                      <Icon className="w-4.5 h-4.5 text-[#A7F3D0]" />
                    </div>
                    <span className="font-mono text-xl font-black text-[#123522]/15 group-hover:text-[#2E7D4F]/30 tracking-tighter transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Step Sub-label & Title & Desc */}
                  <div className="text-[9.5px] font-extrabold text-[#2E7D4F] uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F]" />
                    {`Qadam 0${idx + 1}`}
                  </div>
                  <h3 className="mt-1 text-[13.5px] sm:text-[14px] font-bold text-[#123522] tracking-tight group-hover:text-[#1E6B3D] transition-colors leading-snug">
                    {t(`home.steps.0${idx + 1}.title`)}
                  </h3>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-[#5A646D]">
                    {t(`home.steps.0${idx + 1}.desc`)}
                  </p>
                </div>

                {/* Bottom Divider & Micro-badge */}
                <div className="mt-3 pt-2.5 border-t border-[#EDF3EF] flex items-center justify-between">
                  <span className="text-[9.5px] font-bold text-[#23653F] bg-[#F0F8F3] px-2 py-0.5 rounded-full border border-[#D5EBDC]">
                    {tag}
                  </span>
                  <span className="text-[9.5px] font-semibold text-[#8A969F]">
                    {`${idx + 1} / 4`}
                  </span>
                </div>

                {/* Forward pipeline connector arrow to next step (for desktop) */}
                {idx < 3 && (
                  <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-4.5 h-4.5 rounded-full bg-white border border-[#C6E5CF] items-center justify-center text-[#2E7D4F] shadow-xs group-hover:scale-110 group-hover:border-[#2E7D4F] transition-all">
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5b. PRICE CALCULATOR ───────────────────────────────────── */}
      {/* Was its own `/tariffs` screen until the news register took that slot
          in the header. It is one form over two anonymous endpoints, and a
          visitor who wants a figure now gets it without leaving the page. */}
      <section
        ref={calcRef}
        aria-labelledby="calculator-heading"
        className={`relative z-10 space-y-4 ${calcInView ? 'reveal' : 'opacity-0'}`}
      >
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#C6E5CF] text-[11px] font-bold uppercase tracking-wider text-[#2E7D4F] shadow-xs">
            <CalculatorIcon className="w-3 h-3 text-[#2E7D4F]" />
            {t('tariffs.header.badge')}
          </span>
          <h2 id="calculator-heading" className="text-xl sm:text-2xl font-black text-[#123522] tracking-tight">
            {t('tariffs.header.title')}
          </h2>
          <p className="text-xs sm:text-[13px] text-[#5A646D] leading-relaxed">{t('tariffs.header.subtitle')}</p>
        </div>
        <PriceCalculator />
      </section>

      {/* ── 6. MAP BAND ──────────────────────────────────────────────
          Decorative preview only — the interactive map (maplibre, the real
          contours) lives at `/map`, a screen a different track owns. */}
      <section
        ref={mapRef}
        className={`relative z-10 rounded-[20px] overflow-hidden border border-[#D6E6DB] shadow-[0_8px_30px_rgba(18,53,34,0.08)] grid grid-cols-1 lg:grid-cols-2 ${
          mapInView ? 'reveal' : 'opacity-0'
        }`}
      >
        {/* Left card with subtle GIS isolines watermark and ambient glow */}
        <div className="relative p-8 sm:p-12 bg-gradient-to-br from-[#0F2D1D] via-[#123522] to-[#18442B] overflow-hidden flex flex-col justify-between">
          {/* Subtle Topographical Elevation Isolines SVG watermark */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
            viewBox="0 0 500 500"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,100 C150,150 250,50 500,100 L500,0 L0,0 Z" fill="none" stroke="#9CE3AE" strokeWidth="1.5" />
            <path d="M0,200 C180,240 320,160 500,220" fill="none" stroke="#9CE3AE" strokeWidth="1.2" strokeDasharray="4 4" />
            <path d="M0,280 C120,320 280,260 500,310" fill="none" stroke="#9CE3AE" strokeWidth="1.5" />
            <path d="M0,360 C200,420 350,330 500,390" fill="none" stroke="#9CE3AE" strokeWidth="1.2" strokeDasharray="3 3" />
            <path d="M0,440 C160,480 300,420 500,460" fill="none" stroke="#9CE3AE" strokeWidth="1.5" />
            <circle cx="280" cy="200" r="45" fill="none" stroke="#9CE3AE" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx="280" cy="200" r="70" fill="none" stroke="#9CE3AE" strokeWidth="1" />
          </svg>

          {/* Ambient emerald radial glow */}
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#4ADE80]/12 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#9CE3AE]">
              {sectionText.mapBadge}
            </span>
            <h2 className="mt-4 text-2xl sm:text-[32px] leading-tight font-black text-white tracking-tight">
              {sectionText.mapTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-[15.5px] leading-relaxed text-[#C4D8C9]">{sectionText.mapDescription}</p>
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
              className="inline-flex items-center h-12 px-5 rounded-xl border border-white/30 text-white text-sm font-bold hover:bg-white/10 hover:border-white/50 transition-colors cursor-pointer"
            >
              {sectionText.mapCtaSecondary}
            </button>
          </div>
        </div>

        {/* Right side: Interactive Multi-mode GIS Map with live controls and hotspot markers */}
        <div className="relative bg-[#0D2417] min-h-[340px] sm:min-h-[420px] overflow-hidden flex items-center justify-center">
          {/* Smooth gradient blend on the left edge into the card on desktop */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#123522] via-[#123522]/60 to-transparent pointer-events-none z-10" />

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
            className="w-full h-full min-h-[340px] sm:min-h-[420px] border-0"
            loading="lazy"
          />

          {/* Top Floating Control Bar */}
          <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            {/* Status chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D2417]/90 backdrop-blur-md border border-[#2E7D4F]/50 shadow-lg text-[11px] font-bold text-white pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
              <span>
                {mapMode === 'satellite'
                  ? "Sun'iy yo'ldosh (Orbita)"
                  : mapMode === 'topo'
                    ? 'Topografik Relyef'
                    : 'OpenStreetMap'}
              </span>
            </div>

            {/* Layer Switcher */}
            <div className="flex items-center gap-1 bg-[#0A1D13]/90 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg pointer-events-auto">
              {(
                [
                  { id: 'street', label: "Ko'cha" },
                  { id: 'satellite', label: "Yo'ldosh" },
                  { id: 'topo', label: 'Relyef' },
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
                      <span>Maydoni:</span>
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
              <span>Xaritani to'liq ochish</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 7. NEWS & ANNOUNCEMENTS ──────────────────────────────────── */}
      <section ref={newsRef} className="relative z-10">
        <div className={`flex items-end justify-between mb-7 ${newsInView ? 'reveal' : 'opacity-0'}`}>
          <div>
            <h2 className="text-2xl sm:text-[34px] leading-tight font-black text-[#123522] tracking-tight">
              {t('home.news.sectionTitle')}
            </h2>
          </div>
          <SafeLink
            to="/news"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-[#2E7D4F] hover:underline"
          >
            {t('home.news.viewAllLink')} <ExternalLink className="w-3.5 h-3.5" />
          </SafeLink>
        </div>

        <div data-testid="home-news">
          {newsState.status === 'loading' && <p className="text-xs text-[#5A646D]">{t('home.news.loading')}</p>}
          {newsState.status === 'error' && <p className="text-xs text-[#92400E]">{t('home.news.failed')}</p>}
          {newsState.status === 'ready' && (newsState.items ?? []).length === 0 && (
            <p className="text-xs text-[#5A646D]">{t('home.news.empty')}</p>
          )}
          {newsState.status === 'ready' && (newsState.items ?? []).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(newsState.items ?? []).map((item, idx) => (
                <SafeLink
                  key={item.id}
                  to={`/news/${item.id}`}
                  data-testid={`home-news-${item.id}`}
                  className={`card-lift ${
                    newsInView ? 'reveal' : 'opacity-0'
                  } block bg-white/95 backdrop-blur-xs border border-[#D6E6DB] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(18,53,34,0.04)] hover:border-[#7FB98A]`}
                  style={{ animationDelay: `${idx * 0.15}s` }}
                >
                  <div className="h-2 bg-[#2E7D4F]" />
                  <div className="p-6">
                    <span className="text-[12.5px] text-[#767F87]">{formatNewsDate(item.publish_from)}</span>
                    <h3 className="mt-3.5 text-lg leading-snug font-bold text-[#123522]">
                      {pickLocalized(item.title, language)}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#5A646D] line-clamp-3">
                      {pickLocalized(item.body, language)}
                    </p>
                  </div>
                </SafeLink>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 8. SUPPORT CTA ───────────────────────────────────────────── */}
      <section
        ref={supportRef}
        className={`relative z-10 overflow-hidden rounded-[20px] p-8 sm:p-12 shadow-[0_14px_44px_rgba(18,53,34,0.25)] border border-[#2E7D4F]/30 ${
          supportInView ? 'reveal' : 'opacity-0'
        }`}
      >
        {/* Cinematic forest background photo */}
        <img
          src={supportBgImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Directional contrast gradient overlay: deep emerald over text & phone side, translucent in middle so the mountain forest photo is beautifully visible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, rgba(8,26,14,0.92) 0%, rgba(14,42,24,0.85) 45%, rgba(18,53,34,0.70) 75%, rgba(10,32,18,0.85) 100%)',
          }}
        />

        {/* Top subtle sheen */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#4ADE80]/50 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-xl">
            {ctaHours && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-[#DCF5E3] shadow-xs">
                <span className="live w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                {ctaHours}
              </span>
            )}
            <h2 className="mt-4 text-2xl sm:text-[32px] leading-tight font-black text-white tracking-tight drop-shadow-sm">
              {t('home.contact.title')}
            </h2>
            <p className="mt-3 text-sm sm:text-[15.5px] leading-relaxed text-[#D2E7D7]">
              {t('home.contact.description')}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full lg:w-80 shrink-0">
            {ctaPhone && (
              <div className="flex items-center gap-3.5 rounded-2xl border border-white/25 bg-black/30 backdrop-blur-md px-5 py-4 shadow-lg hover:border-white/40 transition-all">
                <div className="w-10 h-10 rounded-[11px] bg-[#2E7D4F]/50 border border-[#4ADE80]/40 flex items-center justify-center shrink-0 shadow-xs">
                  <PhoneCall className="w-5 h-5 text-[#4ADE80]" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wide text-[#9CE3AE]">{t('home.contact.subtitle')}</div>
                  <a href={`tel:${ctaPhone.replace(/[^\d+]/g, '')}`} className="mt-0.5 block text-lg font-extrabold text-white hover:text-[#9CE3AE] transition-colors">
                    {ctaPhone}
                  </a>
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="success"
              fullWidth
              className="bg-gradient-to-r from-[#24663E] via-[#2E7D4F] to-[#1E5736] hover:from-[#1E5736] hover:via-[#266842] hover:to-[#17462B] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all font-bold h-12 rounded-xl text-sm cursor-pointer"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate?.('feedback')}
            >
              {t('home.contact.button')}
            </Button>
          </div>
        </div>
      </section>
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
      className={`group card-lift ${animClass} bg-white/95 backdrop-blur-xs border border-[#D6E6DB] hover:border-[#2E7D4F]/50 rounded-2xl overflow-hidden shadow-[0_6px_24px_rgba(18,53,34,0.05)] hover:shadow-[0_16px_36px_rgba(18,53,34,0.12)] transition-all duration-300`}
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
