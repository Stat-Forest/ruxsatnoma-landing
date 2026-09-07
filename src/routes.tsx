import type { RouteObject } from 'react-router';
import { Navigate, Outlet, createBrowserRouter, useLocation, useNavigate, useOutletContext } from 'react-router';
import { PublicLayout } from './components/layouts/PublicLayout';
import { CABINET_PATHS, goToCabinet } from './lib/cabinet';
import { CALCULATOR_ANCHOR } from './components/calculator/PriceCalculator';
import {
  HomePage,
  ServicesPage,
  NewsPage,
  NewsItemPage,
  DocumentsPage,
  OpenDataPage,
  FaqPage,
  VerifyPage,
  AppealCheckPage,
} from './pages/web';

export type NavigateFn = (page: string, params?: Record<string, unknown>) => void;

/** Legacy page-id -> real path. Every existing page still calls
 * `onNavigate?.('services')` the way it did under the old `useState` build
 * (decision: keep the markup exactly as it is) — this map is the only thing
 * that changed, so those calls now change the URL instead of a `useState`. */
const PAGE_TO_PATH: Record<string, string> = {
  home: '/',
  services: '/services',
  news: '/news',
  documents: '/documents',
  opendata: '/opendata',
  faq: '/faq',
  verify: '/check',
  // `appeal_check`, like `verify`, has no header-nav entry (decision: not one
  // of the nine A1-A9 screens) — reachable only from the footer.
  appeal_check: '/appeal-check',
  // Old special-cases inlined here instead of in the handler below, so the
  // whole page-id -> path mapping lives in one table.
  activities: '/services',
  feedback: '/faq',
};

/** The price calculator is a SECTION of the home page, not a page: it lost its
 *  own `/tariffs` screen when the news register took that slot. Header CTA,
 *  footer link and the old bookmarked URL all land on the same anchor. */
const CALCULATOR_PATH = `/#${CALCULATOR_ANCHOR}`;

const PATH_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH)
    .filter(([page]) => page !== 'activities' && page !== 'feedback')
    .map(([page, path]) => [path, page]),
);

/**
 * The three page ids that mean "leave the public site". `auth_login` and
 * `auth_register` open the cabinet's front door; `applicant_wizard` goes
 * straight to the application form, which since decision #60.4 lives in the
 * adminka behind the same login — `landing` never renders it.
 *
 * The activity type a visitor picked on the services page is NOT carried
 * over: the wizard reads only `?draft=`, and its first step is choosing the
 * activity from the classifier. Passing one in would mean this site knowing
 * real `activity_type_id` values.
 */
const CABINET_ENTRIES: Record<string, string> = {
  auth_login: CABINET_PATHS.login,
  auth_register: CABINET_PATHS.login,
  applicant_wizard: CABINET_PATHS.wizard,
};

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const onNavigate: NavigateFn = (page, params) => {
    const cabinetPath = CABINET_ENTRIES[page];
    if (cabinetPath) {
      goToCabinet(cabinetPath);
      return;
    }
    if (page === 'calculator') {
      // Already home: scroll, because navigating to the same path would not.
      if (location.pathname === '/') {
        document.getElementById(CALCULATOR_ANCHOR)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(CALCULATOR_PATH);
      }
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

  const activeNav = location.pathname.startsWith('/news/')
    ? 'news_item'
    : (PATH_TO_PAGE[location.pathname] ?? 'home');

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
      { path: 'news', element: <NewsPage /> },
      { path: 'news/:newsId', element: <NewsItemPage /> },
      // `/tariffs` was the calculator's own screen until the news register took
      // its place in the header; the bookmarks that already exist keep working.
      { path: 'tariffs', element: <Navigate to={CALCULATOR_PATH} replace /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'opendata', element: <OpenDataPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'check', element: <VerifyPage /> },
      { path: 'appeal-check', element: <AppealCheckPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const router = createBrowserRouter(routeConfig);
