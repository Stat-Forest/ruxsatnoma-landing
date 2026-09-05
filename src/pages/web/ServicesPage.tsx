import React from 'react';
import { ShieldCheck, ArrowRight, FileCheck2, Trees, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useT } from '../../i18n/useT';

export interface ServicesPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const t = useT();
  const servicesList = [
    {
      id: 'grazing',
      title: t('services.items.grazing.title'),
      category: t('services.items.grazing.category'),
      desc: t('services.items.grazing.desc'),
      term: t('services.items.grazing.term'),
      icon: <Trees className="w-6 h-6 text-[#2E7D4F]" />,
    },
    {
      id: 'haymaking',
      title: t('services.items.haymaking.title'),
      category: t('services.items.haymaking.category'),
      desc: t('services.items.haymaking.desc'),
      term: t('services.items.haymaking.term'),
      icon: <FileCheck2 className="w-6 h-6 text-[#2E7D4F]" />,
    },
    {
      id: 'beekeeping',
      title: t('services.items.beekeeping.title'),
      category: t('services.items.beekeeping.category'),
      desc: t('services.items.beekeeping.desc'),
      term: t('services.items.beekeeping.term'),
      icon: <ShieldCheck className="w-6 h-6 text-[#2E7D4F]" />,
    },
    {
      id: 'wild_plants',
      title: t('services.items.wildPlants.title'),
      category: t('services.items.wildPlants.category'),
      desc: t('services.items.wildPlants.desc'),
      term: t('services.items.wildPlants.term'),
      icon: <Trees className="w-6 h-6 text-[#2E7D4F]" />,
    },
    {
      id: 'recreation',
      title: t('services.items.recreation.title'),
      category: t('services.items.recreation.category'),
      desc: t('services.items.recreation.desc'),
      term: t('services.items.recreation.term'),
      icon: <MapPin className="w-6 h-6 text-[#2E7D4F]" />,
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('services.badge')}
        </span>
        <h1 className="text-3xl font-bold text-[#1A1F24]">{t('services.title')}</h1>
        <p className="text-sm text-[#5A646D]">
          {t('services.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servicesList.map((svc) => (
          <div
            key={svc.id}
            className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-[#F0F7F1] rounded-xl">{svc.icon}</div>
                <span className="text-xs font-semibold text-[#5A646D] bg-[#F8F9FA] px-2.5 py-1 rounded-lg border border-[#E4E7EA]">
                  {svc.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1A1F24]">{svc.title}</h3>
              <p className="text-xs text-[#5A646D] leading-relaxed">{svc.desc}</p>
            </div>

            <div className="pt-4 border-t border-[#E4E7EA] flex items-center justify-between text-xs">
              <span className="text-[#767F87]">{t('services.card.termLabel')} <b className="text-[#1A1F24]">{svc.term}</b></span>
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
        ))}
      </div>
    </div>
  );
};
