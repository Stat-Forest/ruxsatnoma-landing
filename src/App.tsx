import { useState } from 'react';
import { PublicLayout } from './components/layouts/PublicLayout';
import {
  HomePage,
  VerifyPage,
  TariffsPage,
  ServicesPage,
  DocumentsPage,
  OpenDataPage,
  FaqPage,
} from './pages/web';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const savedPage = localStorage.getItem('landing_active_page');
    if (
      savedPage &&
      ['home', 'services', 'tariffs', 'documents', 'opendata', 'faq', 'verify'].includes(savedPage)
    ) {
      return savedPage;
    }
    return 'home';
  });

  const [pageParams, setPageParams] = useState<any>({});

  const handleNavigate = (page: string, params?: any) => {
    if (page === 'auth_login' || page === 'auth_register') {
      window.open('https://id.egov.uz', '_blank');
      return;
    }
    if (page === 'activities') {
      setCurrentPage('services');
      localStorage.setItem('landing_active_page', 'services');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page === 'feedback') {
      setCurrentPage('faq');
      localStorage.setItem('landing_active_page', 'faq');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentPage(page);
    localStorage.setItem('landing_active_page', page);
    if (params) setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] text-[#1A1F24]">
      <PublicLayout
        onNavigate={handleNavigate}
        activeNav={currentPage}
        onCheckPermit={(no) => handleNavigate('verify', { query: no })}
      >
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'services' && <ServicesPage onNavigate={handleNavigate} />}
        {currentPage === 'tariffs' && <TariffsPage />}
        {currentPage === 'documents' && <DocumentsPage onNavigate={handleNavigate} />}
        {currentPage === 'opendata' && <OpenDataPage onNavigate={handleNavigate} />}
        {currentPage === 'faq' && <FaqPage onNavigate={handleNavigate} />}
        {currentPage === 'verify' && (
          <VerifyPage initialQuery={pageParams?.query || 'RX-2026-0089'} />
        )}
      </PublicLayout>
    </div>
  );
}

export default App;
