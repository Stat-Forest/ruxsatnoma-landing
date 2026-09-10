import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe2,
  HelpCircle,
  Landmark,
  Layers,
  Search,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { Input } from '../../components/ui/FormControls';
import { Skeleton } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/button';
import { api } from '../../api/client';
import { fetchServices } from '../../api/services';
import { LANGUAGES } from '../../i18n/context';
import { useLanguage, useT } from '../../i18n/useT';
import { pickName } from '../../lib/localized';
import type { components } from '../../api/schema';

type FaqItem = components['schemas']['FaqOut'];

export interface AboutPageProps {
  onNavigate?: (page: string, params?: Record<string, unknown>) => void;
}

interface DisplayFaq {
  id: string;
  q: string;
  a: string;
}

const PRINCIPLE_ICONS = [ShieldCheck, Timer, Layers, FileText] as const;

/** Non-numeric, non-editorial claims about how the system behaves — each one
 *  traceable to a real rule (E-IMZO signing, per-activity `processing_days`
 *  on `/public/refs/activity-types`, one active permit per contour, the
 *  k-anonymity threshold `OpenDataPage` already renders) rather than a
 *  invented figure. Kept as local constants, not `t()` keys: `about.*` does
 *  not exist in `src/i18n/*` yet and this track does not own that directory
 *  (see the track report for the keys a later pass should add). */
const PRINCIPLES: { titleKey: string; body: string }[] = [
  {
    titleKey: 'Huquqiy kuch',
    body: 'Har bir ruxsatnoma E-IMZO raqamli imzolari bilan tasdiqlanadi va qogʻoz hujjat bilan bir xil yuridik kuchga ega.',
  },
  {
    titleKey: 'Belgilangan muddat',
    body: 'Ariza koʻrib chiqish muddati har bir faoliyat turi uchun oldindan koʻrsatilgan va tizim tomonidan nazorat qilinadi.',
  },
  {
    titleKey: 'GIS asosida',
    body: 'Maydon va kontur xaritadan tanlanadi — bir konturga bir vaqtning oʻzida ikkita amaldagi ruxsatnoma berilishi tizim darajasida bloklanadi.',
  },
  {
    titleKey: 'Ochiq hisobot',
    body: 'Umumiy koʻrsatkichlar ochiq eʼlon qilinadi; shaxsni aniqlash mumkin boʻlgan kichik kesimlar maxfiylik uchun yashiriladi.',
  },
];

/** Real legal instruments already named in the project's own decisions and
 *  status notes — informational citations, not invented figures. */
