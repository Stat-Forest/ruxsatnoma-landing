import React from 'react';
import type { RouteObject } from 'react-router';
import { Navigate, Outlet, ScrollRestoration, createBrowserRouter, useLocation, useNavigate, useOutletContext } from 'react-router';
import { PublicLayout } from './components/layouts/PublicLayout';
import { CABINET_PATHS, goToCabinet } from './lib/cabinet';
import { CALCULATOR_ANCHOR } from './components/calculator/PriceCalculator';
import { fetchSiteSettings } from './api/site';
import type { SiteSettingsState } from './api/site';
import {
  HomePage,
  ServicesPage,
  NewsPage,
  NewsItemPage,
  DocumentsPage,
  AboutPage,
  ContactPage,
  MapPage,
  VerifyPage,
  AppealCheckPage,
} from './pages/web';

export type NavigateFn = (page: string, params?: Record<string, unknown>) => void;

/** What `<Outlet context={…}>` carries, and therefore what a route wrapper
 *  below can hand a page. */
export interface LandingOutletContext {
  onNavigate: NavigateFn;
  siteSettings: SiteSettingsState;
}

/** Legacy page-id -> real path. Every existing page still calls
 * `onNavigate?.('services')` the way it did under the old `useState` build
 * (decision: keep the markup exactly as it is) — this map is the only thing
 * that changed, so those calls now change the URL instead of a `useState`.
 *
 * `opendata` and `faq` stay in this table even though neither has a header
 * nav entry any more (stage 8): `opendata` is still how the home page's own
 * open-data widget names its "view more" link, and `faq` is still how the
 * footer names its FAQ link — both routes below just redirect on from there
 * (`/opendata` -> `/`, `/faq` -> `/about`), same as `/tariffs` always has.
 */
const PAGE_TO_PATH: Record<string, string> = {
  home: '/',
  services: '/services',
  news: '/news',
  documents: '/documents',
  about: '/about',
  contact: '/contact',
  map: '/map',
  opendata: '/opendata',
  faq: '/faq',
  verify: '/check',
  // `appeal_check`, like `verify`, has no header-nav entry (decision: not one
  // of the nine A1-A9 screens) — reachable only from the footer.
  appeal_check: '/appeal-check',
  // Old special-cases inlined here instead of in the handler below, so the
  // whole page-id -> path mapping lives in one table.
  activities: '/services',
  // The home page's "contact us" button (`home.contact.button`) used to land
  // on `/faq` for lack of anywhere better — `/contact` is now a real page.
  feedback: '/contact',
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

  // ONE fetch per page view. `PublicLayout`, `HomePage` and `ContactPage`
  // each called `fetchSiteSettings()` for themselves, with no shared state,
  // so a visit to `/` made the same request twice and a visit to `/contact`
  // twice again. It is fetched here, where both the chrome and the page can
  // be handed the same answer.
  const [siteSettings, setSiteSettings] = React.useState<SiteSettingsState>({ status: 'loading' });

  React.useEffect(() => {
    let cancelled = false;
    void fetchSiteSettings().then((data) => {
      if (cancelled) return;
      setSiteSettings(data ? { status: 'ready', data } : { status: 'error' });
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (!path) return; // out of `landing`'s known screens — nothing to open
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeNav = location.pathname.startsWith('/news/')
    ? 'news_item'
    : (PATH_TO_PAGE[location.pathname] ?? 'home');

  React.useEffect(() => {
    if (!location.hash && typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <PublicLayout onNavigate={onNavigate} activeNav={activeNav} siteSettings={siteSettings}>
      <ScrollRestoration />
      <Outlet context={{ onNavigate, siteSettings } satisfies LandingOutletContext} />
    </PublicLayout>
  );
}

function useLandingContext(): LandingOutletContext {
  return useOutletContext<LandingOutletContext>();
}

function useLandingNavigate(): NavigateFn {
  return useLandingContext().onNavigate;
}

/**
 * EVERY page that calls `onNavigate?.(...)` needs a wrapper here. The call is
 * optional-chained, so a page rendered as a bare `<AboutPage/>` compiles,
 * renders and silently does nothing when its primary button is pressed —
 * which is how six buttons across `/about`, `/contact` and `/map` shipped
 * dead. Their own tests now render them with the prop, so a wrapper dropped
 * from this list fails a test instead of a click.
 */
function HomeRoute() {
  const { onNavigate, siteSettings } = useLandingContext();
  return <HomePage onNavigate={onNavigate} siteSettings={siteSettings} />;
}

function ServicesRoute() {
  return <ServicesPage onNavigate={useLandingNavigate()} />;
}

function DocumentsRoute() {
  return <DocumentsPage onNavigate={useLandingNavigate()} />;
}

function AboutRoute() {
  return <AboutPage onNavigate={useLandingNavigate()} />;
}

function ContactRoute() {
  const { onNavigate, siteSettings } = useLandingContext();
  return <ContactPage onNavigate={onNavigate} siteSettings={siteSettings} />;
}

function MapRoute() {
  return <MapPage onNavigate={useLandingNavigate()} />;
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
      { path: 'documents', element: <DocumentsRoute /> },
      { path: 'about', element: <AboutRoute /> },
      { path: 'contact', element: <ContactRoute /> },
      { path: 'map', element: <MapRoute /> },
      { path: 'check', element: <VerifyPage /> },
      { path: 'appeal-check', element: <AppealCheckPage /> },
      // The standalone FAQ and open-data screens are retired (stage 8): their
      // header-nav entries are gone, and each redirects on rather than 404s
      // for anyone with the old URL bookmarked.
      { path: 'faq', element: <Navigate to="/about" replace /> },
      { path: 'opendata', element: <Navigate to="/" replace /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const router = createBrowserRouter(routeConfig);
