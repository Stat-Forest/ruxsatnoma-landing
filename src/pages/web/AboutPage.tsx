import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Globe2,
  HelpCircle,
  Home,
  Landmark,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  XCircle,
} from 'lucide-react';
import { Input } from '../../components/ui/FormControls';
import { Skeleton } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/button';
import { api } from '../../api/client';
import { fetchServices } from '../../api/services';
import { LANGUAGES } from '../../i18n/context';
import { useLanguage, useT } from '../../i18n/useT';
import { pickName } from '../../lib/localized';
import aboutHeroBgImage from '../../assets/img/about-hero.jpg';
import type { components } from '../../api/schema';
import type { UiLanguage } from '../../i18n/context';

type FaqItem = components['schemas']['FaqOut'];

export interface AboutPageProps {
  onNavigate?: (page: string, params?: Record<string, unknown>) => void;
}

interface DisplayFaq {
  id: string;
  q: string;
  a: string;
}

interface AboutBannerText {
  homeBreadcrumb: string;
  aboutBreadcrumb: string;
  scrollCue: string;
}

const ABOUT_BANNER_TEXT: Record<UiLanguage, AboutBannerText> = {
  uz_latn: {
    homeBreadcrumb: 'Bosh sahifa',
    aboutBreadcrumb: 'Portal haqida',
    scrollCue: "Batafsil ma'lumot",
  },
  ru: {
    homeBreadcrumb: 'Главная',
    aboutBreadcrumb: 'О портале',
    scrollCue: 'Подробнее о портале',
  },
  uz_cyrl: {
    homeBreadcrumb: 'Бош саҳифа',
    aboutBreadcrumb: 'Портал ҳақида',
    scrollCue: 'Батафсил маълумот',
  },
  en: {
    homeBreadcrumb: 'Home',
    aboutBreadcrumb: 'About Portal',
    scrollCue: 'Learn more',
  },
  kaa: {
    homeBreadcrumb: 'Bas bet',
    aboutBreadcrumb: 'Portal haqqında',
    scrollCue: 'Tolıqraq maǵlıwmat',
  },
};

interface WhyExtras {
  badge: string;
  subtitle: string;
  oldTitle: string;
  oldBadge: string;
  oldPoints: [string, string, string];
  newTitle: string;
  newBadge: string;
  newPoints: [string, string, string];
  principlesBadge: string;
  principlesTitle: string;
  principlesSubtitle: string;
}

