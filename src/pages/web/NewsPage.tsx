import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronRight,
  Home,
  Newspaper,
  Paperclip,
} from 'lucide-react';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/button';
import { fetchNews, formatNewsDate, NEWS_PAGE_SIZE, type NewsItem } from '../../api/news';
import { pickLocalized } from '../../lib/localized';
import { useLanguage, useT } from '../../i18n/useT';
import newsHeroBgImage from '../../assets/img/news-hero.jpg';
import recreationImg from '../../assets/img/services/recreation.jpg';
import grazingImg from '../../assets/img/services/grazing.jpg';
import haymakingImg from '../../assets/img/services/haymaking.jpg';
import apiaryImg from '../../assets/img/services/apiary.jpg';
import scienceImg from '../../assets/img/services/science.jpg';
import deadwoodImg from '../../assets/img/services/deadwood.jpg';
import type { UiLanguage } from '../../i18n/context';

const NEWS_FALLBACK_IMAGES = [
  recreationImg,
  grazingImg,
  haymakingImg,
  apiaryImg,
  scienceImg,
  deadwoodImg,
];

type PageState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: NewsItem[]; total: number };

interface NewsBannerText {
  homeBreadcrumb: string;
  newsBreadcrumb: string;
  scrollCue: string;
  readMore: string;
  officialNotice: string;
  officialNoticeDesc: string;
}

const NEWS_BANNER_TEXT: Record<UiLanguage, NewsBannerText> = {
  uz_latn: {
    homeBreadcrumb: 'Bosh sahifa',
    newsBreadcrumb: 'Yangiliklar',
    scrollCue: "Yangiliklarni ko'rish",
    readMore: "Batafsil o'qish",
    officialNotice: 'Rasmiy xabar',
    officialNoticeDesc: 'Rasmiy xabarnoma',
  },
  ru: {
    homeBreadcrumb: 'Главная',
    newsBreadcrumb: 'Новости',
    scrollCue: 'Смотреть новости',
    readMore: 'Подробнее',
    officialNotice: 'Официальное сообщение',
    officialNoticeDesc: 'Официальное извещение',
  },
  uz_cyrl: {
    homeBreadcrumb: 'Бош саҳифа',
    newsBreadcrumb: 'Янгиликлар',
    scrollCue: 'Янгиликларни кўриш',
    readMore: 'Батафсил ўқиш',
    officialNotice: 'Расмий хабар',
    officialNoticeDesc: 'Расмий хабарнома',
  },
  en: {
    homeBreadcrumb: 'Home',
    newsBreadcrumb: 'News',
    scrollCue: 'Browse news',
    readMore: 'Read more',
    officialNotice: 'Official notice',
    officialNoticeDesc: 'Official announcement',
  },
  kaa: {
    homeBreadcrumb: 'Bas bet',
    newsBreadcrumb: 'Jańalıqlar',
    scrollCue: 'Jańalıqlardı kóriw',
    readMore: 'Tolıqraq oqıw',
    officialNotice: 'Rásmiy xabar',
    officialNoticeDesc: 'Rásmiy xabarnama',
  },
};

/**
 * A9 — the whole news register, newest first. The three items on the home page
 * are a window onto this list; this is where "Barchasi" leads.
 *
 * There is no client-side search or filter: the register is a few dozen rows a
 * year, and a filter over a paged endpoint that has none would be a filter over
 * the current page only — which reads as "nothing found" for a notice that is
 * simply on page two.
 */
