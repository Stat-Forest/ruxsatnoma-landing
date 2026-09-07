import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/button';
import { fetchServices, type Service } from '../../api/services';
import { serviceIcon } from '../../lib/serviceIcons';
import { pickLocalized } from '../../lib/localized';
import { useLanguage, useT } from '../../i18n/useT';

export interface ServicesPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

type PageState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; services: Service[] };

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
    <div className="space-y-8 font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('services.badge')}
        </span>
        <h1 className="text-3xl font-bold text-[#1A1F24]">{t('services.title')}</h1>
        <p className="text-sm text-[#5A646D] max-w-xl mx-auto pt-1 leading-relaxed">
          {t('services.subtitle')}
        </p>
      </div>

      {state.status === 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="services-loading">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton height="h-12" width="w-12" className="rounded-xl" />
                <Skeleton height="h-6" width="w-32" className="rounded-lg" />
              </div>
              <Skeleton height="h-6" width="w-3/4" />
              <Skeleton height="h-4" width="w-full" />
              <Skeleton height="h-4" width="w-4/5" />
              <div className="pt-4 border-t border-[#E4E7EA] flex items-center justify-between">
                <Skeleton height="h-4" width="w-24" />
                <Skeleton height="h-8" width="w-28" className="rounded-md" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.services.map((svc) => (
            <ServiceCard key={svc.id} service={svc} language={language} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};

function ServiceCard({
  service,
  language,
  onNavigate,
}: {
  service: Service;
  language: string;
  onNavigate?: (page: string, params?: any) => void;
}) {
  const t = useT();
  const Icon = serviceIcon(service.code);
  const description = pickLocalized(service.description, language);

  return (
    <div className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="p-3 bg-[#F0F7F1] rounded-xl w-fit">
          <Icon className="w-6 h-6 text-[#2E7D4F]" />
        </div>
        <h3 className="text-lg font-bold text-[#1A1F24]">{pickLocalized(service.name, language)}</h3>
        {/* `description` is nullable (two of six rows have none, on purpose —
            see `api/services.ts`); no placeholder sentence stands in for it. */}
        {description && (
          <p data-testid={`service-desc-${service.id}`} className="text-xs text-[#5A646D] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-[#E4E7EA] flex items-center justify-between text-xs">
        <span className="text-[#767F87]">
          {t('services.card.termLabel')}{' '}
          <b className="text-[#1A1F24]">
            {service.processing_days} {t('services.card.daysUnit')}
          </b>
        </span>
        <Button
          variant="primary"
          size="sm"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => onNavigate?.('applicant_wizard', { activity: service.id })}
        >
          {t('services.card.apply')}
        </Button>
      </div>
    </div>
  );
}
