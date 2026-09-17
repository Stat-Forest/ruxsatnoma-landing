import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/useT';
import type { UiLanguage } from '../../i18n/context';

interface RatingOption {
  value: number;
  label: string;
}

interface RatingCopy {
  title: string;
  note: string;
  options: RatingOption[];
  submit: string;
  selectPrompt: string;
  thankYou: string;
  change: string;
}

const RATING_TEXT: Record<UiLanguage, RatingCopy> = {
  uz_latn: {
    title: 'Iltimos, portal orqali koʻrsatilgan xizmat sifatini baholang:',
    note: 'Anonim soʻrovnoma • Xizmatlar sifatini oshirishda yordam beradi',
    options: [
      { value: 2, label: '2 (Qoniqarsiz)' },
      { value: 3, label: '3 (Qoniqarli)' },
      { value: 4, label: '4 (Yaxshi)' },
      { value: 5, label: '5 (Aʼlo)' },
    ],
    submit: 'Baholash',
    selectPrompt: 'Iltimos, bahoni tanlang',
    thankYou: 'Bahoyingiz uchun tashakkur!',
    change: 'Oʻzgartirish',
  },
  uz_cyrl: {
    title: 'Илтимос, портал орқали кўрсатилган хизмат сифатини баҳоланг:',
    note: 'Аноним сўровнома • Хизматлар сифатини оширишда ёрдам беради',
    options: [
      { value: 2, label: '2 (Қониқарсиз)' },
      { value: 3, label: '3 (Қониқарли)' },
      { value: 4, label: '4 (Яхши)' },
      { value: 5, label: '5 (Аъло)' },
    ],
    submit: 'Баҳолаш',
    selectPrompt: 'Илтимос, баҳони танланг',
    thankYou: 'Баҳоингиз учун ташаккур!',
    change: 'Ўзгартириш',
  },
  ru: {
    title: 'Пожалуйста, оцените качество услуг, оказанных через портал:',
    note: 'Анонимный опрос • Помогает улучшать качество сервисов',
    options: [
      { value: 2, label: '2 (Неудовлетворительно)' },
      { value: 3, label: '3 (Удовлетворительно)' },
      { value: 4, label: '4 (Хорошо)' },
      { value: 5, label: '5 (Отлично)' },
    ],
    submit: 'Оценить',
    selectPrompt: 'Пожалуйста, выберите оценку',
    thankYou: 'Спасибо за вашу оценку!',
    change: 'Изменить',
  },
  en: {
    title: 'Please rate the quality of service provided through the portal:',
    note: 'Anonymous survey • Helps improve digital public services',
    options: [
      { value: 2, label: '2 (Unsatisfactory)' },
      { value: 3, label: '3 (Satisfactory)' },
      { value: 4, label: '4 (Good)' },
      { value: 5, label: '5 (Excellent)' },
    ],
    submit: 'Submit',
    selectPrompt: 'Please select a rating',
    thankYou: 'Thank you for your rating!',
    change: 'Change',
  },
  kaa: {
    title: 'Iltimas, portal arqalı kórsetilgen xızmet sapasın bahalań:',
    note: 'Anonim sorawnaması • Xızmetler sapasın jaqsılawǵa járdem beredi',
    options: [
      { value: 2, label: '2 (Qanaatarsiz)' },
      { value: 3, label: '3 (Qanaatlanarlı)' },
      { value: 4, label: '4 (Jaqsı)' },
      { value: 5, label: '5 (Aʼlo)' },
    ],
    submit: 'Bahalaw',
    selectPrompt: 'Iltimas, bahandı saylań',
    thankYou: 'Bahańız ushın raxmet!',
    change: 'Ózgertiw',
  },
};

const STORAGE_KEY = 'portal_service_rating';

export const PortalRatingSurvey: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { uiLanguage } = useLanguage();
  const copy = RATING_TEXT[uiLanguage] || RATING_TEXT.uz_latn;

  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 2 && parsed <= 5) {
          setSelectedScore(parsed);
          setSubmitted(true);
        }
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedScore === null) {
      setErrorMsg(copy.selectPrompt);
      return;
    }
    setErrorMsg(null);
    setSubmitted(true);
    try {
      localStorage.setItem(STORAGE_KEY, String(selectedScore));
    } catch {
      // localStorage fallback
    }
  };

  const handleReset = () => {
    setSubmitted(false);
  };

  return (
    <div
      data-testid="portal-rating-survey"
      className={`bg-white/95 backdrop-blur-xs border border-[#D6E6DB] rounded-2xl px-5 py-4 sm:px-6 sm:py-5 shadow-[0_8px_24px_rgba(18,53,34,0.05)] transition-all ${className}`}
    >
      {submitted ? (
        <div className="flex items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EAF5ED] text-[#2E7D4F] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-[13px] font-bold text-[#123522]">{copy.thankYou}</span>
              {selectedScore && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F0F7F2] border border-[#D6E6DB] text-[11px] font-extrabold text-[#2E7D4F]">
                  <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                  {selectedScore} / 5
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D4F] hover:text-[#1B5E20] hover:underline cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{copy.change}</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Compact Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
              <span className="text-xs sm:text-[13.5px] font-extrabold text-[#1A1F24]">
                {copy.title}
              </span>
            </div>
            <span className="text-[11px] text-[#718096] hidden md:inline">
              {copy.note}
            </span>
          </div>

          {/* 4 Compact Horizontal Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {copy.options.map((opt) => {
              const isSelected = selectedScore === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedScore(opt.value);
                    setErrorMsg(null);
                  }}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#EAF5ED] border-[#2E7D4F] shadow-xs text-[#123522] ring-1 ring-[#2E7D4F]/30'
                      : 'bg-[#F8FAF9] hover:bg-white border-[#D6E6DB] hover:border-[#2E7D4F]/50 text-[#374151]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#2E7D4F] text-white'
                          : 'bg-white border border-[#D6E6DB] text-[#2E7D4F] group-hover:bg-[#2E7D4F] group-hover:text-white'
                      }`}
                    >
                      {opt.value}
                    </span>
                    <span className="text-xs font-bold truncate">
                      {opt.label.replace(/^\d+\s*/, '')}
                    </span>
                  </div>

                  <div className="flex items-center shrink-0">
                    <Star
                      className={`w-3 h-3 ${
                        isSelected
                          ? 'text-[#F59E0B] fill-[#F59E0B]'
                          : 'text-[#D1D5DB] fill-[#D1D5DB] group-hover:text-[#F59E0B] group-hover:fill-[#F59E0B]'
                      } transition-colors`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {errorMsg && (
            <div className="text-[11.5px] font-bold text-rose-600 animate-in fade-in flex items-center gap-1">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Bottom Row */}
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <span className="text-[11px] text-[#718096] md:hidden truncate">
              {copy.note}
            </span>
            <span className="hidden md:inline" />

            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#2E7D4F] hover:bg-[#23653F] text-white text-xs font-bold shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer shrink-0 ml-auto"
            >
              {copy.submit}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
export default PortalRatingSurvey;
