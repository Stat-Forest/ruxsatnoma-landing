import React, { useEffect, useState } from 'react';
import { Link, useInRouterContext, useLocation } from 'react-router';
import {
  Search,
  QrCode,
  FileCheck2,
  Users,
  Trees,
  ChevronRight,
  PhoneCall,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/FormControls';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { CALCULATOR_ANCHOR, PriceCalculator } from '../../components/calculator/PriceCalculator';
import { HeroSlider } from '../../components/home/HeroSlider';
import { RatingBand, fetchRatingSummary, type RatingBandState } from '../../components/home/RatingBand';
import { Scene, SCENE_KINDS, type SceneKind } from '../../components/art/Scene';
import { useLanguage, useT } from '../../i18n/useT';
import type { UiLanguage } from '../../i18n/context';
import { api } from '../../api/client';
import { fetchNews, formatNewsDate, HOME_NEWS_COUNT, type NewsItem } from '../../api/news';
import { fetchServices, type Service } from '../../api/services';
import { pickLocalized } from '../../lib/localized';
import type { components } from '../../api/schema';

type OpenDataStats = components['schemas']['OpenDataStatsOut'];

type StatsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: OpenDataStats };

type NewsState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: NewsItem[] };

type ServicesState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: Service[] };

/** Shown instead of a figure until the aggregates endpoint has answered — an
 *  em dash is a statement that the number is not known yet, which is the
 *  honest one. Never a placeholder digit. */
const DASH = '—';

/**
 * Copy for the redesigned sections that has no existing i18n key — this
 * track cannot touch `src/i18n/*`, so rather than leave four of the five
 * portal languages showing Latin Uzbek, the strings this page itself needed
 * are translated locally. Everything that already had a key (the six
 * directions, the four steps, the news header, the contact widget) still
 * reads through `useT()` below, unchanged.
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
    quickCheckSubtitle: 'Seriya va raqami boʻyicha',
    quickCheckSeriya: 'Seriya',
    quickCheckNumber: 'Raqam — masalan: 000123',
    quickCheckButton: 'Tekshirish',
    mapBadge: 'Interaktiv xarita',
    mapTitle: 'Oʻrmon fondi yerlari xaritada',
    mapDescription:
      'Oʻrmon xoʻjaliklari chegaralari, yaylov konturlari va ruxsat berilgan hududlar ochiq GIS qatlamlarida koʻrsatilgan. Ruxsatnomani tekshirganda uning konturi ham shu xaritada belgilanadi.',
    mapCtaPrimary: 'Xaritani ochish',
    mapCtaSecondary: 'Qatlamlar roʻyxati',
  },
  ru: {
    statsBadge: 'Данные государственного реестра',
    statsTitle: 'Портал в цифрах',
    statsIntro: 'Показатели поступают из официального сервиса открытых данных в реальном времени.',
    quickCheckTitle: 'Проверка разрешения',
    quickCheckSubtitle: 'По серии и номеру',
    quickCheckSeriya: 'Серия',
    quickCheckNumber: 'Номер — например: 000123',
    quickCheckButton: 'Проверить',
    mapBadge: 'Интерактивная карта',
    mapTitle: 'Земли лесного фонда на карте',
    mapDescription:
      'Границы лесхозов, контуры пастбищ и разрешённые участки показаны на открытых ГИС-слоях. При проверке разрешения его контур также отмечается на этой карте.',
    mapCtaPrimary: 'Открыть карту',
    mapCtaSecondary: 'Список слоёв',
  },
  en: {
    statsBadge: 'State register data',
    statsTitle: 'The portal in numbers',
    statsIntro: 'Figures are pulled from the official open-data service in real time.',
    quickCheckTitle: 'Verify a permit',
    quickCheckSubtitle: 'By series and number',
    quickCheckSeriya: 'Series',
    quickCheckNumber: 'Number — e.g. 000123',
    quickCheckButton: 'Verify',
    mapBadge: 'Interactive map',
    mapTitle: 'Forest fund land on the map',
    mapDescription:
      'Leshoz boundaries, pasture contours and permitted areas are shown on open GIS layers. Checking a permit also marks its contour on this same map.',
    mapCtaPrimary: 'Open the map',
    mapCtaSecondary: 'Layer list',
  },
  uz_cyrl: {
    statsBadge: 'Давлат реестри маълумотлари',
    statsTitle: 'Портал рақамларда',
    statsIntro: 'Кўрсаткичлар расмий очиқ маълумотлар хизматидан реал вақтда олинади.',
    quickCheckTitle: 'Рухсатномани текшириш',
    quickCheckSubtitle: 'Серия ва рақами бўйича',
    quickCheckSeriya: 'Серия',
    quickCheckNumber: 'Рақам — масалан: 000123',
    quickCheckButton: 'Текшириш',
    mapBadge: 'Интерактив харита',
    mapTitle: 'Ўрмон фонди ерлари харитада',
    mapDescription:
      'Ўрмон хўжаликлари чегаралари, яйлов контурлари ва рухсат берилган ҳудудлар очиқ ГИС қатламларида кўрсатилган. Рухсатномани текширганда унинг контури ҳам шу харитада белгиланади.',
    mapCtaPrimary: 'Харитани очиш',
    mapCtaSecondary: 'Қатламлар рўйхати',
  },
  kaa: {
    statsBadge: 'Mámleket reyestri maǵlıwmatları',
    statsTitle: 'Portal sanlarda',
    statsIntro: 'Kórsetkishler rásmiy ashıq maǵlıwmat xizmetinen real waqıtta alınadı.',
    quickCheckTitle: 'Ruxsatnamanı tekseriw',
    quickCheckSubtitle: 'Seriya hám nomeri boyınsha',
    quickCheckSeriya: 'Seriya',
    quickCheckNumber: 'Nomer — mısalı: 000123',
    quickCheckButton: 'Tekseriw',
    mapBadge: 'Interaktiv karta',
    mapTitle: 'Orman fondı jerleri kartada',
    mapDescription:
      'Orman xojalıqlarınıń shegaraları, jaylaw konturları hám ruxsat etilgen aymaqlar ashıq GIS qatlamlarında kórsetilgen. Ruxsatnamanı tekserǵende onıń konturı da usı kartada belgilenedi.',
    mapCtaPrimary: 'Kartanı ashıw',
    mapCtaSecondary: 'Qatlamlar dizimi',
  },
};

/** The six illustrated cards fall back to `grazing`'s scene for a code the
 *  art set does not (yet) cover — never a blank box (Task 9's brief). */
