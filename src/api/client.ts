import createClient from 'openapi-fetch';
import type { paths } from './schema';

/**
 * `landing` is the nine public pages (decision #60.4) — no login, no
 * session, no CSRF. This client is therefore deliberately bare: no cookie
 * (`credentials` stays the fetch default, `same-origin`, and nothing sets an
 * `X-CSRF-Token`), unlike `adminka/src/api/client.ts`'s session-aware client.
 * Every route this app calls must stay reachable by a citizen who has never
 * logged in — see `/api/v1/public/permits/check` and the module docstring on
 * `backend/app/modules/permits/public_router.py`.
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const api = createClient<paths>({ baseUrl: BASE_URL });
