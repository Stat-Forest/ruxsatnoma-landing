/**
 * `GET /api/v1/public/site-settings` — the footer's contacts and the
 * announcement strip's phone — and `GET /api/v1/public/activity-seasons`,
 * the home page's season strip. Both hand-written against the merged
 * backend (core#88) rather than `schema.d.ts`; `yarn api:types` will let
 * them go through `api.GET` like the rest of this directory.
 *
 * The seasons used to ride inside `site-settings` as `season_windows`, a
 * settings key of six invented month lists. Ruling #180 deleted that key
 * the day it was written: the real windows live per leshoz in the norms
 * module, and the public read resolves through the same function the
 * submit check uses. This file lost the field in the same move — and the
 * home page went down for the hours it kept reading it (`undefined` walked
 * into `windows[code]`). `SiteSettings` therefore carries contacts ONLY.
 */
import { BASE_URL } from './client';
import type { ActivitySeason } from '../lib/seasons';

export interface SiteSettings {
  contacts: {
    phone: string;
    email: string;
    /** Only `uz_latn` and `ru` are seeded server-side — not the full 5-language set. */
    address: { uz_latn: string; ru: string };
    hours: { uz_latn: string; ru: string };
    social: { telegram: string | null; youtube: string | null };
  };
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

/**
 * The real season windows, one entry per catalogue activity, resolved by
 * the backend through `norms.checks.resolve_effective_windows` — the same
 * function that refuses an applicant's dates, so the strip and the refusal
 * cannot disagree (#180). `null` on ANY failure: the strip then renders
 * nothing, never a fallback set of months.
 */
export async function fetchActivitySeasons(): Promise<ActivitySeason[] | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/public/activity-seasons`);
    if (!response.ok) return null;
    const body: unknown = await response.json();
    return Array.isArray(body) ? (body as ActivitySeason[]) : null;
  } catch {
    return null;
  }
}
