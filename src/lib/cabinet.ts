/**
 * The only place on this site that knows where the cabinet lives.
 *
 * The landing carries no session at all (decision #60.4) and deliberately
 * does not ask whether the visitor is signed in: the adminka's `RequireAuth`
 * already answers that on arrival — straight to the page if a session cookie
 * exists, to `/login` and back again if it does not. So every entry point
 * here is a plain link, and `/` is the honest target: linking to `/login`
 * would show a signed-in citizen a form they do not need.
 */
export const CABINET_PATHS = {
  /** The cabinet's front door. Signed in → dashboard; not → login. */
  login: '/',
  /** Submitting an application (decision #60.4: the wizard lives in the adminka). */
  wizard: '/my/applications/new',
} as const;

export function cabinetUrl(path: string): string {
  const origin = import.meta.env.VITE_ADMIN_BASE_URL;
  if (!origin) {
    throw new Error(
      'VITE_ADMIN_BASE_URL is not set — every sign-in link on this site would go nowhere.',
    );
  }
  return `${origin.replace(/\/+$/, '')}${path}`;
}

/**
 * The one call that leaves this origin, behind a seam a test can replace.
 * `window.location` is a non-configurable own property in jsdom, so spying on
 * it either throws or really navigates the test environment.
 */
export const navigation = {
  assign: (url: string) => window.location.assign(url),
};

/**
 * Navigates the CURRENT tab. Not `window.open`: a second tab leaves a dead
 * copy of the landing behind, breaks the back button, and is what the
 * previous implementation did on its way to `https://id.egov.uz` — a page
 * that could not sign anyone into this system.
 */
export function goToCabinet(path: string): void {
  navigation.assign(cabinetUrl(path));
}
