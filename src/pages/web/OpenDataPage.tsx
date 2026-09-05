import React from 'react';
import { Database, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useT } from '../../i18n/useT';

export interface OpenDataPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const OpenDataPage: React.FC<OpenDataPageProps> = () => {
  const t = useT();

  const datasets = [
    {
      title: t('opendata.dataset1.title'),
      format: 'JSON / CSV',
      updatedAt: '10.08.2026',
      size: '4.2 MB',
      desc: t('opendata.dataset1.desc'),
    },
    {
      title: t('opendata.dataset2.title'),
      format: 'GeoJSON / SHP',
      updatedAt: '01.08.2026',
      size: '18.5 MB',
      desc: t('opendata.dataset2.desc'),
    },
    {
      title: t('opendata.dataset3.title'),
      format: 'XLSX / CSV',
      updatedAt: '05.08.2026',
      size: '1.8 MB',
      desc: t('opendata.dataset3.desc'),
    },
  ];

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('opendata.badge')}
        </span>
        <h1 className="text-3xl font-bold text-[#1A1F24]">{t('opendata.title')}</h1>
        <p className="text-sm text-[#5A646D]">
          {t('opendata.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E4E7EA] p-5 rounded-2xl text-center space-y-1">
          <div className="text-2xl font-bold text-[#2E7D4F]">42,850+</div>
          <div className="text-xs text-[#5A646D]">{t('opendata.stats.total.label')}</div>
        </div>
        <div className="bg-white border border-[#E4E7EA] p-5 rounded-2xl text-center space-y-1">
          <div className="text-2xl font-bold text-[#2E7D4F]">{t('opendata.stats.forestries.value')}</div>
          <div className="text-xs text-[#5A646D]">{t('opendata.stats.forestries.label')}</div>
        </div>
        <div className="bg-white border border-[#E4E7EA] p-5 rounded-2xl text-center space-y-1">
          <div className="text-2xl font-bold text-[#2E7D4F]">100%</div>
          <div className="text-xs text-[#5A646D]">{t('opendata.stats.openness.label')}</div>
        </div>
      </div>

      <div className="space-y-4">
        {datasets.map((ds, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#F0F7F1] rounded-xl text-[#2E7D4F] shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E4E7EA]">
                    {ds.format}
                  </span>
                  <span className="text-xs text-[#767F87]">{ds.size} • {ds.updatedAt}</span>
                </div>
                <h3 className="text-base font-bold text-[#1A1F24]">{ds.title}</h3>
                <p className="text-xs text-[#5A646D]">{ds.desc}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4 text-[#2E7D4F]" />}
              className="shrink-0"
            >
              {t('opendata.download')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
