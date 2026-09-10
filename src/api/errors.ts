export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

/** The backend always answers a non-2xx with `{error: {code, message, details?}}`
 *  (design/03). openapi-fetch hands that body back as `error`; this turns it
 *  into one type a page can branch on and render inline — never a crash.
 *  An unparseable body still yields an ApiError, never `undefined`. */
export function apiError(body: unknown): ApiError {
  const e = (body as { error?: { code?: string; message?: string; details?: unknown } })?.error;
  return new ApiError(e?.code ?? 'ERR-SYS-000', e?.message ?? 'Kutilmagan xatolik yuz berdi', e?.details);
}

/** The rate limiter every anonymous `/public/*` route shares. */
const RATE_LIMITED = 'ERR-SYS-006';

/**
 * ONE renderer for an `ApiError`, for every page. It was written twice —
 * once in `AppealCheckPage` and once in `MapPage`, each with a comment
 * saying two lines were not worth a shared dependency — and the two had
 * already drifted: the appeal page translated its rate-limit line through
 * `t()`, the map page hard-coded Uzbek, so a Russian reader on `/map` met
 * an Uzbek sentence.
 *
 * `t` is passed in rather than hooked, so this stays a plain function that
 * `catch` blocks and non-component code can call.
 */
export function formatApiError(t: (key: string) => string, err: ApiError): string {
  if (err.code === RATE_LIMITED) {
    const details = err.details as { retry_after_seconds?: unknown } | undefined;
    const seconds = typeof details?.retry_after_seconds === 'number' ? details.retry_after_seconds : null;
    if (seconds !== null) {
      return `${t('ui.error.rateLimited.before')} ${seconds} ${t('ui.error.rateLimited.after')}`;
    }
  }
  return `${err.message} (${err.code})`;
}
