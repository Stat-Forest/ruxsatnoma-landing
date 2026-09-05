import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useT } from '../../i18n/useT';

export interface DocumentsPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = () => {
  const t = useT();

  const docs = [
    {
      title: t('documents.doc1.title'),
      number: 'ZRU-475',
      date: '16.04.2018',
      desc: t('documents.doc1.desc'),
    },
    {
      title: t('documents.doc2.title'),
      number: 'VMQ-342',
      date: '12.05.2021',
      desc: t('documents.doc2.desc'),
    },
    {
      title: t('documents.doc3.title'),
      number: 'PF-108',
      date: '01.01.2026',
      desc: t('documents.doc3.desc'),
    },
    {
      title: t('documents.doc4.title'),
      number: 'ST-04',
      date: '10.02.2025',
      desc: t('documents.doc4.desc'),
    },
  ];

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('documents.badge')}
        </span>
        <h1 className="text-3xl font-bold text-[#1A1F24]">{t('documents.title')}</h1>
        <p className="text-sm text-[#5A646D]">
          {t('documents.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {docs.map((doc, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs hover:border-[#7FB98A] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#F0F7F1] rounded-xl text-[#2E7D4F] shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#2E7D4F] bg-[#F0F7F1] px-2 py-0.5 rounded">
                    № {doc.number}
                  </span>
                  <span className="text-xs text-[#767F87]">{doc.date}</span>
                </div>
                <h3 className="text-base font-bold text-[#1A1F24]">{doc.title}</h3>
                <p className="text-xs text-[#5A646D]">{doc.desc}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4 text-[#2E7D4F]" />}
              className="shrink-0"
            >
              {t('documents.download')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
