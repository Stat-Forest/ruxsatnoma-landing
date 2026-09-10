/**
 * `GET /api/v1/public/applications/check` — the "Ariza holati" arm of the
 * public verify page (`VerifyPage`), added alongside the existing permit
 * check. NOT YET MERGED into the backend, so `schema.d.ts` (generated from
 * the live server) does not describe this route and `api.GET` cannot be
 * typed against it.
 *
 * `ApplicationCheckResult` below is therefore HAND-WRITTEN and PROVISIONAL,
 * same convention as `./site.ts`'s `SiteSettings`: once the backend merges
 * and `yarn api:types` can see the route, replace this file's own type with
 * the generated `components['schemas'][...]` and call it through `api.GET`
 * like every other endpoint in this directory.
 *
 * The endpoint is anonymous and matched on a shared secret (`number` +
 * `phone`, the pair only the filer knows) rather than a session — a wrong
 * pair answers exactly like an unknown number (`{found: false}`), and this
 * module must not give the caller any way to tell the two apart, or the
 * check becomes an oracle for guessing which application numbers exist.
 */
import { BASE_URL } from './client';
import { ApiError, apiError } from './errors';

export interface ApplicationCheckResult {
  found: boolean;
  number: string | null;
  status: string | null;
  /** Only `uz_latn` and `ru` are seeded server-side, same as `SiteSettings`
   *  contacts — not the full 5-language set. */
  status_label: { uz_latn?: string; ru?: string } | null;
  activity_type: string | null;
  organization: string | null;
  next_step: string | null;
  submitted_at: string | null;
}

export type ApplicationCheckOutcome =
  | { kind: 'success'; data: ApplicationCheckResult }
  | { kind: 'http-error'; error: ApiError }
  | { kind: 'network-error' };

/**
 * Always resolves — never throws — so the caller can render every outcome
 * (hit, miss, validation/rate-limit error, network failure) without a
 * try/catch of its own. A malformed or non-JSON error body still yields an
 * `http-error` outcome with `apiError`'s own fallback code, never a crash.
 */
export async function checkApplication(
  number: string,
  phone: string,
): Promise<ApplicationCheckOutcome> {
  const query = new URLSearchParams({ number, phone });
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/v1/public/applications/check?${query.toString()}`);
  } catch {
    return { kind: 'network-error' };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }

  if (!response.ok) {
    return { kind: 'http-error', error: apiError(body) };
  }
  return { kind: 'success', data: body as ApplicationCheckResult };
}
