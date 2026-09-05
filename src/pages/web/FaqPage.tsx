import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Input } from '../../components/ui/FormControls';
import { useT } from '../../i18n/useT';

export interface FaqPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const FaqPage: React.FC<FaqPageProps> = () => {
  const t = useT();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const faqs = [
    {
      q: t('faq.item1.question'),
      a: t('faq.item1.answer'),
    },
    {
      q: t('faq.item2.question'),
      a: t('faq.item2.answer'),
    },
    {
      q: t('faq.item3.question'),
      a: t('faq.item3.answer'),
    },
    {
      q: t('faq.item4.question'),
      a: t('faq.item4.answer'),
    },
  ];

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('faq.badge')}
        </span>
        <h1 className="text-3xl font-bold text-[#1A1F24]">{t('faq.title')}</h1>
        <p className="text-sm text-[#5A646D]">
          {t('faq.subtitle')}
        </p>
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
        {faqs
          .filter((f) => f.q.toLowerCase().includes(search.toLowerCase()))
          .map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
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
          })}
      </div>
    </div>
  );
};
