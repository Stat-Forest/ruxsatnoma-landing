import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { fetchNewsItem, formatNewsDate, newsFileUrl, type NewsItem } from '../../api/news';
import { pickLocalized } from '../../lib/localized';
import { useLanguage, useT } from '../../i18n/useT';

type ItemState =
  | { status: 'loading' }
  /** A 404 and a dead backend read differently to the visitor: the first is a
   *  notice that was archived or never public, the second is our fault. */
  | { status: 'missing' }
  | { status: 'error' }
  | { status: 'ready'; item: NewsItem };

export const NewsItemPage: React.FC = () => {
  const t = useT();
  const { language } = useLanguage();
  const { newsId } = useParams<{ newsId: string }>();
  const [state, setState] = useState<ItemState>({ status: 'loading' });

  useEffect(() => {
    if (!newsId) {
      setState({ status: 'missing' });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    void (async () => {
      try {
        const item = await fetchNewsItem(newsId);
        if (!cancelled) setState({ status: 'ready', item });
      } catch {
        // The anonymous route answers 404 for a row that is not public, so a
        // failure here is far more often "no such notice" than "we are down".
        if (!cancelled) setState({ status: 'missing' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [newsId]);

  return (
    <article className="max-w-3xl mx-auto space-y-6 font-sans">
      <Link
        to="/news"
        className="reveal inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D4F] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> {t('news.backToList')}
      </Link>

      {state.status === 'loading' && (
        <div className="space-y-4" data-testid="news-item-loading">
          <Skeleton height="h-8" width="w-2/3" />
          <Skeleton height="h-40" />
        </div>
      )}

      {state.status === 'missing' && (
        <Alert variant="warning" title={t('news.notFound.title')}>
          {t('news.notFound.text')}
        </Alert>
      )}

      {state.status === 'error' && (
        <Alert variant="danger" title={t('news.error.title')}>
          {t('news.error.text')}
        </Alert>
      )}

      {state.status === 'ready' && (
        <div
          className="reveal bg-white border border-[#E4E7EA] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs"
          style={{ animationDelay: '0.06s' }}
        >
          <div className="space-y-2 border-b border-[#E4E7EA] pb-4">
            <span className="text-[11px] font-mono text-[#767F87]">
              {formatNewsDate(state.item.publish_from)}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1F24]">
              {pickLocalized(state.item.title, language)}
            </h1>
          </div>

          {/* The announcement's own text, rendered as text. Line breaks the
              editor typed are kept; nothing here interprets HTML or Markdown,
              because an editor's paragraph must never be able to inject markup
              into a government page. */}
          <p className="text-[15px] text-[#2F3941] leading-[1.78] whitespace-pre-line">
            {pickLocalized(state.item.body, language)}
          </p>

          {state.item.files.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#E4E7EA]" data-testid="news-attachments">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A646D]">
                {t('news.attachments')}
              </h2>
              <ul className="space-y-2">
                {state.item.files.map((file) => (
                  <li key={file.id}>
                    <a
                      href={newsFileUrl(state.item.id, file.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="card-lift flex items-center gap-2 p-3 rounded-xl border border-[#E4E7EA] hover:bg-[#F0F7F1] text-sm text-[#1A1F24]"
                    >
                      <FileText className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                      <span className="flex-1 truncate">{file.filename}</span>
                      <Download className="w-4 h-4 text-[#5A646D] shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
