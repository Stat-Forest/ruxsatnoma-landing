import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkApplication } from './applications';

/**
 * `checkApplication` calls the bare `fetch` global — the endpoint isn't in
 * `schema.d.ts` yet, so it cannot go through the typed `api.GET` client the
 * rest of this project mocks by path. Stubbing `fetch` itself is this
 * file's equivalent, same idiom as `PublicLayout.test.tsx` uses for
 * `fetchSiteSettings` (`./site.ts`).
 */
function mockFetch(
  outcome:
    | { kind: 'network-error' }
    | { kind: 'response'; status: number; body?: unknown; invalidJson?: boolean },
) {
  const fetchMock = vi.fn();
  if (outcome.kind === 'network-error') {
    fetchMock.mockRejectedValue(new Error('network error'));
  } else {
    fetchMock.mockResolvedValue({
      ok: outcome.status >= 200 && outcome.status < 300,
      status: outcome.status,
      json: outcome.invalidJson
        ? () => Promise.reject(new Error('invalid json'))
        : () => Promise.resolve(outcome.body ?? {}),
    });
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('checkApplication', () => {
  it('sends number and phone as query params to the provisional endpoint', async () => {
    const fetchMock = mockFetch({
      kind: 'response',
      status: 200,
      body: {
        found: true,
        number: 'AR-2026-004518',
        status: 'awaiting_payment',
        status_label: { uz_latn: 'Toʻlov kutilmoqda' },
        activity_type: 'Chorva',
        organization: 'Burchmulla',
        next_step: 'Toʻlovni amalga oshiring',
        submitted_at: '2026-08-28',
      },
    });

    const outcome = await checkApplication('AR-2026-004518', '+998901234567');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/v1/public/applications/check?');
    expect(calledUrl).toContain('number=AR-2026-004518');
    expect(calledUrl).toContain('phone=%2B998901234567');

    expect(outcome).toEqual({
      kind: 'success',
      data: {
        found: true,
        number: 'AR-2026-004518',
        status: 'awaiting_payment',
        status_label: { uz_latn: 'Toʻlov kutilmoqda' },
        activity_type: 'Chorva',
        organization: 'Burchmulla',
        next_step: 'Toʻlovni amalga oshiring',
        submitted_at: '2026-08-28',
      },
    });
  });

  /**
   * A wrong number+phone pair must answer exactly like an unknown number —
   * this module's job is only to relay `{found: false}` unchanged, never to
   * add a hint that would make the check an oracle for guessing which
   * application numbers exist.
   */
  it('relays {found: false} unchanged for an unknown or mismatched pair', async () => {
    mockFetch({ kind: 'response', status: 200, body: { found: false } });

    const outcome = await checkApplication('AR-2026-000000', '+998900000000');

    expect(outcome).toEqual({ kind: 'success', data: { found: false } });
  });

  it('returns a network-error outcome on a fetch rejection, never a throw', async () => {
    mockFetch({ kind: 'network-error' });

    const outcome = await checkApplication('AR-2026-004518', '+998901234567');

    expect(outcome).toEqual({ kind: 'network-error' });
  });

  it('returns an http-error outcome built from the error envelope on a non-2xx response', async () => {
    mockFetch({
      kind: 'response',
      status: 429,
      body: { error: { code: 'ERR-SYS-006', message: 'Too many requests', details: { retry_after_seconds: 30 } } },
    });

    const outcome = await checkApplication('AR-2026-004518', '+998901234567');

    expect(outcome.kind).toBe('http-error');
    if (outcome.kind === 'http-error') {
      expect(outcome.error.code).toBe('ERR-SYS-006');
      expect(outcome.error.message).toBe('Too many requests');
    }
  });

  it('still returns an http-error outcome, never a throw, when the error body is not valid JSON', async () => {
    mockFetch({ kind: 'response', status: 500, invalidJson: true });

    const outcome = await checkApplication('AR-2026-004518', '+998901234567');

    expect(outcome.kind).toBe('http-error');
    if (outcome.kind === 'http-error') {
      expect(outcome.error.code).toBe('ERR-SYS-000');
    }
  });
});