const LEGAL_BASIS = [
  { title: 'Oʻzbekiston Respublikasi Oʻrmon kodeksi', note: 'Oʻrmon fondi yerlaridan foydalanish tartibi' },
  { title: 'VMQ № 689', note: 'Foydalanish uchun toʻlov normalari' },
  { title: 'VMQ № 278', note: 'Imtiyozli toifalar roʻyxati' },
];

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
        <p className="text-sm text-[#1A1F24]">
          Javob topilmadimi? Ishonch telefoniga qoʻngʻiroq qiling yoki rasmiy murojaat yuboring.
        </p>
        <span className="text-sm font-bold text-[#2E7D4F]">Aloqa boʻlimi</span>
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
  const [serviceCount, setServiceCount] = useState<number | null>(null);

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
    <div data-testid="about-page" className="space-y-16 sm:space-y-20">
      <section className="reveal -mx-4 sm:-mx-6 lg:mx-0 rounded-none lg:rounded-[24px] bg-[#0F2C18] px-6 sm:px-12 py-16 sm:py-20 text-white">
        <div className="max-w-3xl mx-auto lg:mx-0 space-y-5">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9CE3AE] bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
            Portal haqida
          </span>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">
            Oʻrmon fondi yerlaridan foydalanish — qogʻozsiz, oydin va tekshiriladigan tartibda
          </h1>
          <p className="text-base text-[#C4D8C9] leading-relaxed max-w-2xl">
            Ruxsatnoma portali fuqaro va tadbirkorga oʻrmon fondi yerlaridan foydalanish uchun
            ruxsatnomani onlayn olish imkonini beradi: ariza berishdan tortib E-IMZO bilan
            imzolangan rasmiy hujjatni yuklab olishgacha.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#23653F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
            Tizim nima uchun kerak
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#123522] leading-tight">
            Bitta ariza, bitta reyestr, bitta hujjat
          </h2>
        </div>
        <div className="space-y-4 text-sm sm:text-base text-[#3F4A52] leading-relaxed">
          <p>
            Ilgari ruxsatnoma olish uchun fuqaro oʻrmon xoʻjaligiga borishi, hujjatlarni qoʻlda
            toʻldirishi va javobni kutishi kerak edi. Har bir xoʻjalik oʻz daftarini yuritardi —
            maydonlar, muddatlar va toʻlovlar bir joyda jamlanmagan edi.
          </p>
          <p>
            Portal shu jarayonni yagona davlat tizimiga koʻchiradi. Ariza onlayn topshiriladi,
            kontur GIS xaritada tanlanadi, toʻlov normalar boʻyicha avtomatik hisoblanadi, hujjat
            esa E-IMZO bilan imzolanadi va QR-kod orqali istalgan vaqtda tekshiriladi.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PRINCIPLES.map((principle, idx) => {
          const Icon = PRINCIPLE_ICONS[idx];
          return (
            <div key={principle.titleKey} className="card-lift border border-[#E4E7EA] rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl bg-[#F0F7F1] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#2E7D4F]" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#123522]">{principle.titleKey}</h3>
              <p className="mt-2 text-sm text-[#5A646D] leading-relaxed">{principle.body}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-[20px] border border-[#E4E7EA] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 sm:p-12 bg-[#F8F9FA] space-y-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#23653F] bg-white px-3 py-1 rounded-full border border-[#D9EBDC]">
            Buyurtmachi
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#123522] leading-snug">
            Oʻrmon va yashil hududlarni koʻpaytirish, choʻllanishga qarshi kurashish agentligi
          </h2>
          <p className="text-sm text-[#5A646D] leading-relaxed">
            Portal Agentlik topshirigʻi asosida yaratilgan. Ruxsatnomalarni berish, ularni nazorat
            qilish va hisobotlarni shakllantirish Agentlik hamda hududiy oʻrmon xoʻjaliklari
            zimmasida.
          </p>
          <div className="flex flex-wrap gap-8 pt-2">
            {serviceCount !== null && (
              <div>
                <div className="text-3xl font-black text-[#123522]">{serviceCount}</div>
                <div className="mt-1 text-xs text-[#5A646D] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> foydalanish yoʻnalishi
                </div>
              </div>
            )}
            <div>
              <div className="text-3xl font-black text-[#123522]">{LANGUAGES.length}</div>
              <div className="mt-1 text-xs text-[#5A646D] flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5" /> interfeys tili
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 sm:p-12 bg-[#123522] text-white space-y-5">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#7FB98A] flex items-center gap-2">
            <Landmark className="w-4 h-4" /> Huquqiy asos
          </div>
          <div className="space-y-4">
            {LEGAL_BASIS.map((doc, idx) => (
              <div
                key={doc.title}
                className={`flex gap-3 ${idx < LEGAL_BASIS.length - 1 ? 'pb-4 border-b border-white/10' : ''}`}
              >
                <FileText className="w-4 h-4 text-[#9CE3AE] shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold">{doc.title}</div>
                  <div className="mt-1 text-xs text-[#A9C2AE]">{doc.note}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('documents')}
            className="flex items-center gap-2 text-sm font-bold text-[#9CE3AE] hover:text-white transition-colors"
          >
            Barcha hujjatlar boʻlimi <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <FaqAccordion />

      <section className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#17331B] to-[#235C39] px-6 sm:px-12 py-10 sm:py-12">
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Ruxsatnoma olishni hoziroq boshlang
            </h2>
            <p className="text-sm text-[#C4D8C9] leading-relaxed">
              OneID orqali kiring, faoliyat turini tanlang va konturni xaritada belgilang —
              qolganini tizim bajaradi.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" size="lg" onClick={() => onNavigate?.('applicant_wizard')}>
              Ariza topshirish <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="!border-white/40 !text-white hover:!bg-white/10"
              onClick={() => onNavigate?.('services')}
            >
              Xizmatlar
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