const WHY_EXTRAS: Record<UiLanguage, WhyExtras> = {
  uz_latn: {
    badge: 'Transformatsiya va natija',
    subtitle: "Eski qog'ozbozlik tartibidan zamonaviy davlat raqamli ekotizimiga o'tish",
    oldTitle: "An'anaviy qog'oz tartibi",
    oldBadge: 'Eski tizim',
    oldPoints: [
      "O'rmon xo'jaligiga shaxsan borish talab etilardi",
      "Har bir xo'jalik alohida daftarda hisob yuritgan",
      "To'lovlar va muddatlar markazlashmagan edi",
    ],
    newTitle: 'Yagona davlat elektron portali',
    newBadge: '100% Onlayn va Shaffof',
    newPoints: [
      'Istalgan joydan turib onlayn ariza topshirish',
      "GIS xaritada aniq kontur va maydonni belgilash",
      'E-IMZO bilan tasdiqlangan QR-kodli rasmiy ruxsatnoma',
    ],
    principlesBadge: 'Xavfsizlik va standartlar',
    principlesTitle: 'Tizimning asosiy tamoyillari',
    principlesSubtitle: 'Shaffoflik, xavfsizlik va huquqiy kafolatga asoslangan 4 ustun',
  },
  ru: {
    badge: 'Трансформация и результат',
    subtitle: 'Переход от бумажной волокиты к современной государственной цифровой экосистеме',
    oldTitle: 'Традиционный бумажный порядок',
    oldBadge: 'Старая система',
    oldPoints: [
      'Требовалось личное посещение лесного хозяйства',
      'Каждое хозяйство вело учет в отдельных журналах',
      'Платежи и сроки не были централизованы',
    ],
    newTitle: 'Единый государственный электронный портал',
    newBadge: '100% Онлайн и Прозрачно',
    newPoints: [
      'Подача заявки онлайн из любого места',
      'Выбор точного контура и площади на ГИС-карте',
      'Официальное разрешение с QR-кодом и ЭЦП',
    ],
    principlesBadge: 'Безопасность и стандарты',
    principlesTitle: 'Основные принципы системы',
    principlesSubtitle: '4 столпа прозрачности, безопасности и правовой гарантии',
  },
  uz_cyrl: {
    badge: 'Трансформация ва натижа',
    subtitle: 'Эски қоғозбозлик тартибидан замонавий давлат рақамли экотизимига ўтиш',
    oldTitle: 'Анъанавий қоғоз тартиби',
    oldBadge: 'Эски тизим',
    oldPoints: [
      'Ўрмон хўжалигига шахсан бориш талаб этиларди',
      'Ҳар бир хўжалик алоҳида дафтарда ҳисоб юритган',
      'Тўловлар ва муддатлар марказлашмаган эди',
    ],
    newTitle: 'Ягона давлат электрон портали',
    newBadge: '100% Онлайн ва Шаффоф',
    newPoints: [
      'Исталган жойдан туриб онлайн ариза топшириш',
      'GIS харитада аниқ контур ва майдонни белгилаш',
      'Э-ИМЗО билан тасдиқланган QR-кодли расмий рухсатнома',
    ],
    principlesBadge: 'Хавфсизлик ва стандартлар',
    principlesTitle: 'Тизимнинг асосий тамойиллари',
    principlesSubtitle: 'Шаффофлик, хавфсизлик ва ҳуқуқий кафолатга асосланган 4 устун',
  },
  en: {
    badge: 'Transformation & Results',
    subtitle: 'Transitioning from manual paperwork to a modern state digital ecosystem',
    oldTitle: 'Traditional Paper Process',
    oldBadge: 'Legacy system',
    oldPoints: [
      'In-person visits to forestry department required',
      'Dispersed paper record keeping across districts',
      'Decentralized fee calculation and unpredictable terms',
    ],
    newTitle: 'Unified State Digital Portal',
    newBadge: '100% Online & Transparent',
    newPoints: [
      'Apply online anytime from home or office',
      'Select exact contour boundaries on GIS map',
      'Official permit with E-Signature and QR code',
    ],
    principlesBadge: 'Security & Standards',
    principlesTitle: 'Core System Principles',
    principlesSubtitle: '4 pillars of transparency, security and legal guarantee',
  },
  kaa: {
    badge: 'Transformatsiya hám nátiyje',
    subtitle: 'Eski qagʻazbaplıq tártibinen zamanagóy mámleketlik sanlı ekosistemaǵa ótiw',
    oldTitle: 'Dástúriy qagʻaz tártibi',
    oldBadge: 'Eski sistema',
    oldPoints: [
      'Orman xojalıǵına jeke ózi barıw talap etiletuǵın edi',
      'Hár bir xojalıq bólek dápterde esap júrgizgen',
      'Tólemler hám múddetler oraylaspaǵan edi',
    ],
    newTitle: 'Birimlesken mámleketlik elektron portal',
    newBadge: '100% Onlayn hám Ashıq',
    newPoints: [
      'Qálegen jerden onlayn arza tapsırıw',
      'GIS kartada anıq kontur hám maydandı belgilew',
      'E-IMZO menen tastıyıqlanǵan QR-kodlı rásmiy ruxsatnama',
    ],
    principlesBadge: 'Qáwipsizlik hám standartlar',
    principlesTitle: 'Sistemanıń tiykarǵı principleri',
    principlesSubtitle: 'Ashıqlıq, qáwipsizlik hám yuridikalıq kepillikke tiykarlanǵan 4 ustın',
  },
};

