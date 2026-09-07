import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Input } from '../../components/ui/FormControls';
import { Skeleton } from '../../components/ui/Feedback';
import { useLanguage, useT } from '../../i18n/useT';
import { pickName } from '../../lib/localized';
import { api } from '../../api/client';
import type { components } from '../../api/schema';

type FaqItem = components['schemas']['FaqOut'];

export interface FaqPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

interface DisplayFaq {
  id: string;
  q: string;
  a: string;
}

export const FaqPage: React.FC<FaqPageProps> = () => {
  const t = useT();
  const { language } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiFaqs, setApiFaqs] = useState<DisplayFaq[]>([]);

  const fallbackFaqs: DisplayFaq[] = [
    {
      id: 'default-1',
      q: t('faq.item1.question'),
      a: t('faq.item1.answer'),
    },
    {
      id: 'default-2',
      q: t('faq.item2.question'),
      a: t('faq.item2.answer'),
    },
    {
      id: 'default-3',
      q: t('faq.item3.question'),
      a: t('faq.item3.answer'),
    },
    {
      id: 'default-4',
      q: t('faq.item4.question'),
      a: t('faq.item4.answer'),
    },
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
            .map((item: FaqItem) => {
              const q =
                pickName(item.question as any, language) ||
                String(item.question?.uz_latn ?? item.question?.ru ?? '');
              const a =
                pickName(item.answer as any, language) ||
                String(item.answer?.uz_latn ?? item.answer?.ru ?? '');
              return {
                id: item.id,
                q: q.trim(),
                a: a.trim(),
              };
            })
            .filter((item) => item.q.length > 0);
          setApiFaqs(parsed);
        }
      } catch {
        // Fallback is preserved
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadFaq();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const allFaqs: DisplayFaq[] = apiFaqs.length > 0 ? apiFaqs : fallbackFaqs;

  const filteredFaqs = allFaqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('faq.badge')}
        </span>
        <h1 className="text-3xl font-bold text-[#1A1F24]">{t('faq.title')}</h1>
        <p className="text-sm text-[#5A646D] max-w-xl mx-auto pt-1 leading-relaxed">{t('faq.subtitle')}</p>
      </div>

      <div className="max-w-xl mx-auto">
        <Input
          placeholder={t('faq.search.placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          touchSize
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E4E7EA] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <Skeleton height="h-6" width="w-3/4" />
              <Skeleton height="h-4" width="w-full" />
            </div>
          ))
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12 text-[#5A646D] text-sm bg-white border border-[#E4E7EA] rounded-2xl">
            {t('faq.search.placeholder')}
          </div>
        ) : (
          filteredFaqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.id || idx}
                className="bg-white border border-[#E4E7EA] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-base text-[#1A1F24] hover:bg-[#F8F9FA]"
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
                  <div className="px-5 pb-5 pt-1 text-xs text-[#5A646D] leading-relaxed border-t border-[#E4E7EA] bg-[#F8F9FA]">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
