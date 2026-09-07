import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, FileCheck2, Trees, MapPin, Flame, GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/Feedback';
import { useLanguage, useT } from '../../i18n/useT';
import { pickName } from '../../lib/localized';
import { api } from '../../api/client';
import type { components } from '../../api/schema';

type ActivityType = components['schemas']['PublicActivityTypeOut'];

type ServicesState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: ActivityType[] };

export interface ServicesPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

const SERVICE_META: Record<
  string,
  {
    icon: React.ReactNode;
    categoryKey: string;
    descKey: string;
    termKey: string;
    fallbackTitleKey: string;
  }
> = {
  grazing: {
    icon: <Trees className="w-6 h-6 text-[#2E7D4F]" />,
    categoryKey: 'services.items.grazing.category',
    descKey: 'services.items.grazing.desc',
    termKey: 'services.items.grazing.term',
    fallbackTitleKey: 'services.items.grazing.title',
  },
  haymaking: {
    icon: <FileCheck2 className="w-6 h-6 text-[#2E7D4F]" />,
    categoryKey: 'services.items.haymaking.category',
    descKey: 'services.items.haymaking.desc',
    termKey: 'services.items.haymaking.term',
    fallbackTitleKey: 'services.items.haymaking.title',
  },
  apiary: {
    icon: <ShieldCheck className="w-6 h-6 text-[#2E7D4F]" />,
    categoryKey: 'services.items.beekeeping.category',
    descKey: 'services.items.beekeeping.desc',
    termKey: 'services.items.beekeeping.term',
    fallbackTitleKey: 'services.items.beekeeping.title',
  },
  recreation: {
    icon: <MapPin className="w-6 h-6 text-[#2E7D4F]" />,
    categoryKey: 'services.items.recreation.category',
    descKey: 'services.items.recreation.desc',
    termKey: 'services.items.recreation.term',
    fallbackTitleKey: 'services.items.recreation.title',
  },
  deadwood: {
    icon: <Flame className="w-6 h-6 text-[#2E7D4F]" />,
    categoryKey: 'services.items.deadwood.category',
    descKey: 'services.items.deadwood.desc',
    termKey: 'services.items.deadwood.term',
    fallbackTitleKey: 'services.items.deadwood.title',
  },
  science: {
    icon: <GraduationCap className="w-6 h-6 text-[#2E7D4F]" />,
    categoryKey: 'services.items.science.category',
    descKey: 'services.items.science.desc',
    termKey: 'services.items.science.term',
    fallbackTitleKey: 'services.items.science.title',
  },
};

const DEFAULT_FALLBACK_SERVICES: ActivityType[] = [
  { id: 'grazing', code: 'grazing', name: { uz_latn: 'Chorva mollarini boqish', ru: 'Выпас скота', en: 'Livestock grazing' } },
  { id: 'haymaking', code: 'haymaking', name: { uz_latn: 'Pichan tayyorlash', ru: 'Сенокошение', en: 'Haymaking' } },
  { id: 'apiary', code: 'apiary', name: { uz_latn: 'Asalarichilik', ru: 'Пчеловодство', en: 'Apiary' } },
  { id: 'recreation', code: 'recreation', name: { uz_latn: 'Dam olish va turizm', ru: 'Отдых и туризм', en: 'Recreation and tourism' } },
  { id: 'deadwood', code: 'deadwood', name: { uz_latn: 'Quruq shox-shabba yigʻish', ru: 'Сбор валежника и хвороста', en: 'Deadwood collection' } },
  { id: 'science', code: 'science', name: { uz_latn: 'Ilmiy tadqiqot', ru: 'Научные исследования', en: 'Scientific research' } },
];

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const t = useT();
  const { language } = useLanguage();
  const [servicesState, setServicesState] = useState<ServicesState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function loadServices() {
      try {
        const { data, error } = await api.GET('/api/v1/public/refs/activity-types');
        if (cancelled) return;
        if (data && Array.isArray(data) && data.length > 0) {
          setServicesState({ status: 'ready', data });
        } else {
          setServicesState(error ? { status: 'error' } : { status: 'ready', data: DEFAULT_FALLBACK_SERVICES });
        }
      } catch {
        if (!cancelled) setServicesState({ status: 'error' });
      }
    }
    void loadServices();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentServices: ActivityType[] =
    servicesState.status === 'ready'
      ? servicesState.data
      : DEFAULT_FALLBACK_SERVICES;

  return (
    <div className="space-y-8 font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('services.badge')}
        </span>
        <h1 className="text-3xl font-bold text-[#1A1F24]">{t('services.title')}</h1>
        <p className="text-sm text-[#5A646D]">
          {t('services.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servicesState.status === 'loading'
          ? Array.from({ length: 6 }).map((_, idx) => (
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
            ))
          : currentServices.map((svc) => {
              const meta = SERVICE_META[svc.code] ?? {
                icon: <Trees className="w-6 h-6 text-[#2E7D4F]" />,
                categoryKey: 'services.badge',
                descKey: '',
                termKey: '',
                fallbackTitleKey: '',
              };
              const title = meta.fallbackTitleKey ? t(meta.fallbackTitleKey as any) : pickName(svc.name, language, svc.code);
              const category = meta.categoryKey ? t(meta.categoryKey as any) : t('services.badge');
              const desc = meta.descKey ? t(meta.descKey as any) : '';
              const term = meta.termKey ? t(meta.termKey as any) : '—';

              return (
                <div
                  key={svc.id}
                  className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-[#F0F7F1] rounded-xl">{meta.icon}</div>
                      <span className="text-xs font-semibold text-[#5A646D] bg-[#F8F9FA] px-2.5 py-1 rounded-lg border border-[#E4E7EA]">
                        {category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1F24]">{title}</h3>
                    <p className="text-xs text-[#5A646D] leading-relaxed">{desc}</p>
                  </div>

                  <div className="pt-4 border-t border-[#E4E7EA] flex items-center justify-between text-xs">
                    <span className="text-[#767F87]">{t('services.card.termLabel')} <b className="text-[#1A1F24]">{term}</b></span>
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => onNavigate?.('applicant_wizard', { activity: svc.id })}
                    >
                      {t('services.card.apply')}
                    </Button>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};
