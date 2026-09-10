import React, { useEffect, useState } from 'react';
import { ArrowRight, Calculator as CalculatorIcon, Clock } from 'lucide-react';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/button';
import { Scene, SCENE_KINDS, type SceneKind } from '../../components/art/Scene';
import { SERVICE_IMAGES } from '../../assets/img/services';
import { fetchServices, type Service } from '../../api/services';
import { pickLocalized, pickName } from '../../lib/localized';
import { useLanguage, useT } from '../../i18n/useT';

export interface ServicesPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

type PageState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; services: Service[] };

/** `Scene`'s six illustrations are keyed by the same `code` the activity
 *  catalogue returns (task 11 brief) — but a code the catalogue might one
 *  day add before `Scene` grows a matching illustration must not crash the
 *  page, so this stays a guarded lookup, never a bare cast. */
function isSceneKind(code: string): code is SceneKind {
  return (SCENE_KINDS as readonly string[]).includes(code);
}

/**
 * A2 — the full service catalogue. The six cards used to be constants here,
 * each carrying an invented "term" (a duration guess, in one case an
 * "up to 3 working days" promise the system has never honoured). They now
 * come from `GET /public/refs/activity-types` (`api/services.ts`) — nothing
 * on this page may render a service the catalog did not return, or a term
 * this page made up.
 */
export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const t = useT();
  const { language } = useLanguage();
  const [state, setState] = useState<PageState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    void (async () => {
      try {
        const services = await fetchServices();
        if (!cancelled) setState({ status: 'ready', services });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10 font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="reveal inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('services.badge')}
        </span>
        <h1
          className="reveal text-3xl font-bold text-[#1A1F24]"
          style={{ animationDelay: '.06s' }}
        >
          {t('services.title')}
        </h1>
        <p
          className="reveal text-sm text-[#5A646D] max-w-xl mx-auto pt-1 leading-relaxed"
          style={{ animationDelay: '.12s' }}
        >
          {t('services.subtitle')}
        </p>
      </div>

      {state.status === 'loading' && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="services-loading"
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E4E7EA] rounded-2xl overflow-hidden flex flex-col"
            >
              <Skeleton height="h-[196px]" className="rounded-none" />
              <div className="p-6 space-y-4">
                <Skeleton height="h-6" width="w-3/4" />
                <Skeleton height="h-4" width="w-full" />
                <Skeleton height="h-4" width="w-4/5" />
                <div className="pt-4 border-t border-[#E4E7EA] flex items-center justify-between">
                  <Skeleton height="h-4" width="w-20" />
                  <Skeleton height="h-8" width="w-28" className="rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <Alert variant="danger" title={t('services.error.title')}>
          {t('services.error.text')}
        </Alert>
      )}

      {state.status === 'ready' && state.services.length === 0 && (
        <div
          data-testid="services-empty"
          className="bg-white border border-[#E4E7EA] rounded-2xl p-10 text-center space-y-2"
        >
          <p className="text-sm text-[#5A646D]">{t('services.empty')}</p>
        </div>
      )}

      {state.status === 'ready' && state.services.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.services.map((svc, idx) => (
              <ServiceCard
                key={svc.id}
                index={idx}
                service={svc}
                language={language}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {/* The calculator lives on the home page as its own section
              (`routes.tsx`'s own `CALCULATOR_PATH` docstring: "a SECTION of
              the home page, not a page") — this card links there through the
              same `onNavigate('calculator')` contract the header CTA uses,
              rather than embedding a second `PriceCalculator` instance. */}
          <div className="reveal bg-[#123522] rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="p-3 bg-white/10 rounded-xl text-[#9CE3AE] shrink-0">
                <CalculatorIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t('tariffs.calculator.heading')}</h2>
                <p className="text-sm text-[#C4D8C9] mt-1">{t('tariffs.calculator.description')}</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate?.('calculator')}
              className="shrink-0"
            >
              {t('tariffs.calculator.submitCta')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

function ServiceCard({
  service,
  language,
  onNavigate,
  index,
}: {
  service: Service;
  language: string;
  onNavigate?: (page: string, params?: any) => void;
  index: number;
}) {
  const t = useT();
  const name = pickName(service.name, language, service.code);
  const description = pickLocalized(service.description, language);

  return (
    <div
      className="reveal card-lift bg-white border border-[#E4E7EA] rounded-2xl overflow-hidden flex flex-col"
      style={{ animationDelay: `${Math.min(index, 8) * 0.08}s` }}
    >
      <div className="relative h-[196px] overflow-hidden bg-[#EAF3EC]">
        <div className="thumb-zoom absolute inset-0">
          {isSceneKind(service.code) && (
            <>
              {SERVICE_IMAGES[service.code] && (
                <img
                  src={SERVICE_IMAGES[service.code]}
                  alt={name}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              )}
              <div className={SERVICE_IMAGES[service.code] ? 'hidden' : 'w-full h-full'}>
                <Scene kind={service.code} height={196} />
              </div>
            </>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute left-4 bottom-3.5 text-xs font-extrabold tracking-[.12em] text-white/95 drop-shadow-xs">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-xs rounded-full px-3 py-1.5 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-[#2E7D4F]" />
          <span className="text-xs font-bold text-[#123522]">
            {service.processing_days} {t('services.card.daysUnit')}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow gap-3">
        <h3 className="text-lg font-bold text-[#123522] leading-snug">{name}</h3>
        {/* `description` is nullable (two of six rows have none, on purpose —
            see `api/services.ts`); no placeholder sentence stands in for it. */}
        {description && (
          <p
            data-testid={`service-desc-${service.id}`}
            className="text-sm text-[#5A646D] leading-relaxed flex-grow"
          >
            {description}
          </p>
        )}
        <div className="pt-4 mt-auto border-t border-[#E4E7EA]">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => onNavigate?.('applicant_wizard', { activity: service.id })}
          >
            {t('services.card.apply')}
          </Button>
        </div>
      </div>
    </div>
  );
}