export const NewsPage: React.FC = () => {
  const t = useT();
  const { language, uiLanguage } = useLanguage();
  const [page, setPage] = useState(1);
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [headerHeight, setHeaderHeight] = useState(132);
  const catalogRef = useRef<HTMLDivElement>(null);
  const bannerText = NEWS_BANNER_TEXT[uiLanguage] ?? NEWS_BANNER_TEXT.uz_latn;

  const [currentFrontIndex, setCurrentFrontIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Measure real header height so hero = exactly 100vh - header */
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      const stickyThreshold = headerHeight + 20;
      let active = 0;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        
        // Oxirgi card uchun "active" holatga o'tish chegarasini kattalashtiramiz.
        // Katta ekranlarda footer ekranga erta chiqib qolishi sababli, oxirgi card
        // eng tepagacha (stickyThreshold) bora olmasligi mumkin. Uni ekranning 60%
        // qismiga kelganda faollashtirish orqali oldingi cardni yopilish animatsiyasini ta'minlaymiz.
        const isLast = state.status === 'ready' && i === state.items.length - 1;
        const normalThreshold = stickyThreshold + Math.min(i, 5) * 16 + 10;
        const threshold = isLast 
          ? Math.max(normalThreshold, window.innerHeight * 0.6) 
          : normalThreshold;

        if (rect.top <= threshold) {
          active = i;
        }
      });
      setCurrentFrontIndex(active);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [state, headerHeight]);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    void (async () => {
      try {
        const data = await fetchNews({ page, pageSize: NEWS_PAGE_SIZE });
        if (cancelled) return;
        setState({ status: 'ready', items: data.items, total: data.total });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const lastPage = state.status === 'ready' ? Math.max(1, Math.ceil(state.total / NEWS_PAGE_SIZE)) : 1;

  return (
    <div className="font-sans bg-[#EFF7F2]">
      {/* ── HERO BANNER ──────────────────────────────────────────────
          Full-bleed edge-to-edge flush with the dark green header (-mt-10).
          Calculated exactly so header + hero = 100vh of the visible screen. */}
      <section
        id="news-hero"
        style={{
          height: `calc(100vh - ${headerHeight}px)`,
          minHeight: '480px',
        }}
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-10 overflow-hidden bg-[#0C2414] text-white flex flex-col justify-between"
      >
        {/* Background Image & Atmospheric Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={newsHeroBgImage}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center transform scale-105 filter brightness-95 contrast-[1.02]"
          />
          {/* Dark on left for text legibility, clear on right */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(5,20,10,0.92) 0%, rgba(5,20,10,0.70) 38%, rgba(5,20,10,0.25) 68%, rgba(5,20,10,0.05) 100%)',
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
          <nav aria-label="Breadcrumb" className="reveal flex items-center gap-2 text-xs text-[#BCE0C2] drop-shadow-xs shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{bannerText.homeBreadcrumb}</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <span className="font-semibold text-white">{bannerText.newsBreadcrumb}</span>
          </nav>

          {/* Center: Badge, Headings, Subtitle */}
          <div className="my-auto py-1 sm:py-2 space-y-4 max-w-3xl">
            <div className="space-y-2.5 sm:space-y-3">
              {/* Live badge */}
              <div className="reveal inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A7F3D0] bg-black/40 border border-white/25 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                <span className="live w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_0_3px_rgba(74,222,128,.3)]" />
                <span>{t('news.badge')}</span>
              </div>

              <h1
                className="reveal text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.14] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: '.06s' }}
              >
                {t('news.title')}
              </h1>

              <p
                className="reveal text-sm sm:text-base text-[#E2F0E5] leading-relaxed max-w-2xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: '.12s' }}
              >
                {t('news.subtitle')}
              </p>
            </div>

            {/* Decorative news-count pill if ready */}
            {state.status === 'ready' && state.total > 0 && (
              <div
                className="reveal inline-flex items-center gap-2 text-xs font-semibold text-[#D5EADB] bg-black/40 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-sm"
                style={{ animationDelay: '.18s' }}
              >
                <Newspaper className="w-3.5 h-3.5 text-[#7FE0A0]" />
                <span>{state.total} ta e'lon mavjud</span>
              </div>
            )}
          </div>

          {/* Bottom: Scroll cue */}
          <div className="reveal pt-1 pb-1 flex items-center shrink-0" style={{ animationDelay: '.22s' }}>
            <button
              type="button"
              onClick={() => {
                catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#BCE0C2] hover:text-white transition-colors cursor-pointer group"
            >
              <span>{bannerText.scrollCue}</span>
              <ChevronDown className="w-4 h-4 text-[#7FE0A0] group-hover:translate-y-0.5 transition-transform animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ── NEWS CATALOG ─────────────────────────────────────────── */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#EFF7F2] py-14 pb-28 -mb-10 text-[#123522]">
        <div ref={catalogRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {state.status === 'loading' && (
          <div className="max-w-5xl mx-auto space-y-6" data-testid="news-loading">
            <Skeleton height="h-72" className="rounded-3xl bg-[#DCEEE0]/80" />
            <Skeleton height="h-72" className="rounded-3xl bg-[#DCEEE0]/80" />
          </div>
        )}

        {state.status === 'error' && (
          <Alert variant="danger" title={t('news.error.title')}>
            {t('news.error.text')}
          </Alert>
        )}

        {state.status === 'ready' && state.items.length === 0 && (
          <div
            data-testid="news-empty"
            className="reveal bg-white border border-[#D5E6DA] rounded-3xl p-12 text-center space-y-3 shadow-md text-[#123522]"
          >
            <Newspaper className="w-10 h-10 mx-auto text-[#2E7D4F]" />
            <p className="text-base text-[#5A6E60]">{t('news.empty')}</p>
          </div>
        )}

        {state.status === 'ready' && state.items.length > 0 && (
          <div
            className="max-w-5xl mx-auto pt-6"
            style={{
              paddingBottom: '2rem',
            }}
          >
            {state.items.map((item, idx) => {
              const isCovered = idx < currentFrontIndex;
              const depth = isCovered ? currentFrontIndex - idx : 0;
              const scale = isCovered ? Math.max(0.88, 1 - depth * 0.035) : 1;
              const brightness = isCovered ? Math.max(0.94, 1 - depth * 0.03) : 1;
              const opacity = isCovered ? Math.max(0.78, 1 - depth * 0.08) : 1;
              const cardImage = NEWS_FALLBACK_IMAGES[idx % NEWS_FALLBACK_IMAGES.length];

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  className="sticky"
                  style={{
                    top: `calc(${headerHeight + 16}px + ${Math.min(idx, 5) * 16}px)`,
                    zIndex: idx + 10,
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'top center',
                      filter: `brightness(${brightness})`,
                      opacity: opacity,
                    }}
                    className="transition-all duration-500 ease-out"
                  >
                    <NewsCard
                      item={item}
                      language={language}
                      attachmentsLabel={t('news.attachments')}
                      readMoreLabel={bannerText.readMore}
                      officialNoticeLabel={bannerText.officialNotice}
                      officialNoticeDescLabel={bannerText.officialNoticeDesc}
                      index={idx}
                      image={cardImage}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {state.status === 'ready' && lastPage > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6" data-testid="news-pagination">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-[#CFE4D6] text-[#123522] bg-white hover:bg-[#EAF5ED] shadow-xs"
            >
              {t('news.prev')}
            </Button>
            <span className="text-xs text-[#5A6E60] font-mono px-2">
              {page} / {lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => p + 1)}
              className="border-[#CFE4D6] text-[#123522] bg-white hover:bg-[#EAF5ED] shadow-xs"
            >
              {t('news.next')}
            </Button>
          </div>
        )}
      </div>
      </section>
    </div>
  );
};

/**
 * Modern 2-column news card with rich visual hierarchy, calendar badge,
 * subtle background watermark, emerald accent indicators, and animated hover states.
 */
function NewsCard({
  item,
  language,
  attachmentsLabel,
  readMoreLabel,
  officialNoticeLabel,
  officialNoticeDescLabel,
  index = 0,
  image,
}: {
  item: NewsItem;
  language: string;
  attachmentsLabel: string;
  readMoreLabel: string;
  officialNoticeLabel: string;
  officialNoticeDescLabel: string;
  index?: number;
  image: string;
}) {
  const title = pickLocalized(item.title, language);
  const body = pickLocalized(item.body, language);
  const dateStr = formatNewsDate(item.publish_from);

  return (
    <Link
      to={`/news/${item.id}`}
      onClick={() => {
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
      }}
      data-testid={`news-item-${item.id}`}
      className="group relative block bg-white border-2 border-[#D2E6D8] hover:border-[#2E7D4F] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_12px_36px_rgba(20,60,35,0.08),0_2px_8px_rgba(20,60,35,0.04)] hover:shadow-[0_20px_48px_rgba(20,60,35,0.12)] transition-all duration-300 overflow-hidden cursor-pointer text-[#123522]"
    >
      {/* Top emerald highlight bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#2E7D4F] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Grid: 2 columns matching the user's reference screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        {/* Left column: Text content */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-5">
          {/* Header pill row */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#EAF7EE] text-[#1E5631] text-xs font-black font-mono border border-[#C2E3CB]">
              #{String(index + 1).padStart(2, '0')}
            </span>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F7F1] text-[#1E5C38] text-xs font-semibold border border-[#CCE4D3]">
              <Calendar className="w-3.5 h-3.5 text-[#2E7D4F]" />
              <span className="font-mono tracking-tight">{dateStr}</span>
            </div>

            {item.files.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E5C38] bg-[#EAF7EE] border border-[#C2E3CB] px-3 py-1.5 rounded-xl">
                <Paperclip className="w-3.5 h-3.5 text-[#2E7D4F]" />
                <span>{attachmentsLabel}: {item.files.length}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#E8F3EB] border border-[#CCE4D3] px-2.5 py-1 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F]" />
                <span>{officialNoticeLabel}</span>
              </span>
            )}
          </div>

          {/* Big Bold Headline */}
          <h2 className="text-2xl sm:text-3xl font-black text-[#123522] group-hover:text-[#2E7D4F] transition-colors duration-200 line-clamp-2 leading-tight tracking-tight">
            {title}
          </h2>

          {/* Excerpt Body */}
          <p className="text-sm sm:text-base text-[#4E6153] leading-relaxed line-clamp-3">
            {body}
          </p>

          {/* Bottom Action Row (with //// and arrow matching reference design) */}
          <div className="pt-5 border-t border-[#E6EFE8] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-[#2E7D4F]">
              <span className="font-mono text-base font-black tracking-widest opacity-85">////</span>
              <div className="w-6 h-6 rounded-full bg-[#E8F3EB] flex items-center justify-center border border-[#CCE4D3] text-[#2E7D4F] group-hover:bg-[#2E7D4F] group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5 transform -rotate-45" />
              </div>
              <span className="text-xs font-semibold text-[#667C6E] group-hover:text-[#123522] transition-colors">
                {officialNoticeDescLabel}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#2E7D4F] group-hover:text-[#1E5631] group-hover:translate-x-1 transition-all">
              <span>{readMoreLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Right column: Image */}
        <div className="lg:col-span-5 w-full">
          <div className="relative w-full h-56 sm:h-64 lg:h-76 rounded-2xl overflow-hidden border border-[#D5E6DA] shadow-md group-hover:border-[#2E7D4F]/50 transition-all">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter brightness-[0.98] contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </Link>
  );
}