interface PrincipleMeta {
  tag: Record<UiLanguage, string>;
  featureBadge: Record<UiLanguage, string>;
  bullet: Record<UiLanguage, string>;
}

const PRINCIPLE_METAS: Record<'legal' | 'term' | 'gis' | 'openData', PrincipleMeta> = {
  legal: {
    tag: {
      uz_latn: 'E-IMZO & QR-KOD',
      ru: 'ЭЦП И QR-КОД',
      uz_cyrl: 'Э-ИМЗО ВА QR-КОД',
      en: 'E-SIGNATURE & QR',
      kaa: 'E-IMZO HÁM QR-KOD',
    },
    featureBadge: {
      uz_latn: 'Yuridik kafolat',
      ru: 'Юридическая сила',
      uz_cyrl: 'Юридик кафолат',
      en: 'Legal validity',
      kaa: 'Yuridikalıq kepillik',
    },
    bullet: {
      uz_latn: 'Qogʻoz hujjat bilan teng kuchga ega',
      ru: 'Равносильно бумажному документу',
      uz_cyrl: 'Қоғоз ҳужжат билан тенг кучга эга',
      en: 'Equal to paper certificate',
      kaa: 'Qagʻaz hújjet penen teń kúshke iye',
    },
  },
  term: {
    tag: {
      uz_latn: 'REGLAMENT NAZORATI',
      ru: 'РЕГЛАМЕНТ И СРОКИ',
      uz_cyrl: 'РЕГЛАМЕНТ НАЗОРАТИ',
      en: 'REGULATION CONTROL',
      kaa: 'REGLAMENT QADAǴALAW',
    },
    featureBadge: {
      uz_latn: 'Vaqt nazorati',
      ru: 'Контроль сроков',
      uz_cyrl: 'Вақт назорати',
      en: 'Deadline tracking',
      kaa: 'Waqıt qadaǵalaw',
    },
    bullet: {
      uz_latn: 'Har bir bosqich tizim nazoratida',
      ru: 'Каждый этап контролируется системой',
      uz_cyrl: 'Ҳар бир босқич тизим назоратида',
      en: 'Every stage tracked by system',
      kaa: 'Hár bir basqısh sistema baqlawında',
    },
  },
  gis: {
    tag: {
      uz_latn: 'GEO-MONITORING',
      ru: 'ГЕОМОНИТОРИНГ',
      uz_cyrl: 'ГЕО-МОНИТОРИНГ',
      en: 'GEO-MONITORING',
      kaa: 'GEO-MONITORING',
    },
    featureBadge: {
      uz_latn: 'Dublikatsiz ajratish',
      ru: 'Защита от дубликатов',
      uz_cyrl: 'Дубликатсиз ажратиш',
      en: 'No contour overlap',
      kaa: 'Dublikatsız ajıratıw',
    },
    bullet: {
      uz_latn: 'Xaritada aniq chegaralar va konturlar',
      ru: 'Точные границы и контуры на карте',
      uz_cyrl: 'Харитада аниқ чегаралар ва контурлар',
      en: 'Accurate boundaries on map',
      kaa: 'Kartada anıq shegaralar hám konturlar',
    },
  },
  openData: {
    tag: {
      uz_latn: 'SHAFFOFLIK',
      ru: 'ПРОЗРАЧНОСТЬ',
      uz_cyrl: 'ШАФФОФЛИК',
      en: 'TRANSPARENCY',
      kaa: 'ASHÍQLÍQ',
    },
    featureBadge: {
      uz_latn: 'Maxfiylik himoyasi',
      ru: 'Защита данных',
      uz_cyrl: 'Махфийлик ҳимояси',
      en: 'Privacy protected',
      kaa: 'Qupiyalılıq qorǵawı',
    },
    bullet: {
      uz_latn: 'Ochiq reyestr va xavfsiz shifrlash',
      ru: 'Открытый реестр и защита данных',
      uz_cyrl: 'Очиқ реестр ва хавфсиз шифрлаш',
      en: 'Public registry with privacy safeguards',
      kaa: 'Ashıq reyestr hám qáwipsiz shifrlaw',
    },
  },
};

