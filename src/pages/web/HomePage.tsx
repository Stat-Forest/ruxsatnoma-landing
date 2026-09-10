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
import { RatingBand, fetchRatingSummary, type RatingBandState } from '../../components/home/RatingBand';
import { SeasonStrip } from '../../components/home/SeasonStrip';
import { Scene, SCENE_KINDS, type SceneKind } from '../../components/art/Scene';
import { useLanguage, useT } from '../../i18n/useT';
import type { UiLanguage } from '../../i18n/context';
import { api } from '../../api/client';
import { fetchNews, formatNewsDate, HOME_NEWS_COUNT, type NewsItem } from '../../api/news';
import { fetchServices, type Service } from '../../api/services';
import type { SiteSettingsState } from '../../api/site';
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
    quickCheckSubtitle: 'Seriya va raqami boʻyicha',
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
    quickCheckSubtitle: 'По серии и номеру',
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
    quickCheckSubtitle: 'By series and number',
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
    quickCheckSubtitle: 'Серия ва рақами бўйича',
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
    quickCheckSubtitle: 'Seriya hám nomeri boyınsha',
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
  /** Fetched ONCE by `routes.tsx`'s `Layout` and handed down. This page used
   *  to call `fetchSiteSettings()` itself while `PublicLayout` above it did
   *  the same, so every visit to `/` made the request twice. */
  siteSettings?: SiteSettingsState;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  siteSettings: siteSettingsState = { status: 'loading' },
}) => {
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

  // Site settings feed two sections at once (Task 10): the season strip's
  // `season_windows` (ruling R3) and the support CTA's live phone/hours.
  // Anything but `ready` means the season strip does not render at all (a
  // calendar with no confirmed months is worse than no calendar) and the
  // CTA's phone/hours rows do not render either, same posture as the
  // footer's own use of this endpoint.

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

      {/* ── 4. SEASON CALENDAR (ruling R3) ──────────────────────────
          Only when `siteSettingsState` has actually answered: a calendar
          with no confirmed months is worse than no calendar, so a failed
          fetch renders nothing here rather than inventing a fallback set. */}
      {siteSettingsState.status === 'ready' && (
        <section>
          <SeasonStrip windows={siteSettingsState.data.season_windows} />
        </section>
      )}

      {/* ── 5. HOW IT WORKS — FOUR STEPS ─────────────────────────────── */}
      <section>
        <div className="max-w-xl mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0F7F1] border border-[#D9EBDC] text-xs font-bold uppercase tracking-wider text-[#23653F]">
            {t('home.steps.sectionBadge')}
          </span>
          <h2 className="mt-4 text-2xl sm:text-[34px] leading-tight font-black text-[#123522] tracking-tight">
            {t('home.steps.sectionTitle')}
          </h2>
          <p className="mt-3 text-sm sm:text-[15.5px] leading-relaxed text-[#5A646D]">
            {t('home.steps.sectionSubtitle')}
          </p>
        </div>

        <div className="relative">
          <div
            className="hidden sm:block absolute left-[60px] right-[60px] top-[34px] h-px"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, #D9EBDC 0 10px, transparent 10px 20px)' }}
          />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: UserRound, bg: '#123522' },
              { Icon: MapIcon, bg: '#1B4A2E' },
              { Icon: CalculatorIcon, bg: '#237443' },
              { Icon: QrCode, bg: '#2E7D4F' },
            ].map(({ Icon, bg }, idx) => (
              <div key={idx}>
                <div
                  className="w-[68px] h-[68px] rounded-[20px] flex items-center justify-center shadow-lg"
                  style={{ background: bg }}
                >
                  <Icon className="w-7 h-7 text-[#9CE3AE]" />
                </div>
                <div className="mt-5 text-xs font-extrabold text-[#7FB98A] tracking-widest">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="mt-2 text-[19px] font-bold text-[#123522]">{t(`home.steps.0${idx + 1}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5A646D]">{t(`home.steps.0${idx + 1}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5b. PRICE CALCULATOR ───────────────────────────────────── */}
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

      {/* ── 6. MAP BAND ──────────────────────────────────────────────
          Decorative preview only — the interactive map (maplibre, the real
          contours) lives at `/map`, a screen a different track owns. */}
      <section className="rounded-[20px] overflow-hidden border border-[#E4E7EA] grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 sm:p-12 bg-[#123522]">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#9CE3AE]">
            {sectionText.mapBadge}
          </span>
          <h2 className="mt-4 text-2xl sm:text-[32px] leading-tight font-black text-white tracking-tight">
            {sectionText.mapTitle}
          </h2>
          <p className="mt-4 text-sm sm:text-[15.5px] leading-relaxed text-[#C4D8C9]">{sectionText.mapDescription}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.('map')}
              className="inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-[#2E7D4F] hover:bg-[#23653F] text-white text-sm font-bold transition-colors"
            >
              <span>{sectionText.mapCtaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('map')}
              className="inline-flex items-center h-12 px-5 rounded-xl border border-white/30 text-white text-sm font-bold hover:bg-white/10 transition-colors"
            >
              {sectionText.mapCtaSecondary}
            </button>
          </div>
        </div>
        <div className="relative bg-[#DCE9DE] min-h-[260px] sm:min-h-[372px]">
          <svg
            viewBox="0 0 640 372"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            <rect width="640" height="372" fill="#E7F0E8" />
            <g stroke="#C6D9C9" strokeWidth="1">
              <path d="M0 60h640M0 130h640M0 200h640M0 270h640M0 340h640" />
              <path d="M80 0v372M180 0v372M280 0v372M380 0v372M480 0v372M580 0v372" />
            </g>
            <path
              d="M60 250 C 120 200, 180 260, 240 230 S 340 150, 420 190 S 560 150, 610 200 L 610 340 L 60 330 Z"
              fill="#B9D6BE"
              stroke="#7FB98A"
              strokeWidth="2"
            />
            <path
              d="M150 90 C 210 60, 300 70, 350 110 S 420 170, 360 190 S 220 170, 170 140 Z"
              fill="#9CCBA4"
              stroke="#2E7D4F"
              strokeWidth="2"
            />
            <path
              d="M240 205 C 280 185, 330 195, 348 220 S 320 262, 275 258 S 220 232, 240 205 Z"
              fill="#2E7D4F"
              fillOpacity=".38"
              stroke="#23653F"
              strokeWidth="2.4"
              strokeDasharray="6 4"
            />
            <circle cx="294" cy="228" r="7" fill="#23653F" />
            <circle cx="294" cy="228" r="15" fill="none" stroke="#23653F" strokeWidth="2" opacity=".45" />
          </svg>
        </div>
      </section>

      {/* ── 7. NEWS & ANNOUNCEMENTS ──────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-7">
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
              {(newsState.items ?? []).map((item) => (
                <SafeLink
                  key={item.id}
                  to={`/news/${item.id}`}
                  data-testid={`home-news-${item.id}`}
                  className="card-lift block bg-white border border-[#E4E7EA] rounded-2xl overflow-hidden"
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
        className="relative overflow-hidden rounded-[20px] p-8 sm:p-12"
        style={{ background: 'linear-gradient(112deg, #17331B 0%, #235C39 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,.14) 1px, transparent 1px)',
            backgroundSize: '4px 4px',
          }}
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-xl">
            {ctaHours && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#DCF5E3]">
                <span className="live w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                {ctaHours}
              </span>
            )}
            <h2 className="mt-4 text-2xl sm:text-[32px] leading-tight font-black text-white tracking-tight">
              {t('home.contact.title')}
            </h2>
            <p className="mt-3 text-sm sm:text-[15.5px] leading-relaxed text-[#C4D8C9]">
              {t('home.contact.description')}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full lg:w-80 shrink-0">
            {ctaPhone && (
              <div className="flex items-center gap-3.5 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
                <div className="w-10 h-10 rounded-[11px] bg-white/15 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5 text-[#9CE3AE]" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wide text-[#9CE3AE]">{t('home.contact.subtitle')}</div>
                  <a href={`tel:${ctaPhone.replace(/[^\d+]/g, '')}`} className="mt-0.5 block text-lg font-extrabold text-white">
                    {ctaPhone}
                  </a>
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="success"
              fullWidth
              className="bg-[#2E7D4F] hover:bg-[#23653F]"
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
