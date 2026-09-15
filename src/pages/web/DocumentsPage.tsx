import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
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
  const file = item.file ?? null;
  const href = file ? documentFileUrl(item.id) : (item.source_url ?? '');
  const external = !file;

  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation: max 8 degrees
    // If mouse is on right (x > centerX), rotateY is positive (right side comes closer)
    // If mouse is on bottom (y > centerY), rotateX is negative (bottom side comes closer)
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.5s ease-out';
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    // Fast transition while moving to avoid lag feeling
    cardRef.current.style.transition = 'transform 0.1s ease-out';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="group flex flex-col justify-between p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 transition-shadow duration-300 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] relative h-full"
      style={{ 
        animationDelay: `${delaySeconds}s`,
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      {/* Subtle radial glow on hover */}
      <div 
        className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.06),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
        style={{ transform: 'translateZ(-10px)' }}
      />
      
      <div className="flex flex-col gap-6 relative z-10 transition-transform duration-300 group-hover:translate-z-8" style={{ transform: 'translateZ(20px)' }}>
        {/* Top Section: Icon & Badges */}
        <div className="flex justify-between items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm">
            <FileText className="w-7 h-7" strokeWidth={1.5} />
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 uppercase tracking-widest border border-emerald-100">
              № {item.doc_number}
            </span>
            <span className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> 
              {formatAdoptedOn(item.adopted_on)}
            </span>
          </div>
        </div>

        {/* Title & Summary */}
        <div className="pt-2" style={{ transform: 'translateZ(30px)' }}>
          <h3 className="text-[17px] sm:text-lg font-bold text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors duration-300">
            {pickLocalized(item.title, language)}
          </h3>
          {item.summary && (
            <p className="mt-2.5 text-[13px] text-slate-500 line-clamp-3 leading-relaxed">
              {pickLocalized(item.summary, language)}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Link Area */}
      <div 
        className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between relative z-10 group-hover:border-emerald-100 transition-colors duration-300"
        style={{ transform: 'translateZ(20px)' }}
      >
        <span className="text-[14px] font-bold text-slate-500 group-hover:text-emerald-600 transition-colors duration-300">
          {external ? sourceLabel : downloadLabel}
        </span>
        <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors duration-300">
          {external ? (
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
          ) : (
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-y-0.5 transition-all duration-300" />
          )}
        </div>
      </div>
      
      {/* Make entire card clickable */}
      <a 
        href={href} 
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} 
        className="absolute inset-0 z-20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset rounded-3xl" 
        aria-label="Open document" 
        data-testid={`document-open-${item.id}`}
        style={{ transform: 'translateZ(40px)' }}
      />
    </div>
  );
}
