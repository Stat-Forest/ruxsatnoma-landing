import React, { useEffect, useState } from 'react';
import { Link, useInRouterContext, useLocation } from 'react-router';
import {
  Search,
  QrCode,
  ArrowRight,
  FileCheck2,
  CheckCircle2,
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
import { useLanguage, useT } from '../../i18n/useT';
import { api } from '../../api/client';
import { fetchNews, formatNewsDate, HOME_NEWS_COUNT, type NewsItem } from '../../api/news';
import { fetchServices, type Service } from '../../api/services';
import { serviceIcon } from '../../lib/serviceIcons';
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
  const { language } = useLanguage();
  const inRouter = useInRouterContext();
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [statsState, setStatsState] = useState<StatsState>({ status: 'loading' });

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
      label: t('home.stats.activePermits.label'),
      value: statsState.status === 'ready' ? Number(statsState.data.total_active_permits).toLocaleString() : DASH,
      icon: <FileCheck2 className="w-6 h-6 text-[#2E7D4F]" />,
      note: t('home.stats.activePermits.note'),
    },
    {
      label: t('home.stats.activeArea.label'),
      value:
        statsState.status === 'ready'
          ? `${Number(statsState.data.total_active_area_ha).toLocaleString()} ${t('home.stats.activeArea.unit')}`
          : DASH,
      icon: <Trees className="w-6 h-6 text-[#2E7D4F]" />,
      note: t('home.stats.activeArea.note'),
    },
    {
      label: t('home.stats.organizations.label'),
      value: statsState.status === 'ready' ? String(statsState.data.by_organization?.length || 0) : DASH,
      icon: <Users className="w-6 h-6 text-[#2E7D4F]" />,
      note: t('home.stats.organizations.note'),
    },
    {
      label: t('home.stats.regions.label'),
      value: statsState.status === 'ready' ? String(statsState.data.by_region?.length || 0) : DASH,
      icon: <MapPin className="w-6 h-6 text-[#2E7D4F]" />,
      note: t('home.stats.regions.note'),
    },
  ];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchInput.trim()) {
      onNavigate?.('verify', { query: quickSearchInput.trim() });
    }
  };

  return (
    <div className="space-y-16 font-sans">
      {inRouter && <HashScroller />}
      {/* ── 1. DASHBOARD & VERIFICATION SECTION ────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
              {t('home.dashboard.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1F24] mt-3">
              {t('home.dashboard.title')}
            </h2>
            <p className="text-sm text-[#5A646D] mt-2 leading-relaxed">
              {t('home.dashboard.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE: DIAGRAMS & STATISTICS DASHBOARD (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top 4 Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.map((st, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E4E7EA] p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#5A646D] uppercase tracking-wider block">
                      {st.label}
                    </span>
                    <div className="text-2xl font-bold text-[#1A1F24]">{st.value}</div>
                    <span className="text-xs text-[#5A646D] font-medium">{st.note}</span>
                  </div>
                  <div className="p-3 bg-[#F0F7F1] rounded-xl shrink-0">{st.icon}</div>
                </div>
              ))}
            </div>

            {/* Where the aggregates come from, and why some of them are blank.
                This card replaced a four-bar "distribution diagram" whose every
                percentage was a constant in the source (68 % grazing, 29,138
                permits...) under a caption reading "updates in real time".
                Nothing publishes an activity breakdown, so rather than invent
                one again, this says where the real figures live and what hides
                the small ones. */}
            <div className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#1A1F24]">{t('home.opendata.title')}</h3>
                <p className="text-xs text-[#5A646D]">{t('home.opendata.subtitle')}</p>
              </div>
              <p className="text-sm text-[#5A646D]">
                {t('home.opendata.kAnonymity.before')}{' '}
                <b className="text-[#1A1F24]">
                  {statsState.status === 'ready' ? statsState.data.k_anonymity_threshold : DASH}
                </b>{' '}
                {t('home.opendata.kAnonymity.after')}
              </p>
              {statsState.status === 'error' && (
                <p className="text-sm text-[#B45309]">{t('home.opendata.unavailable')}</p>
              )}
              <button
                type="button"
                onClick={() => onNavigate?.('opendata')}
                className="text-sm font-semibold text-[#2E7D4F] inline-flex items-center gap-1 hover:underline"
              >
                {t('home.opendata.link')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: RUXSATNOMANI TEKSHIRISH CARD (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleQuickSearch}
              className="bg-white text-[#1A1F24] p-7 rounded-2xl shadow-lg border border-[#E4E7EA] space-y-5 sticky top-24"
            >
              <div className="flex items-center gap-3.5 pb-2 border-b border-[#E4E7EA]">
                <div className="w-12 h-12 rounded-xl bg-[#F0F7F1] text-[#2E7D4F] flex items-center justify-center font-bold shadow-inner shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A1F24]">{t('home.verify.title')}</h3>
                  <p className="text-xs text-[#5A646D]">{t('home.verify.subtitle')}</p>
                </div>
              </div>

              <p className="text-xs text-[#5A646D] leading-relaxed">
                {t('home.verify.description')}
              </p>

              <div className="space-y-3">
                <Input
                  placeholder={t('home.verify.placeholder')}
                  value={quickSearchInput}
                  onChange={(e) => setQuickSearchInput(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  touchSize
                />
                <Button type="submit" variant="success" fullWidth size="lg" className="font-bold shadow-md bg-[#2E7D4F] hover:bg-[#23653F]">
                  {t('home.verify.submitButton')}
                </Button>
              </div>

              <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#E4E7EA] space-y-2 text-xs text-[#5A646D]">
                <div className="flex items-center gap-2 font-semibold text-[#1A1F24]">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  {t('home.verify.instructionsTitle')}
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                  <li>{t('home.verify.step1')}</li>
                  <li>{t('home.verify.step2')}</li>
                  <li>{t('home.verify.step3')}</li>
                </ul>
              </div>

              <p className="text-[11px] text-[#767F87] text-center pt-1">
                {t('home.verify.footnote')}
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ── 3. ACTIVITIES GRID ─────────────────────────────────────── */}
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

        {/* The six cards below used to be constants — a title, a description
            and a "badge" (e.g. "Most in demand") hand-typed per service, none
            of it sourced from anywhere in the system. They now come from the
            same catalog `ServicesPage` reads, so the two pages can never list
            a different set of services (`api/services.ts`). */}
        {servicesState.status === 'loading' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="home-activities-loading">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton height="h-11" width="w-11" className="rounded-xl" />
                  <Skeleton height="h-6" width="w-24" className="rounded-full" />
                </div>
                <Skeleton height="h-6" width="w-3/4" />
                <Skeleton height="h-4" width="w-full" />
                <Skeleton height="h-4" width="w-5/6" />
                <div className="pt-4 border-t border-[#E4E7EA] flex items-center justify-between">
                  <Skeleton height="h-4" width="w-28" />
                  <Skeleton height="h-4" width="w-20" />
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
            {servicesState.items.map((svc) => (
              <ActivityCard key={svc.id} service={svc} language={language} t={t} onNavigate={onNavigate} />
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

function ActivityCard({
  service,
  language,
  t,
  onNavigate,
}: {
  service: Service;
  language: string;
  t: (key: string) => string;
  onNavigate?: (page: string, params?: any) => void;
}) {
  const Icon = serviceIcon(service.code);
  const description = pickLocalized(service.description, language);

  return (
    <div className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs hover:border-[#7FB98A] hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="p-2.5 bg-[#F0F7F1] rounded-xl">
            <Icon className="w-6 h-6 text-[#2E7D4F]" />
          </div>
          {/* The real processing term (`processing_days`, ruling #138) where a
              hand-typed badge ("Most in demand", "Seasonal"...) used to sit —
              those made no claim the system could back up. */}
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F0F7F1] text-[#2E7D4F] border border-[#D9EBDC]">
            {service.processing_days} {t('home.activities.daysUnit')}
          </span>
        </div>
        <h3 className="text-lg font-bold text-[#1A1F24] group-hover:text-[#2E7D4F] transition-colors">
          {pickLocalized(service.name, language)}
        </h3>
        {/* `description` is nullable (two of six rows have none, on purpose —
            see `api/services.ts`); no placeholder sentence stands in for it. */}
        {description && <p className="text-xs text-[#5A646D] leading-relaxed">{description}</p>}
      </div>

      <div className="pt-4 border-t border-[#E4E7EA] flex items-center justify-between text-xs">
        {/* The annual-quota line was six invented constants (85,000 head,
            14,200 hectares, 42,000 bee colonies...) with no source
            anywhere in the system — stage 7.3 finding F7. Removed
            rather than replaced: nothing publishes a quota, and the
            tariff calculator below is what a citizen actually needs. */}
        <span className="text-[#767F87]">{t('home.activities.tariffHint')}</span>
        <button
          onClick={() => onNavigate?.('auth_login', { activity: service.id })}
          className="font-bold text-[#2E7D4F] group-hover:underline inline-flex items-center gap-1"
        >
          {t('home.activities.applyLink')} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