/**
 * Non-numeric, non-editorial claims about how the system behaves — each one
 * traceable to a real rule (E-IMZO signing, per-activity `processing_days`
 * on `/public/refs/activity-types`, one active permit per contour, the
 * k-anonymity threshold the open-data endpoint already publishes) rather
 * than an invented figure. The copy itself is `about.principle.*` in all
 * five languages; only the icon and the key stem live here.
 */
const PRINCIPLES = [
  { key: 'legal', Icon: ShieldCheck },
  { key: 'term', Icon: Timer },
  { key: 'gis', Icon: Layers },
  { key: 'openData', Icon: FileText },
] as const;

/** Real legal instruments already named in the project's own decisions and
 *  status notes — informational citations, not invented figures. */
const LEGAL_BASIS = ['code', 'vmq689', 'vmq278'] as const;

/** Same rate-limit-aware fallback text every `/public/*` page writes locally.
 *  The FAQ section below only needs the fallback branch (a fetch failure
 *  simply falls back to the four seeded questions), so this stays terse. */
function faqLoadFailed(): void {
  // Intentionally empty: failure just means the four fallback questions
  // stay on screen, same as `FaqPage` did before this page replaced it.
}

function FaqAccordion() {
  const t = useT();
  const { language } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiFaqs, setApiFaqs] = useState<DisplayFaq[]>([]);

  const fallbackFaqs: DisplayFaq[] = [
    { id: 'default-1', q: t('faq.item1.question'), a: t('faq.item1.answer') },
    { id: 'default-2', q: t('faq.item2.question'), a: t('faq.item2.answer') },
    { id: 'default-3', q: t('faq.item3.question'), a: t('faq.item3.answer') },
    { id: 'default-4', q: t('faq.item4.question'), a: t('faq.item4.answer') },
  ];

  useEffect(() => {
    let cancelled = false;
    async function loadFaq() {
      try {
        const { data } = await api.GET('/api/v1/help/faq');
        if (cancelled) return;
        if (data && Array.isArray(data) && data.length > 0) {
          const parsed = data
            .filter((item: FaqItem) => item.status === 'published' || !item.status)
            .map((item: FaqItem) => ({
              id: item.id,
              q: pickName(item.question as Record<string, unknown> | null, language).trim(),
              a: pickName(item.answer as Record<string, unknown> | null, language).trim(),
            }))
            .filter((item) => item.q.length > 0);
          setApiFaqs(parsed);
        }
      } catch {
        faqLoadFailed();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadFaq();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const allFaqs = apiFaqs.length > 0 ? apiFaqs : fallbackFaqs;
  const filtered = allFaqs.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section id="savollar" className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#23653F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
            {t('faq.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#123522]">{t('faq.title')}</h2>
          <p className="text-sm text-[#5A646D] leading-relaxed">{t('faq.subtitle')}</p>
        </div>
        <div className="w-full lg:w-80">
          <Input
            placeholder={t('faq.search.placeholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            touchSize
          />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-[#E4E7EA] rounded-2xl p-5 space-y-2">
              <Skeleton height="h-6" width="w-3/4" />
              <Skeleton height="h-4" width="w-full" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#5A646D] bg-white border border-[#E4E7EA] rounded-2xl">
            {t('faq.search.placeholder')}
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.id || idx}
                className={`bg-white border rounded-2xl overflow-hidden transition-colors ${
                  isOpen ? 'border-[#7FB98A]' : 'border-[#E4E7EA]'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-base text-[#123522] hover:bg-[#F8F9FA]"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-[#2E7D4F] shrink-0" />
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#767F87] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#767F87] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-[#3F4A52] leading-relaxed border-t border-[#E4E7EA] bg-[#F8F9FA]">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5 rounded-2xl border border-[#D9EBDC] bg-[#F0F7F1]">
        <div>
          <h3 className="text-sm font-bold text-[#123522]">{t('faq.footer.title')}</h3>
          <p className="text-xs text-[#5A646D] mt-0.5">{t('faq.footer.body')}</p>
        </div>
        <a
          href="/contact"
          className="text-xs font-bold text-[#23653F] hover:underline shrink-0"
        >
          {t('faq.footer.cta')} →
        </a>
      </div>
    </section>
  );
}

/**
 * Task 14 (about half) — `/about`, and `/faq` redirects here (the standalone
 * FAQ screen is retired). Ports `FaqPage`'s search/single-open accordion
 * into a section of this page rather than dropping any of its behaviour —
 * same live `/api/v1/help/faq` read with the same four-question fallback.
 */
export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const t = useT();
  const { uiLanguage } = useLanguage();
  const [serviceCount, setServiceCount] = useState<number | null>(null);
  const [headerHeight, setHeaderHeight] = useState(132);
  const contentRef = useRef<HTMLDivElement>(null);
  const bannerText = ABOUT_BANNER_TEXT[uiLanguage] ?? ABOUT_BANNER_TEXT.uz_latn;
  const whyExtras = WHY_EXTRAS[uiLanguage] ?? WHY_EXTRAS.uz_latn;

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
    let cancelled = false;
    fetchServices()
      .then((services) => {
        if (!cancelled) setServiceCount(services.length);
      })
      .catch(() => {
        // The stat simply does not render — never a guessed count.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div data-testid="about-page" className="font-sans bg-[#EFF7F2]">
      {/* ── HERO BANNER ──────────────────────────────────────────────
          Full-bleed edge-to-edge flush with the dark green header (-mt-10).
          Calculated exactly so header + hero = 100vh of the visible screen. */}
      <section
        id="about-hero"
        style={{
          height: `calc(100vh - ${headerHeight}px)`,
          minHeight: '480px',
        }}
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-10 overflow-hidden bg-[#0C2414] text-white flex flex-col justify-between"
      >
        {/* Background Image & Atmospheric Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={aboutHeroBgImage}
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
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{bannerText.homeBreadcrumb}</span>
            </button>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <span className="font-semibold text-white">{bannerText.aboutBreadcrumb}</span>
          </nav>

          {/* Center: Badge, Headings, Subtitle */}
          <div className="my-auto py-1 sm:py-2 space-y-4 max-w-3xl">
            <div className="space-y-2.5 sm:space-y-3">
              {/* Badge */}
              <div className="reveal inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A7F3D0] bg-black/40 border border-white/25 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span>{t('about.hero.badge')}</span>
              </div>

              <h1
                className="reveal text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.14] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: '.06s' }}
              >
                {t('about.hero.title')}
              </h1>

              <p
                className="reveal text-sm sm:text-base text-[#E2F0E5] leading-relaxed max-w-2xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: '.12s' }}
              >
                {t('about.hero.body')}
              </p>
            </div>
          </div>

          {/* Bottom: Scroll cue */}
          <div className="reveal pt-1 pb-1 flex items-center shrink-0" style={{ animationDelay: '.22s' }}>
            <button
              type="button"
              onClick={() => {
                contentRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#BCE0C2] hover:text-white transition-colors cursor-pointer group"
            >
              <span>{bannerText.scrollCue}</span>
              <ChevronDown className="w-4 h-4 text-[#7FE0A0] group-hover:translate-y-0.5 transition-transform animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ── ABOUT CONTENT ─────────────────────────────────────────── */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#EFF7F2] py-14 pb-20 -mb-10">
        <div ref={contentRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
          {/* ── 1. TRANSFORMATION STORY (OLD VS NEW) ─────────────────── */}
          <section className="space-y-8 sm:space-y-10">
            <div className="space-y-3 max-w-3xl">
              <div className="hero-fade-up inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E5C38] bg-[#E3F4E8] px-3.5 py-1.5 rounded-full border border-[#BCE3C7] shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D4F] live inline-block" />
                <span>{whyExtras.badge}</span>
              </div>
              <h2 className="hero-fade-up font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-[#123522] tracking-tight leading-tight" style={{ animationDelay: '.08s' }}>
                {t('about.why.title')}
              </h2>
              <p className="hero-fade-up text-sm sm:text-base text-[#526B5A] leading-relaxed max-w-2xl" style={{ animationDelay: '.16s' }}>
                {whyExtras.subtitle}
              </p>
            </div>

            {/* Comparison Cards: Before vs Now */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Old paper-based system */}
              <div className="hero-fade-up card-lift relative bg-gradient-to-b from-[#FAFBFB] via-white to-[#F4F5F6] rounded-3xl p-7 sm:p-9 border border-[#E2E6E9] shadow-xs hover:shadow-md transition-all duration-700 ease-out hover:-translate-y-1 overflow-hidden flex flex-col justify-between group" style={{ animationDelay: '.22s' }}>
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#9AA3AB] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] bg-[#F3F4F6] px-3.5 py-1.5 rounded-full border border-[#E5E7EB]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                      {whyExtras.oldBadge}
                    </span>
                    <span className="text-xs font-mono font-medium text-[#9CA3AF] bg-white px-2.5 py-1 rounded-lg border border-[#E5E7EB]">
                      Qogʻoz shakli
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#374151]">
                      {whyExtras.oldTitle}
                    </h3>
                    <p className="text-sm text-[#5A646D] leading-relaxed pt-2">
                      {t('about.why.before')}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-[#E5E7EB] space-y-2.5">
                  {whyExtras.oldPoints.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-[#6B7280]">
                      <XCircle className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modern digital portal */}
              <div className="hero-fade-up card-lift relative bg-gradient-to-br from-white via-[#F2FAF5] to-[#E5F5EB] rounded-3xl p-7 sm:p-9 border-2 border-[#2E7D4F]/35 hover:border-[#2E7D4F] shadow-[0_12px_36px_rgba(46,125,79,0.08)] hover:shadow-[0_22px_48px_rgba(46,125,79,0.15)] transition-all duration-700 ease-out hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between group" style={{ animationDelay: '.3s' }}>
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2E7D4F] via-[#34D399] to-[#2E7D4F] opacity-90 group-hover:opacity-100 transition-opacity duration-700 ease-out" />
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#15803D] bg-[#DCFCE7] px-3.5 py-1.5 rounded-full border border-[#86EFAC] shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] live inline-block" />
                      {whyExtras.newBadge}
                    </span>
                    <span className="text-xs font-bold text-[#166534] bg-[#DCFCE7] px-3 py-1 rounded-lg border border-[#BBF7D0]">
                      Yagona portal
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#123522]">
                      {whyExtras.newTitle}
                    </h3>
                    <p className="text-sm font-medium text-[#14321E] leading-relaxed pt-2">
                      {t('about.why.now')}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-[#D5EADB] space-y-2.5">
                  {whyExtras.newPoints.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-[#1F633B]">
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── 2. SYSTEM PRINCIPLES (4 PILLARS) ───────────────────────── */}
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#CCE4D3]/70 pb-6">
              <div className="space-y-2">
                <div className="hero-fade-up inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E5C38] bg-[#E3F4E8] px-3.5 py-1.5 rounded-full border border-[#BCE3C7] shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#2E7D4F]" />
                  <span>{whyExtras.principlesBadge}</span>
                </div>
                <h3 className="hero-fade-up font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-[#123522] tracking-tight" style={{ animationDelay: '.08s' }}>
                  {whyExtras.principlesTitle}
                </h3>
                <p className="hero-fade-up text-xs sm:text-sm text-[#526B5A] max-w-2xl leading-relaxed" style={{ animationDelay: '.16s' }}>
                  {whyExtras.principlesSubtitle}
                </p>
              </div>
              <div className="hero-fade-up hidden sm:inline-flex items-center gap-2 text-xs font-bold text-[#23653F] bg-white px-4 py-2 rounded-2xl border border-[#CCE4D3] shadow-2xs shrink-0" style={{ animationDelay: '.22s' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] live inline-block" />
                <span>Yagona davlat standarti</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRINCIPLES.map(({ key, Icon }, idx) => {
                const meta = PRINCIPLE_METAS[key];
                const tag = meta.tag[uiLanguage] ?? meta.tag.uz_latn;
                const featureBadge = meta.featureBadge[uiLanguage] ?? meta.featureBadge.uz_latn;
                const bullet = meta.bullet[uiLanguage] ?? meta.bullet.uz_latn;

                return (
                  <div
                    key={key}
                    className="hero-fade-up card-lift group relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-[#D5E6DA] hover:border-[#2E7D4F] shadow-[0_4px_24px_rgba(18,53,34,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(26,77,46,0.16)] transition-all duration-700 ease-out hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between cursor-default"
                    style={{ animationDelay: `${idx * 0.12}s` }}
                  >
                    {/* Top glowing animated bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2E7D4F] via-[#34D399] to-[#059669] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none" />

                    {/* Left indicator accent line */}
                    <div className="absolute left-0 top-8 bottom-8 w-1 rounded-r-full bg-[#2E7D4F] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out transform -translate-x-1 group-hover:translate-x-0 pointer-events-none" />

                    {/* Radial ambient glow */}
                    <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-[#2E7D4F]/5 group-hover:bg-[#2E7D4F]/10 blur-2xl transition-all duration-1000 ease-out pointer-events-none" />

                    {/* Watermark Icon */}
                    <Icon
                      aria-hidden="true"
                      className="absolute -right-4 -bottom-4 w-32 h-32 text-[#2E7D4F]/[0.03] group-hover:text-[#2E7D4F]/[0.07] group-hover:scale-108 group-hover:-rotate-3 transition-all duration-1000 ease-out pointer-events-none"
                    />

                    {/* Top section: Icon, counter, title, body */}
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#2E7D4F] via-[#246B42] to-[#123522] text-white flex items-center justify-center shadow-md shadow-[#2E7D4F]/20 group-hover:scale-105 group-hover:rotate-1 group-hover:shadow-md group-hover:shadow-[#2E7D4F]/30 transition-all duration-700 ease-out">
                          <Icon className="w-6 h-6 text-[#E8F8EE]" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-mono font-black text-[#1E5C38] bg-[#EAF7EE] border border-[#BDE5C8] px-2.5 py-1 rounded-xl shadow-2xs group-hover:bg-[#2E7D4F] group-hover:text-white transition-colors duration-500 ease-out">
                            0{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#738A7A]">
                            {tag}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-[#102A1D] group-hover:text-[#23653F] transition-colors duration-500 ease-out leading-snug pt-1">
                        {t(`about.principle.${key}.title`)}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#4E6354] leading-relaxed">
                        {t(`about.principle.${key}.body`)}
                      </p>
                    </div>

                    {/* Bottom section: Specific feature badge & bullet */}
                    <div className="pt-4 mt-6 border-t border-[#E8F2EB] flex flex-col gap-2 relative z-10">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E5C38] bg-[#F0F8F3] px-3 py-1.5 rounded-xl border border-[#CCE4D3] group-hover:bg-[#E3F4E8] group-hover:border-[#2E7D4F]/40 transition-colors duration-500 ease-out w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                        <span>{featureBadge}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#627768] pt-1">
                        <span>{bullet}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#2E7D4F] opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out shrink-0 ml-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 3. CUSTOMER & LEGAL BASIS (BALANCED DUAL CARDS) ───────── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Card: Customer (Agentlik) */}
            <div className="hero-fade-up card-lift group relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-[#D5E6DA] hover:border-[#2E7D4F] shadow-[0_4px_24px_rgba(18,53,34,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(26,77,46,0.14)] transition-all duration-700 ease-out hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              {/* Top glowing bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2E7D4F] via-[#34D399] to-[#059669] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none" />

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E5C38] bg-[#E3F4E8] px-3.5 py-1.5 rounded-full border border-[#BCE3C7] shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D4F] live inline-block" />
                  <span>{t('about.customer.badge')}</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-black text-[#123522] leading-snug">
                  {t('about.customer.title')}
                </h2>
                <p className="text-sm text-[#4E6354] leading-relaxed">
                  {t('about.customer.body')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8 mt-6 border-t border-[#E8F2EB]">
                {serviceCount !== null && (
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#F4FAF6] border border-[#D5EADB]">
                    <div className="w-11 h-11 rounded-xl bg-[#E3F4E8] text-[#2E7D4F] flex items-center justify-center shrink-0 shadow-2xs">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[#123522] leading-none">{serviceCount}</div>
                      <div className="mt-1 text-xs text-[#526B5A] font-medium leading-tight">
                        {t('about.customer.servicesUnit')}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#F4FAF6] border border-[#D5EADB]">
                  <div className="w-11 h-11 rounded-xl bg-[#E3F4E8] text-[#2E7D4F] flex items-center justify-center shrink-0 shadow-2xs">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#123522] leading-none">{LANGUAGES.length}</div>
                    <div className="mt-1 text-xs text-[#526B5A] font-medium leading-tight">
                      {t('about.customer.languagesUnit')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Legal Basis (Huquqiy asos - Light, modern & cohesive) */}
            <div className="hero-fade-up card-lift group relative bg-gradient-to-br from-white via-[#F6FAF7] to-[#EEF7F1] rounded-3xl p-8 sm:p-10 border border-[#CCE4D3] hover:border-[#2E7D4F] shadow-[0_4px_24px_rgba(18,53,34,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(26,77,46,0.14)] transition-all duration-700 ease-out hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
              {/* Top glowing bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2E7D4F] via-[#34D399] to-[#059669] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out pointer-events-none" />

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E5C38] bg-[#E3F4E8] px-3.5 py-1.5 rounded-full border border-[#BCE3C7] shadow-2xs">
                  <Landmark className="w-3.5 h-3.5 text-[#2E7D4F]" />
                  <span>{t('about.legal.heading')}</span>
                </div>

                <div className="space-y-3 pt-1">
                  {LEGAL_BASIS.map((doc) => (
                    <div
                      key={doc}
                      className="group/item flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#E1EBE4] hover:border-[#2E7D4F]/50 hover:bg-[#F2FAF5] transition-all duration-500 ease-out shadow-2xs"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#E8F6ED] text-[#2E7D4F] flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-[#2E7D4F] group-hover/item:text-white transition-colors duration-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-[#142D1E] group-hover/item:text-[#23653F] transition-colors duration-300">
                          {t(`about.legal.${doc}.title`)}
                        </div>
                        <div className="mt-0.5 text-xs text-[#526B5A] leading-relaxed">
                          {t(`about.legal.${doc}.note`)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#DDECE1]">
                <button
                  type="button"
                  onClick={() => onNavigate?.('documents')}
                  className="group/btn w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-2xl bg-white hover:bg-[#2E7D4F] text-[#1E5C38] hover:text-white border border-[#CCE4D3] hover:border-[#2E7D4F] font-bold text-sm shadow-xs hover:shadow-md transition-all duration-500 ease-out cursor-pointer"
                >
                  <span>{t('about.legal.allDocuments')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-out group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </section>

          <FaqAccordion />

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17331B] to-[#235C39] px-6 sm:px-12 py-10 sm:py-12 shadow-md">
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-xl space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{t('about.cta.title')}</h2>
                <p className="text-sm text-[#C4D8C9] leading-relaxed">{t('about.cta.body')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="lg" onClick={() => onNavigate?.('applicant_wizard')}>
                  {t('action.submitApplication')} <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="!border-white/40 !text-white hover:!bg-white/10"
                  onClick={() => onNavigate?.('services')}
                >
                  {t('nav.services')}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};
