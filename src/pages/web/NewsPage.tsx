import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Newspaper, Paperclip } from 'lucide-react';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/button';
import { fetchNews, formatNewsDate, NEWS_PAGE_SIZE, type NewsItem } from '../../api/news';
import { pickLocalized } from '../../lib/localized';
import { useLanguage, useT } from '../../i18n/useT';

type PageState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: NewsItem[]; total: number };

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
  const { language } = useLanguage();
  const [page, setPage] = useState(1);
  const [state, setState] = useState<PageState>({ status: 'loading' });

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
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('news.badge')}
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#1A1F24]">{t('news.title')}</h1>
        <p className="text-sm text-[#5A646D] max-w-xl mx-auto">{t('news.subtitle')}</p>
      </div>

      {state.status === 'loading' && (
        <div className="space-y-4" data-testid="news-loading">
          <Skeleton height="h-24" />
          <Skeleton height="h-24" />
          <Skeleton height="h-24" />
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
          className="bg-white border border-[#E4E7EA] rounded-2xl p-10 text-center space-y-2"
        >
          <Newspaper className="w-8 h-8 mx-auto text-[#9AA3AB]" />
          <p className="text-sm text-[#5A646D]">{t('news.empty')}</p>
        </div>
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <div className="bg-white border border-[#E4E7EA] rounded-2xl divide-y divide-[#E4E7EA] shadow-xs">
          {state.items.map((item) => (
            <NewsRow key={item.id} item={item} language={language} attachmentsLabel={t('news.attachments')} />
          ))}
        </div>
      )}

      {state.status === 'ready' && lastPage > 1 && (
        <div className="flex items-center justify-center gap-3" data-testid="news-pagination">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('news.prev')}
          </Button>
          <span className="text-xs text-[#5A646D] font-mono">
            {page} / {lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= lastPage}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('news.next')}
          </Button>
        </div>
      )}
    </div>
  );
};

function NewsRow({
  item,
  language,
  attachmentsLabel,
}: {
  item: NewsItem;
  language: string;
  attachmentsLabel: string;
}) {
  const title = pickLocalized(item.title, language);
  const body = pickLocalized(item.body, language);
  return (
    <Link
      to={`/news/${item.id}`}
      data-testid={`news-item-${item.id}`}
      className="block p-5 space-y-1 hover:bg-[#F8F9FA] transition-colors"
    >
      <span className="text-[11px] font-mono text-[#767F87]">
        {formatNewsDate(item.publish_from)}
      </span>
      <h2 className="text-base font-bold text-[#1A1F24] flex items-start gap-2">
        <span className="flex-1">{title}</span>
        <ChevronRight className="w-4 h-4 mt-1 shrink-0 text-[#2E7D4F]" />
      </h2>
      {/* Two lines of the announcement itself, not a separately edited teaser:
          the backend has one text, and a summary this page invented would be a
          second one nobody wrote. */}
      <p className="text-xs text-[#5A646D] leading-relaxed line-clamp-2">{body}</p>
      {item.files.length > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] text-[#2E7D4F] font-semibold">
          <Paperclip className="w-3 h-3" /> {attachmentsLabel}: {item.files.length}
        </span>
      )}
    </Link>
  );
}
