import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Home,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import {
  documentFileUrl,
  fetchDocuments,
  formatAdoptedOn,
  type LegalDocument,
} from '../../api/documents';
import { pickLocalized } from '../../lib/localized';
import { useLanguage, useT } from '../../i18n/useT';
import documentsHeroBgImage from '../../assets/img/documents-hero.jpg';
import type { UiLanguage } from '../../i18n/context';

type PageState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: LegalDocument[] };

export interface DocumentsPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

interface DocumentsBannerText {
  homeBreadcrumb: string;
  documentsBreadcrumb: string;
  scrollCue: string;
}

const DOCUMENTS_BANNER_TEXT: Record<UiLanguage, DocumentsBannerText> = {
  uz_latn: {
    homeBreadcrumb: 'Bosh sahifa',
    documentsBreadcrumb: 'Hujjatlar',
    scrollCue: 'Hujjatlar bilan tanishish',
  },
  ru: {
    homeBreadcrumb: 'Главная',
    documentsBreadcrumb: 'Документы',
    scrollCue: 'Ознакомиться с документами',
  },
  uz_cyrl: {
    homeBreadcrumb: 'Бош саҳифа',
    documentsBreadcrumb: 'Ҳужжатлар',
    scrollCue: 'Ҳужжатлар билан танишиш',
  },
  en: {
    homeBreadcrumb: 'Home',
    documentsBreadcrumb: 'Documents',
    scrollCue: 'Explore documents',
  },
  kaa: {
    homeBreadcrumb: 'Bas bet',
    documentsBreadcrumb: 'Hújjetler',
    scrollCue: 'Hújjetler menen tanıısıw',
  },
};

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
export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onNavigate }) => {
  const t = useT();
  const { language, uiLanguage } = useLanguage();
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [headerHeight, setHeaderHeight] = useState(132);
  const catalogRef = useRef<HTMLDivElement>(null);
  const bannerText = DOCUMENTS_BANNER_TEXT[uiLanguage] ?? DOCUMENTS_BANNER_TEXT.uz_latn;

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
    void (async () => {
      try {
        const data = await fetchDocuments();
        const items = Array.isArray(data) ? (data as unknown as LegalDocument[]) : (data?.items ?? []);
        if (!cancelled) setState({ status: 'ready', items });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="font-sans bg-[#EFF7F2]">
      {/* ── HERO BANNER ──────────────────────────────────────────────
          Full-bleed edge-to-edge flush with the dark green header (-mt-10).
          Calculated exactly so header + hero = 100vh of the visible screen. */}
      <section
        id="documents-hero"
        style={{
          height: `calc(100vh - ${headerHeight}px)`,
          minHeight: '480px',
        }}
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-10 overflow-hidden bg-[#0C2414] text-white flex flex-col justify-between"
      >
        {/* Background Image & Atmospheric Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={documentsHeroBgImage}
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
            <span className="font-semibold text-white">{bannerText.documentsBreadcrumb}</span>
          </nav>

          {/* Center: Badge, Headings, Subtitle */}
          <div className="my-auto py-1 sm:py-2 space-y-4 max-w-3xl">
            <div className="space-y-2.5 sm:space-y-3">
              {/* Badge */}
              <div className="reveal inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A7F3D0] bg-black/40 border border-white/25 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span>{t('documents.badge')}</span>
              </div>

              <h1
                className="reveal text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.14] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: '.06s' }}
              >
                {t('documents.title')}
              </h1>

              <p
                className="reveal text-sm sm:text-base text-[#E2F0E5] leading-relaxed max-w-2xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: '.12s' }}
              >
                {t('documents.subtitle')}
              </p>
            </div>

            {/* Decorative count pill if ready */}
            {state.status === 'ready' && state.items.length > 0 && (
              <div
                className="reveal inline-flex items-center gap-2 text-xs font-semibold text-[#D5EADB] bg-black/40 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-sm"
                style={{ animationDelay: '.18s' }}
              >
                <Scale className="w-3.5 h-3.5 text-[#7FE0A0]" />
                <span>{state.items.length} ta normativ-huquqiy hujjat mavjud</span>
              </div>
            )}
          </div>

          {/* Bottom: Scroll cue */}
          <div className="reveal pt-1 pb-1 flex items-center shrink-0" style={{ animationDelay: '.22s' }}>
            <button
              type="button"
              onClick={() => {
                catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#BCE0C2] hover:text-white transition-colors cursor-pointer group"
            >
              <span>{bannerText.scrollCue}</span>
              <ChevronDown className="w-4 h-4 text-[#7FE0A0] group-hover:translate-y-0.5 transition-transform animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ── DOCUMENTS CATALOG ───────────────────────────────────── */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#EFF7F2] py-12 pb-20 -mb-10">
        <div ref={catalogRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {state.status === 'loading' && (
            <div className="space-y-4" data-testid="documents-loading">
              <Skeleton height="h-28" className="rounded-2xl" />
              <Skeleton height="h-28" className="rounded-2xl" />
              <Skeleton height="h-28" className="rounded-2xl" />
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
              className="reveal bg-white border border-[#E4E7EA] rounded-3xl p-12 text-center space-y-3 shadow-xs"
            >
              <FileText className="w-10 h-10 mx-auto text-[#9AA3AB]" />
              <p className="text-base text-[#5A646D]">{t('documents.empty')}</p>
            </div>
          )}

          {state.status === 'ready' && state.items.length > 0 && (
            <div className="space-y-4">
              {state.items.map((item, idx) => (
                <DocumentRow
                  key={item.id}
                  item={item}
                  language={language}
                  downloadLabel={t('documents.download')}
                  sourceLabel={t('documents.openSource')}
                  delaySeconds={idx * 0.06}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

function DocumentRow({
  item,
  language,
  downloadLabel,
  sourceLabel,
  delaySeconds,
}: {
  item: LegalDocument;
  language: string;
  downloadLabel: string;
  sourceLabel: string;
  delaySeconds: number;
}) {
  // The backend refuses to publish a row with neither, so exactly one of these
  // two is always there; the file wins when both are.
  const file = item.file ?? null;
  const href = file ? documentFileUrl(item.id) : (item.source_url ?? '');
  const external = !file;

  return (
    <div
      className="reveal card-lift group relative bg-white border border-[#D5E6DA] hover:border-[#2E7D4F]/50 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(18,53,34,0.04)] hover:shadow-[0_16px_36px_rgba(18,53,34,0.1)] transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 overflow-hidden"
      style={{ animationDelay: `${delaySeconds}s` }}
    >
      {/* Left indicator accent line on hover */}
      <div className="absolute left-0 top-5 bottom-5 w-1 rounded-r-full bg-[#2E7D4F] opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-1 group-hover:translate-x-0" />

      {/* Top shimmer on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2E7D4F] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
        <div className="thumb-zoom p-3.5 bg-[#F0F7F1] text-[#2E7D4F] rounded-2xl shrink-0 group-hover:bg-[#E3F4E8] transition-colors border border-[#CCE4D3] shadow-2xs">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#1E5C38] bg-[#EAF5ED] border border-[#CCE4D3] px-2.5 py-0.5 rounded-lg shadow-2xs">
              № {item.doc_number}
            </span>
            <span className="text-xs font-mono text-[#6A7B70]">{formatAdoptedOn(item.adopted_on)}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#142A1D] group-hover:text-[#23653F] transition-colors leading-snug">
            {pickLocalized(item.title, language)}
          </h3>
          {item.summary && (
            <p className="text-xs sm:text-sm text-[#4E6153] leading-relaxed line-clamp-2">
              {pickLocalized(item.summary, language)}
            </p>
          )}
        </div>
      </div>

      <a
        data-testid={`document-open-${item.id}`}
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[#CCE4D3] bg-[#F0F7F1] hover:bg-[#2E7D4F] hover:text-white px-4 py-2.5 text-xs font-bold text-[#2E7D4F] transition-all duration-200 shadow-2xs group/btn cursor-pointer"
      >
        {external ? (
          <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
        ) : (
          <Download className="w-4 h-4 transition-transform group-hover/btn:translate-y-0.5" />
        )}
        <span>{external ? sourceLabel : downloadLabel}</span>
      </a>
    </div>
  );
}
