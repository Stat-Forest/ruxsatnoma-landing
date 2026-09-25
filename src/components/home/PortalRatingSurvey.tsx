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

export const PortalRatingSurvey: React.FC<{ className?: string; variant?: 'light' | 'dark' }> = ({ className = '', variant = 'light' }) => {
  const { uiLanguage } = useLanguage();
  const copy = RATING_TEXT[uiLanguage] || RATING_TEXT.uz_latn;

  const isDark = variant === 'dark';

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
      className={`${isDark ? 'bg-transparent text-white' : 'bg-white/95 text-[#1A1F24] border border-[#E6F4EA] shadow-[0_8px_30px_rgba(18,53,34,0.08)] backdrop-blur-md'} rounded-2xl p-6 sm:p-8 transition-all duration-500 ${className}`}
    >
      {submitted ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-[#34D399]/20' : 'bg-[#EAF5ED]'} flex items-center justify-center shrink-0`}>
              <CheckCircle2 className={`w-5 h-5 ${isDark ? 'text-[#34D399]' : 'text-[#2E7D4F]'}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-xs sm:text-[13px] font-bold ${isDark ? 'text-white' : 'text-[#123522]'}`}>{copy.thankYou}</span>
              {selectedScore && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold ${isDark ? 'bg-white/10 border-white/20 text-[#9CE3AE]' : 'bg-[#F0F7F2] border-[#D6E6DB] text-[#2E7D4F]'} border`}>
                  <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                  {selectedScore} / 5
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-[#9CE3AE] hover:text-white' : 'text-[#2E7D4F] hover:text-[#1B5E20]'} hover:underline cursor-pointer shrink-0`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{copy.change}</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Compact Header */}
          <div className="flex flex-col gap-0.5 lg:h-[88px]">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-[#34D399]' : 'text-[#2E7D4F]'} shrink-0`} />
              <span className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]' : 'text-[#1A1F24]'}`}>
                {copy.title}
              </span>
            </div>
            <span className={`text-[11px] sm:text-xs leading-snug pl-5.5 ml-0.5 ${isDark ? 'text-[#E1EFE3] drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]' : 'text-[#718096]'}`}>
              {copy.note}
            </span>
          </div>

          {/* Compact Horizontal Chips */}
          <div className={`grid ${isDark ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-2.5`}>
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
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left backdrop-blur-md transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-[#123522]/80 border-[#34D399] shadow-[0_0_15px_rgba(52,211,153,0.2)] text-white ring-1 ring-[#34D399]/30'
                        : 'bg-[#EAF5ED] border-[#2E7D4F] shadow-xs text-[#123522] ring-1 ring-[#2E7D4F]/30'
                      : isDark
                        ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white'
                        : 'bg-[#F8FAF9] hover:bg-white border-[#D6E6DB] hover:border-[#2E7D4F]/50 text-[#374151]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-[#34D399] text-[#04120A]'
                            : 'bg-[#2E7D4F] text-white'
                          : isDark
                            ? 'bg-white/10 border border-white/20 text-[#34D399] group-hover:bg-[#34D399] group-hover:text-[#04120A]'
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
          <div className="flex items-center justify-end pt-0.5">

            <button
              type="submit"
              className={`px-6 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer shrink-0 ml-auto ${
                isDark
                  ? 'bg-[#2E7D4F] hover:bg-[#23653F] text-white'
                  : 'bg-[#2E7D4F] hover:bg-[#23653F] text-white'
              }`}
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
