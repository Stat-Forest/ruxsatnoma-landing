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
