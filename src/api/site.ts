/**
 * `GET /api/v1/public/site-settings` — the header's announcement phone, and
 * the footer's contacts and season-window notes. Implemented on the backend
 * branch but NOT YET MERGED into `dev`, so `schema.d.ts` (generated from the
 * live server) does not describe it and `api.GET` cannot be typed against it.
 *
 * `SiteSettings` below is therefore HAND-WRITTEN and PROVISIONAL: once the
 * backend merges and `yarn api:types` can see the route, replace this file's
 * own type with `components['schemas']['SiteSettingsOut']` (or whatever the
 * generated name turns out to be) and call it through `api.GET` like every
 * other endpoint in this directory.
 */
import { BASE_URL } from './client';

export interface SiteSettings {
  contacts: {
    phone: string;
    email: string;
    /** Only `uz_latn` and `ru` are seeded server-side — not the full 5-language set. */
    address: { uz_latn: string; ru: string };
    hours: { uz_latn: string; ru: string };
    social: { telegram: string | null; youtube: string | null };
  };
  /** Month numbers (1-12) each activity code's season is open in. Read by Task 10. */
  season_windows: Record<string, number[]>;
}

/**
 * What a consumer sees. The endpoint is fetched EXACTLY ONCE per page view,
 * by `routes.tsx`'s `Layout`, and handed down to the header/footer as a prop
 * and to the page through the outlet context. `PublicLayout`, `HomePage` and
 * `ContactPage` each used to call `fetchSiteSettings()` on their own, so a
 * single visit to `/` or `/contact` made the same request two or three
 * times.
 *
 * `loading` is distinct from `error` on purpose: the season strip may render
 * nothing while the answer is outstanding but must also render nothing if it
 * never comes, and a page cannot tell those apart from `null` alone.
 */
export type SiteSettingsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: SiteSettings };

/**
 * `null` on ANY failure — network error, non-2xx, or a body that fails to
 * parse — so the footer renders without contacts rather than breaking the
 * page (decision: never invent a number or a contact).
 */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/public/site-settings`);
    if (!response.ok) return null;
    return (await response.json()) as SiteSettings;
  } catch {
    return null;
  }
}
