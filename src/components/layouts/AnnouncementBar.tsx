import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchNews, type NewsItem } from '../../api/news';
import { useLanguage, useT } from '../../i18n/useT';
import { pickLocalized } from '../../lib/localized';

export interface AnnouncementBarProps {
  onNavigate?: (page: string, params?: any) => void;
}

export function AnnouncementBar({ onNavigate }: AnnouncementBarProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const t = useT();
  const { uiLanguage } = useLanguage();

  useEffect(() => {
    let active = true;
    fetchNews({ page: 1, pageSize: 5 }).then(
      (data) => {
        if (active) setNews(data.items || []);
      },
      () => {
        // on error, fallback to empty
      }
    );
    return () => { active = false; };
  }, []);

  return (
    <div className="h-[38px] bg-[#0E2A16] border-b border-white/10 flex items-center text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center gap-4">
        {/* News label / icon */}
        <div className="flex items-center gap-2 shrink-0 border-r border-white/20 pr-4">
          <span className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0" aria-hidden="true">
             <span className="absolute inline-flex w-full h-full rounded-full bg-[#4ADE80]/60 animate-pulse" />
             <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          </span>
          <span className="text-[12px] font-bold tracking-wider text-[#9CE3AE] uppercase">
            {t('nav.news')}
          </span>
        </div>

        {/* Ticker Animation Styles */}
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker {
            animation: ticker 35s linear infinite;
            display: flex;
            width: max-content;
          }
          .animate-ticker:hover {
            animation-play-state: paused;
          }
        `}</style>

        {/* Ticker Wrapper */}
        <div className="flex-1 min-w-0 h-full flex items-center text-[12.5px] text-[#C4D8C9] overflow-hidden">
          {news.length > 0 ? (
            <div className="animate-ticker">
              {[...news, ...news].map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center h-[38px] pr-5 mr-5 relative shrink-0">
                  <div className="flex items-center h-full">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('news_item', { id: item.id })}
                      className="flex items-center gap-2 max-w-full hover:text-white transition-colors group cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#9CE3AE] rounded-sm text-left mt-0.5"
                    >
                      <span className="leading-none">{pickLocalized(item.title, uiLanguage)}</span>
                      <span className="text-[#4ADE80] text-[12.5px] font-semibold flex items-center gap-1 shrink-0 group-hover:text-white transition-colors leading-none">
                        {t('announcement.cta')}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </button>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[14px] w-[1px] bg-white/20 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="truncate opacity-70">...</span>
          )}
        </div>
      </div>
    </div>
  );
}