function sceneKindFor(code: string): SceneKind {
  return (SCENE_KINDS as readonly string[]).includes(code) ? (code as SceneKind) : 'grazing';
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

export interface HomePageProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const t = useT();
  const { language, uiLanguage } = useLanguage();
  const sectionText = SECTION_TEXT[uiLanguage];
  const inRouter = useInRouterContext();
  const [quickSeries, setQuickSeries] = useState('');
  const [quickNumber, setQuickNumber] = useState('');
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

  return (
    <div className="space-y-16 font-sans">
      {inRouter && <HashScroller />}

      {/* ── 0. HERO SLIDER ──────────────────────────────────────────
          Full-bleed: `PublicLayout` (not owned by this track) wraps page
          content in `<main className="max-w-7xl mx-auto px-6 py-10">`, but
          the approved hero (`design-canvas/Main.dc.html`) spans the full
          viewport width flush against the header. The classic "break out of
          a centered container" trick (`left-1/2 -mx-[50vw] w-screen`) gets
          there without touching a file another track owns; `-mt-10` cancels
          the parent's own `py-10` so the hero sits flush under the header,
          matching the negative-margin overlap the quick-check strip below it
          needs too.

          KNOWN INTEGRATION CONCERN (see track report): `PublicLayout` still
          renders its own pre-redesign hero banner whenever `activeNav ===
          'home'` (the `hero.*` image banner). That file is out of scope for
          this track, so until it is removed the home page will show that
          banner directly above this slider. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-10">
        <HeroSlider onNavigate={onNavigate} />
      </div>

      {/* ── 1. QUICK CHECK STRIP ───────────────────────────────────────
          Overlaps the hero's bottom edge, matching `Main.dc.html`'s own
          `margin-top: -56px` treatment — this is why the hero above ends in
          `-mt-10` rather than a plain top margin, so the two negative
          margins compose instead of fighting. */}
      <section className="relative z-10 -mt-14 sm:-mt-16">
        <form
          onSubmit={handleQuickSearch}
          className="bg-white border border-[#E4E7EA] rounded-2xl shadow-xl px-6 py-6 sm:px-8 sm:py-7 flex flex-col lg:flex-row lg:items-center gap-5"
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
                leftIcon={<Search className="w-4 h-4" />}
                touchSize
              />
            </div>
            <Button
              type="submit"
              variant="success"
              size="lg"
              className="font-bold shadow-md bg-[#2E7D4F] hover:bg-[#23653F] shrink-0"
            >
              {sectionText.quickCheckButton}
            </Button>
          </div>
        </form>
      </section>

      {/* ── 2. STATISTICS + RATING ──────────────────────────────────── */}
      <section className="reveal">
        <div className="max-w-xl mb-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((st) => (
            <div
              key={st.testId}
              data-testid={st.testId}
              className="card-lift bg-gradient-to-b from-white to-[#F7FBF8] border border-[#E4E7EA] rounded-2xl px-6 pt-6 pb-6"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F0F7F1] flex items-center justify-center mb-4">{st.icon}</div>
              <div
                className={`font-serif text-4xl font-black tracking-tight ${st.muted ? 'text-[#9AA3AB]' : 'text-[#123522]'}`}
              >
                {st.value}
              </div>
              <div className="mt-2.5 text-sm font-bold text-[#1A1F24]">{st.label}</div>
              <div className="mt-1 text-xs text-[#767F87]">{st.note}</div>
            </div>
          ))}
        </div>

        <RatingBand state={ratingState} />
      </section>

      {/* ── 3. SIX DIRECTIONS ───────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
                className="bg-white border border-[#E4E7EA] rounded-2xl overflow-hidden shadow-xs"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="home-activities">
            {servicesState.items.map((svc, idx) => (
              <DirectionCard
                key={svc.id}
                service={svc}
                index={idx}
                language={language}
                t={t}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 4. HOW IT WORKS TIMELINE ───────────────────────────────── */}
      <section className="bg-white border border-[#E4E7EA] rounded-2xl p-8 shadow-xs space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F]">{t('home.steps.sectionBadge')}</span>
          <h2 className="text-2xl font-bold text-[#1A1F24]">{t('home.steps.sectionTitle')}</h2>
          <p className="text-sm text-[#5A646D] pt-1 leading-relaxed">{t('home.steps.sectionSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            { step: '01', title: t('home.steps.01.title'), desc: t('home.steps.01.desc') },
            { step: '02', title: t('home.steps.02.title'), desc: t('home.steps.02.desc') },
            { step: '03', title: t('home.steps.03.title'), desc: t('home.steps.03.desc') },
            { step: '04', title: t('home.steps.04.title'), desc: t('home.steps.04.desc') },
          ].map((st, idx) => (
            <div key={idx} className="relative space-y-3 p-4 bg-[#F8F9FA] border border-[#E4E7EA] rounded-xl">
              <span className="text-2xl font-black font-mono text-[#2E7D4F]">{st.step}</span>
              <h3 className="text-base font-bold text-[#1A1F24]">{st.title}</h3>
              <p className="text-xs text-[#5A646D] leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4b. PRICE CALCULATOR ───────────────────────────────────── */}
      {/* Was its own `/tariffs` screen until the news register took that slot
          in the header. It is one form over two anonymous endpoints, and a
          visitor who wants a figure now gets it without leaving the page. */}
      <section aria-labelledby="calculator-heading" className="space-y-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F]">
            {t('tariffs.header.badge')}
          </span>
          <h2 id="calculator-heading" className="text-2xl font-bold text-[#1A1F24]">
            {t('tariffs.header.title')}
          </h2>
          <p className="text-sm text-[#5A646D] pt-1 leading-relaxed">{t('tariffs.header.subtitle')}</p>
        </div>
        <PriceCalculator />
      </section>

      {/* ── 5. NEWS & ANNOUNCEMENTS ───────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E4E7EA] pb-4">
            <h3 className="text-lg font-bold text-[#1A1F24]">{t('home.news.sectionTitle')}</h3>
            <SafeLink
              to="/news"
              className="text-xs font-bold text-[#2E7D4F] hover:underline flex items-center gap-1"
            >
              {t('home.news.viewAllLink')} <ExternalLink className="w-3.5 h-3.5" />
            </SafeLink>
          </div>

          <div className="space-y-4 divide-y divide-[#E4E7EA]" data-testid="home-news">
            {newsState.status === 'loading' && (
              <p className="text-xs text-[#5A646D] pt-4 first:pt-0">{t('home.news.loading')}</p>
            )}
            {newsState.status === 'error' && (
              <p className="text-xs text-[#92400E] pt-4 first:pt-0">{t('home.news.failed')}</p>
            )}
            {newsState.status === 'ready' && (newsState.items ?? []).length === 0 && (
              <p className="text-xs text-[#5A646D] pt-4 first:pt-0">{t('home.news.empty')}</p>
            )}
            {newsState.status === 'ready' &&
              (newsState.items ?? []).map((item) => (
                <SafeLink
                  key={item.id}
                  to={`/news/${item.id}`}
                  data-testid={`home-news-${item.id}`}
                  className="block pt-4 first:pt-0 space-y-1 group"
                >
                  <span className="text-[11px] font-mono text-[#767F87]">
                    {formatNewsDate(item.publish_from)}
                  </span>
                  <h4 className="text-base font-bold text-[#1A1F24] group-hover:text-[#2E7D4F] transition-colors">
                    {pickLocalized(item.title, language)}
                  </h4>
                  <p className="text-xs text-[#5A646D] leading-relaxed line-clamp-2">
                    {pickLocalized(item.body, language)}
                  </p>
                </SafeLink>
              ))}
          </div>
        </div>

        {/* Support & Contact Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#123522] text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#2E7D4F] rounded-xl">
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-base">{t('home.contact.title')}</h4>
                <p className="text-xs text-gray-300">{t('home.contact.subtitle')}</p>
              </div>
            </div>

            <div className="text-2xl font-bold font-mono text-[#7FB98A]">+998 (71) 207-88-77</div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {t('home.contact.description')}
            </p>

            <Button
              variant="outline"
              fullWidth
              className="border-white/30 text-white hover:bg-white/10"
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
 * band (keyed off the activity's own `code`, falling back to `grazing`'s
 * scene for a code the art set does not cover — never a blank box), a
 * processing-term pill and an index badge sit over it, then the name,
 * description and an apply link below.
 */
function DirectionCard({
  service,
  index,
  language,
  t,
  onNavigate,
}: {
  service: Service;
  index: number;
  language: string;
  t: (key: string) => string;
  onNavigate?: (page: string, params?: any) => void;
}) {
  const description = pickLocalized(service.description, language);

  return (
    <div
      data-testid="direction-card"
      className="card-lift reveal bg-white border border-[#E4E7EA] rounded-2xl overflow-hidden"
      style={{ animationDelay: `${index * 0.09}s` }}
    >
      <div className="relative h-[178px] overflow-hidden">
        <div className="thumb-zoom absolute inset-0">
          <Scene kind={sceneKindFor(service.code)} height={178} />
        </div>
        {/* The real processing term (`processing_days`, ruling #138) where a
            hand-typed badge ("Most in demand", "Seasonal"...) used to sit —
            those made no claim the system could back up. */}
        <div className="absolute left-4 bottom-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F]" />
          <span className="text-xs font-bold text-[#123522]">
            {service.processing_days} {t('home.activities.daysUnit')}
          </span>
        </div>
        <div className="absolute right-3.5 top-3.5 w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-xs font-extrabold text-[#23653F]">
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-[#123522]">{pickLocalized(service.name, language)}</h3>
        {/* `description` is nullable (two of six rows have none, on purpose —
            see `api/services.ts`); no placeholder sentence stands in for it. */}
        {description && (
          <p className="mt-2.5 text-sm leading-relaxed text-[#5A646D] min-h-[64px]">{description}</p>
        )}
        <div className="mt-4 pt-4 border-t border-[#E4E7EA] flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate?.('auth_login', { activity: service.id })}
            className="text-sm font-bold text-[#2E7D4F] hover:underline"
          >
            {t('home.activities.applyLink')}
          </button>
          <ChevronRight className="w-4 h-4 text-[#2E7D4F]" />
        </div>
      </div>
    </div>
  );
}
