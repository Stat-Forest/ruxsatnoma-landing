import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import {
  documentFileUrl,
  fetchDocuments,
  formatAdoptedOn,
  type LegalDocument,
} from '../../api/documents';
import { pickLocalized } from '../../lib/localized';
import { useLanguage, useT } from '../../i18n/useT';

type PageState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: LegalDocument[] };

export interface DocumentsPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

/**
 * The legal-documents register. Until `core` `0043` this page was four titles
 * hard-coded in this file under a "Download PDF" button with no href — it
 * looked like a service and was a picture of one; now every row is a published
 * document an editor entered, and the button opens the PDF or the lex.uz page
 * it came from.
 *
 * No pagination: the register is a few dozen rows in total, and one request
 * asks for all of them (`DOCUMENTS_PAGE_SIZE`).
 */
export const DocumentsPage: React.FC<DocumentsPageProps> = () => {
  const t = useT();
  const { language } = useLanguage();
  const [state, setState] = useState<PageState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchDocuments();
        if (!cancelled) setState({ status: 'ready', items: data.items });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('documents.badge')}
        </span>
        <h1 className="text-3xl font-bold text-[#1A1F24]">{t('documents.title')}</h1>
        <p className="text-sm text-[#5A646D] max-w-xl mx-auto pt-1 leading-relaxed">
          {t('documents.subtitle')}
        </p>
      </div>

      {state.status === 'loading' && (
        <div className="space-y-4" data-testid="documents-loading">
          <Skeleton height="h-24" />
          <Skeleton height="h-24" />
          <Skeleton height="h-24" />
        </div>
      )}

      {state.status === 'error' && (
        <Alert variant="danger" title={t('documents.error.title')}>
          {t('documents.error.text')}
        </Alert>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <div
          data-testid="documents-empty"
          className="bg-white border border-[#E4E7EA] rounded-2xl p-10 text-center space-y-2"
        >
          <FileText className="w-8 h-8 mx-auto text-[#9AA3AB]" />
          <p className="text-sm text-[#5A646D]">{t('documents.empty')}</p>
        </div>
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <div className="space-y-4">
          {state.items.map((item) => (
            <DocumentRow
              key={item.id}
              item={item}
              language={language}
              downloadLabel={t('documents.download')}
              sourceLabel={t('documents.openSource')}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function DocumentRow({
  item,
  language,
  downloadLabel,
  sourceLabel,
}: {
  item: LegalDocument;
  language: string;
  downloadLabel: string;
  sourceLabel: string;
}) {
  // The backend refuses to publish a row with neither, so exactly one of these
  // two is always there; the file wins when both are.
  const file = item.file ?? null;
  const href = file ? documentFileUrl(item.id) : (item.source_url ?? '');
  const external = !file;

  return (
    <div className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs hover:border-[#7FB98A] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#F0F7F1] rounded-xl text-[#2E7D4F] shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#2E7D4F] bg-[#F0F7F1] px-2 py-0.5 rounded">
              № {item.doc_number}
            </span>
            <span className="text-xs text-[#767F87]">{formatAdoptedOn(item.adopted_on)}</span>
          </div>
          <h3 className="text-base font-bold text-[#1A1F24]">
            {pickLocalized(item.title, language)}
          </h3>
          {item.summary && (
            <p className="text-xs text-[#5A646D]">{pickLocalized(item.summary, language)}</p>
          )}
        </div>
      </div>

      <a
        data-testid={`document-open-${item.id}`}
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[#D9EBDC] px-3 py-2 text-xs font-bold text-[#2E7D4F] hover:bg-[#F0F7F1] transition-colors"
      >
        {external ? (
          <ExternalLink className="w-4 h-4 text-[#2E7D4F]" />
        ) : (
          <Download className="w-4 h-4 text-[#2E7D4F]" />
        )}
        {external ? sourceLabel : downloadLabel}
      </a>
    </div>
  );
}
