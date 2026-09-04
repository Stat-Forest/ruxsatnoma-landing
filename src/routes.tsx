import type { RouteObject } from 'react-router';
import { Navigate, Outlet, createBrowserRouter, useLocation, useNavigate, useOutletContext } from 'react-router';
import { PublicLayout } from './components/layouts/PublicLayout';
import {
  HomePage,
  ServicesPage,
  TariffsPage,
  DocumentsPage,
  OpenDataPage,
  FaqPage,
  VerifyPage,
} from './pages/web';

export type NavigateFn = (page: string, params?: Record<string, unknown>) => void;

/** Legacy page-id -> real path. Every existing page still calls
 * `onNavigate?.('tariffs')` the way it did under the old `useState` build
 * (decision: keep the markup exactly as it is) — this map is the only thing
 * that changed, so those calls now change the URL instead of a `useState`. */
const PAGE_TO_PATH: Record<string, string> = {
  home: '/',
  services: '/services',
  tariffs: '/tariffs',
  documents: '/documents',
  opendata: '/opendata',
  faq: '/faq',
  verify: '/check',
  // Old special-cases inlined here instead of in the handler below, so the
  // whole page-id -> path mapping lives in one table.
  activities: '/services',
  feedback: '/faq',
};

const PATH_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH)
    .filter(([page]) => page !== 'activities' && page !== 'feedback')
    .map(([page, path]) => [path, page]),
);

/** Opens the OneID / E-IMZO login, exactly like the old build did for
 * `auth_login`/`auth_register`. `applicant_wizard` (submit an application)
 * joins it here too: since decision #60.4 the wizard lives in the adminka
 * cabinet, behind the same login — `landing` never renders it. */
function openLogin() {
  window.open('https://id.egov.uz', '_blank');
}

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const onNavigate: NavigateFn = (page, params) => {
    if (page === 'auth_login' || page === 'auth_register' || page === 'applicant_wizard') {
      openLogin();
      return;
    }
    if (page === 'verify') {
      const query = params?.query;
      navigate(typeof query === 'string' && query ? `/check?q=${encodeURIComponent(query)}` : '/check');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const path = PAGE_TO_PATH[page];
    if (!path) return; // out of `landing`'s nine screens (decision #60.4) — nothing to open
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeNav = PATH_TO_PAGE[location.pathname] ?? 'home';

  return (
    <PublicLayout onNavigate={onNavigate} activeNav={activeNav}>
      <Outlet context={{ onNavigate } satisfies { onNavigate: NavigateFn }} />
    </PublicLayout>
  );
}

function useLandingNavigate(): NavigateFn {
  return useOutletContext<{ onNavigate: NavigateFn }>().onNavigate;
}

function HomeRoute() {
  return <HomePage onNavigate={useLandingNavigate()} />;
}

function ServicesRoute() {
  return <ServicesPage onNavigate={useLandingNavigate()} />;
}

export const routeConfig: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'services', element: <ServicesRoute /> },
      { path: 'tariffs', element: <TariffsPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'opendata', element: <OpenDataPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'check', element: <VerifyPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const router = createBrowserRouter(routeConfig);
