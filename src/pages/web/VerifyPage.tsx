import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Search,
  QrCode,
  CheckCircle2,
  MapPin,
  Calendar,
  Building,
  UserCheck,
  FileCheck,
  Lock,
  Loader2,
  Hash,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input, FormField } from '../../components/ui/FormControls';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { StatusType } from '../../components/ui/StatusBadge';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { api } from '../../api/client';
import { apiError } from '../../api/errors';
import { CHECK_NUMBER_MAX_LENGTH, CHECK_PHONE_MAX_LENGTH, PERMIT_NUMBER_INPUT_MAX_LENGTH } from '../../api/limits';
import type { components } from '../../api/schema';
import { useT, useLanguage } from '../../i18n/useT';
import { pickLocalized } from '../../lib/localized';
import { DASH } from '../../lib/format';
import { parsePermitNo } from '../../lib/permitNumber';
import type { MapGeometry } from '../../components/map/types';
import { checkApplication } from '../../api/applications';
import type { ApplicationCheckResult } from '../../api/applications';

/**
 * Module scope, and LAZY. A static `import PermitContourMap from …` here put
 * `maplibre-gl` and its 83 KB stylesheet into `index-*.js` — roughly 1 MB
 * raw that EVERY visitor to every page downloaded, including the ones who
 * never open `/check`. `MapPage` was already lazy-loading its own map, and
 * got nothing for it: the constructor was in the shared chunk regardless, so
 * its "split" chunk came out at 2 KB. This is a rural-mobile audience.
 */
const LazyPermitContourMap = React.lazy(() => import('../../components/map/PermitContourMap'));

type CheckCard = components['schemas']['PublicCheckCard'];
type CheckResult = CheckCard | components['schemas']['PublicCheckMiss'];

/**
 * `PublicCheckCard` may also carry `contour` — a GeoJSON geometry the
 * backend sends only once the Agency's contour-disclosure setting is on
 * (off in production today; see `PermitContourMap`'s own docstring).
 * `schema.d.ts` (generated from the live server) does not describe this
 * field yet, so it is added here as a loosely-typed extension rather than
 * hand-edited into the generated file.
 */
type CheckCardWithContour = CheckCard & { contour?: MapGeometry | null };

/** `PublicStatus` (`permits/schemas.py`) mapped to this page's existing
 * `StatusBadge` variants — the four words the backend actually returns,
 * never invented labels. */
const STATUS_BADGE: Record<CheckCard['status'], 'approved' | 'warning' | 'rejected'> = {
  амалда: 'approved',
  тўхтатилган: 'warning',
  'муддати тугаган': 'rejected',
  'бекор қилинган': 'rejected',
};

/**
 * `GET /public/applications/check`'s `status` is a free string, not the
 * closed enum `ApplicationOut.status` uses internally (its example value,
 * `awaiting_payment`, matches neither that enum's casing nor its words) —
 * this endpoint has its own, still-undocumented public vocabulary. Rather
 * than guess an exhaustive mapping this only buckets by keyword, purely for
 * `StatusBadge`'s colour: the text shown is always the API's own
 * `status_label` (or `status` as a last resort), never a label this page
 * invents.
 */
function applicationStatusVariant(status: string | null): StatusType {
  if (!status) return 'draft';
  const s = status.toLowerCase();
  if (/reject|cancel|bekor|rad|expired/.test(s)) return 'rejected';
  if (/paid|issued|ready|approved|active|tayyor|faol/.test(s)) return 'approved';
  if (/await|pending|review|kutil|jarayon/.test(s)) return 'warning';
  return 'info';
}

type Query = { qr: string } | { series: string; number: number };

/** Reads the page's own contract out of the URL, in priority order: `?qr=`
 * (a scanned QR — A7's whole reason to exist), then `?series=&number=` (a
 * bookmarkable manual lookup), then the home page's free-text `?q=`. Both of
 * the typed ones go through `parsePermitNo`, so a Latin «A» in a hand-made
 * link finds the permit its Cyrillic twin names; a string that is not a whole
 * permit number (no series, no digits) names no permit and asks nothing. */
function queryFromParams(params: URLSearchParams): Query | null {
  const qr = params.get('qr');
  if (qr) return { qr };
  const series = params.get('series');
  const number = params.get('number');
  const typed = series && number ? `${series} ${number}` : params.get('q');
  const parsed = typed ? parsePermitNo(typed) : null;
  if (parsed?.series && parsed.number) return { series: parsed.series, number: parsed.number };
  return null;
}

/** What the one box starts with: the number the URL already names, typed the
 *  way it is printed, so a bookmarked lookup shows what it looked up. */
function initialPermitNo(params: URLSearchParams): string {
  const series = params.get('series');
  const number = params.get('number');
  if (series && number) return `${series} ${number}`;
  return params.get('q') ?? '';
}

type Status = 'idle' | 'loading' | 'found' | 'miss' | 'error';

const ARMS = ['permit', 'application'] as const;
type Arm = (typeof ARMS)[number];

/** One panel, whose `aria-labelledby` follows the selected tab — the two
 *  arms share a single region of the page, so a second `tabpanel` would be
 *  a lie about the structure. */
const PANEL_ID = 'verify-panel';

function tabId(arm: Arm): string {
  return `verify-tab-${arm}`;
}

export const VerifyPage: React.FC = () => {
  const t = useT();
  const { uiLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [arm, setArm] = useState<Arm>('permit');

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = ARMS[(ARMS.indexOf(arm) + 1) % ARMS.length];
    setArm(next);
    document.getElementById(tabId(next))?.focus();
  };

  // ── Permit arm (existing) ────────────────────────────────────────────────
  const [permitNoInput, setPermitNoInput] = useState(() => initialPermitNo(searchParams));
  const [permitNoInvalid, setPermitNoInvalid] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<CheckCardWithContour | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const query = queryFromParams(searchParams);

  useEffect(() => {
    if (!query) {
      setStatus('idle');
      return;
    }
    const activeQuery = query;
    let cancelled = false;
    setStatus('loading');
    setErrorMessage(null);

    async function run(q: Query) {
      try {
        const { data, error } = await api.GET('/api/v1/public/permits/check', {
          params: { query: 'qr' in q ? { qr: q.qr } : { series: q.series, number: q.number } },
        });
        if (cancelled) return;
        if (error) {
          const e = apiError(error);
          setStatus('error');
          setErrorMessage(`${e.message} (${e.code})`);
          return;
        }
        const body = data as CheckResult;
        if (body.found) {
          setResult(body as CheckCardWithContour);
          setStatus('found');
        } else {
          setResult(null);
          setStatus('miss');
        }
      } catch {
        if (cancelled) return;
        // Network failure (backend unreachable) — never a blank crash.
        setStatus('error');
        setErrorMessage(t('verify.status.networkError'));
      }
    }

    void run(activeQuery);
    return () => {
      cancelled = true;
    };
    // `query` is derived fresh from `searchParams` every render; comparing its
    // JSON form keeps the effect from refiring on unrelated re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Both halves or nothing: the check names ONE permit, and a box that
    // cannot be read is said so here rather than answered «not found».
    const parsed = parsePermitNo(permitNoInput);
    if (!parsed?.series || !parsed.number) {
      setPermitNoInvalid(true);
      return;
    }
    setPermitNoInvalid(false);
    setSearchParams(new URLSearchParams({ series: parsed.series, number: String(parsed.number) }));
  };

  // ── Application arm (new) ────────────────────────────────────────────────
  // Deliberately local `useState`, NOT `useSearchParams` — like
  // `AppealCheckPage`'s own check form, an application's number+phone is the
  // shared secret proving the caller filed it, and mirroring it into the URL
  // would leak it into browser history/referrers for no benefit here (there
  // is no bookmarkable/QR use case for this arm the way there is for the
  // permit one).
  const [appNumberInput, setAppNumberInput] = useState('');
  const [appPhoneInput, setAppPhoneInput] = useState('');
  const [appValidationError, setAppValidationError] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<Status>('idle');
  const [appResult, setAppResult] = useState<ApplicationCheckResult | null>(null);
  const [appErrorMessage, setAppErrorMessage] = useState<string | null>(null);

  const handleApplicationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNumber = appNumberInput.trim();
    const trimmedPhone = appPhoneInput.trim();
    if (!trimmedNumber || !trimmedPhone) {
      setAppValidationError(t('verify.application.validation'));
      return;
    }
    setAppValidationError(null);
    setAppStatus('loading');
    setAppErrorMessage(null);

    void (async () => {
      const outcome = await checkApplication(trimmedNumber, trimmedPhone);
      switch (outcome.kind) {
        case 'network-error':
          setAppStatus('error');
          setAppErrorMessage(t('verify.status.networkError'));
          return;
        case 'http-error':
          setAppStatus('error');
          setAppErrorMessage(`${outcome.error.message} (${outcome.error.code})`);
          return;
        case 'success':
          if (outcome.data.found) {
            setAppResult(outcome.data);
            setAppStatus('found');
          } else {
            // A wrong number+phone pair answers exactly like an unknown
            // number — this branch must never say anything that lets a
            // caller tell the two apart.
            setAppResult(null);
            setAppStatus('miss');
          }
      }
    })();
  };

  const appStatusLabel =
    appResult && (pickLocalized(appResult.status_label, uiLanguage) || appResult.status || undefined);

  // `?? []` and not a bare read: the generated type says `signatures` is
  // required, but a core that predates #213 does not send it, and this page
  // may be deployed against one (single `main`, no dev/prod split).
  const signatureLines: CheckCard['signatures'] = result?.signatures ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="reveal text-center space-y-3">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('verify.header.badge')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1F24]">
          {t('verify.header.title')}
        </h1>
        {/* xl, not lg: the Russian subtitle needs 576px to stay on one line,
            and a second line here pushes the search card and everything under
            it down by 20px whenever the language changes. */}
        <p className="text-sm text-[#5A646D] max-w-xl mx-auto pt-1 leading-relaxed">
          {t('verify.header.subtitle')}
        </p>

        {/* Two-tab switcher: which of the two anonymous lookups this page
            runs. It carried `role="tablist"` and `role="tab"` with no
            `tabpanel` anywhere and no `aria-controls` — a screen reader was
            told a tab widget existed and then given nothing it controlled.
            Arrow keys move between the tabs, which is what the roving
            `tabIndex` below requires: without them the inactive tab would
            be unreachable from the keyboard entirely. */}
        <div
          role="tablist"
          aria-label={t('verify.tabs.label')}
          className="inline-flex gap-1 rounded-xl border border-[#D9EBDC] bg-[#F0F7F1] p-1"
        >
          {ARMS.map((value) => (
            <button
              key={value}
              type="button"
              id={tabId(value)}
              role="tab"
              aria-selected={arm === value}
              aria-controls={PANEL_ID}
              tabIndex={arm === value ? 0 : -1}
              onClick={() => setArm(value)}
              onKeyDown={onTabKeyDown}
              className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-colors ${
                arm === value ? 'bg-[#123522] text-white' : 'text-[#23653F]'
              }`}
            >
              {t(`verify.tabs.${value}`)}
            </button>
          ))}
        </div>
      </div>

      <div
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={tabId(arm)}
        className="space-y-8"
      >

      {/* Search Input Card */}
      <div className="reveal bg-white border border-[#E4E7EA] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {arm === 'permit' ? (
          <>
            <form onSubmit={handleManualSearch} className="space-y-1.5">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full sm:flex-1">
                  <FormField label={t('verify.form.permitNoLabel')} htmlFor="verify-permit-no">
                    <Input
                      id="verify-permit-no"
                      placeholder={t('verify.form.permitNoPlaceholder')}
                      value={permitNoInput}
                      onChange={(e) => {
                        setPermitNoInput(e.target.value);
                        setPermitNoInvalid(false);
                      }}
                      maxLength={PERMIT_NUMBER_INPUT_MAX_LENGTH}
                      error={permitNoInvalid}
                      leftIcon={<Search className="w-4 h-4" />}
                      touchSize
                    />
                  </FormField>
                </div>
                <Button type="submit" variant="primary" size="lg" className="whitespace-nowrap">
                  {t('verify.form.submit')}
                </Button>
              </div>
              {/* Below the row, not inside the field: the row aligns on its
                  bottom edge, and a message under the box would drag the
                  button down with it. */}
              {permitNoInvalid && (
                <p className="text-xs text-[#B91C1C] flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('verify.form.permitNoInvalid')}</span>
                </p>
              )}
            </form>

            <div className="flex items-center gap-2 text-xs text-[#767F87] bg-[#F8F9FA] p-3 rounded-lg border border-[#E4E7EA]">
              <QrCode className="w-4 h-4 text-[#2E7D4F] shrink-0" />
              <span>
                {t('verify.qrInfo.before')} <b>{t('verify.qrInfo.bold')}</b> {t('verify.qrInfo.after')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#767F87] bg-[#F8F9FA] p-3 rounded-lg border border-[#E4E7EA]">
              <Lock className="w-4 h-4 text-[#2E7D4F] shrink-0" />
              <span>
                <b>{t('verify.pii.bold')}</b> {t('verify.pii.after')}
              </span>
            </div>
          </>
        ) : (
          <>
            <form
              onSubmit={handleApplicationSearch}
              className="flex flex-col sm:flex-row gap-3 items-end"
            >
              <div className="w-full sm:w-2/5">
                <FormField
                  label={t('verify.application.numberLabel')}
                  htmlFor="application-number"
                  error={appValidationError ?? undefined}
                >
                  <Input
                    id="application-number"
                    placeholder={t('verify.application.numberPlaceholder')}
                    value={appNumberInput}
                    onChange={(e) => setAppNumberInput(e.target.value)}
                    maxLength={CHECK_NUMBER_MAX_LENGTH}
                    leftIcon={<Hash className="w-4 h-4" />}
                    touchSize
                  />
                </FormField>
              </div>
              <div className="w-full sm:w-2/5">
                <FormField label={t('verify.application.phoneLabel')} htmlFor="application-phone">
                  <Input
                    id="application-phone"
                    placeholder={t('verify.application.phonePlaceholder')}
                    value={appPhoneInput}
                    onChange={(e) => setAppPhoneInput(e.target.value)}
                    maxLength={CHECK_PHONE_MAX_LENGTH}
                    leftIcon={<Phone className="w-4 h-4" />}
                    touchSize
                  />
                </FormField>
              </div>
              <Button type="submit" variant="primary" size="lg" className="whitespace-nowrap">
                {t('verify.form.submit')}
              </Button>
            </form>

            <div className="flex items-center gap-2 text-xs text-[#767F87] bg-[#F8F9FA] p-3 rounded-lg border border-[#E4E7EA]">
              <Lock className="w-4 h-4 text-[#2E7D4F] shrink-0" />
              <span>
                <b>{t('verify.application.privacyBold')}</b> {t('verify.application.privacyAfter')}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Permit arm result ──────────────────────────────────────────── */}
      {arm === 'permit' && status === 'loading' && (
        <div className="flex items-center justify-center gap-3 text-[#5A646D] py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">{t('verify.status.loading')}</span>
        </div>
      )}

      {arm === 'permit' && status === 'error' && (
        <Alert variant="danger" title={t('verify.status.errorTitle')}>
          {errorMessage}
        </Alert>
      )}

      {arm === 'permit' && status === 'miss' && (
        <Alert variant="danger" title={t('verify.status.missTitle')}>
          {t('verify.status.missMessage')}
        </Alert>
      )}

      {arm === 'permit' && status === 'found' && result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="card-lift bg-white border border-[#E4E7EA] rounded-2xl shadow-md overflow-hidden">
            {/* Top Banner Result Status */}
            <div
              className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                STATUS_BADGE[result.status] === 'approved'
                  ? 'bg-[#F0F7F1] border-[#D9EBDC] text-[#123522]'
                  : STATUS_BADGE[result.status] === 'warning'
                  ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                  : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-xs shrink-0">
                  <CheckCircle2 className="w-8 h-8 text-[#15803D]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {/* The TEXT follows the UI language the way the application
                        arm's does; the colour stays keyed on `result.status`,
                        the backend's own four-word vocabulary. */}
                    <span className="text-xl font-bold font-mono">
                      {pickLocalized(result.status_label, uiLanguage) || result.status}
                    </span>
                    <StatusBadge status={STATUS_BADGE[result.status]} size="sm" />
                  </div>
                  <p className="text-xs mt-0.5 font-medium opacity-90">
                    {t('verify.result.registryNote')}
                  </p>
                </div>
              </div>
            </div>

            {/* Detail Breakdown Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA] border border-[#E4E7EA]">
                  <UserCheck className="w-5 h-5 text-[#2E7D4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#5A646D] uppercase font-semibold block">{t('verify.result.holderLabel')}</span>
                    <span className="font-bold text-[#1A1F24] text-base">{result.holder}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA] border border-[#E4E7EA]">
                  <Building className="w-5 h-5 text-[#2E7D4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#5A646D] uppercase font-semibold block">{t('verify.result.activityLabel')}</span>
                    <span className="font-bold text-[#1A1F24] text-base">{result.activity_type}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA] border border-[#E4E7EA]">
                  <MapPin className="w-5 h-5 text-[#2E7D4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#5A646D] uppercase font-semibold block">{t('verify.result.organizationLabel')}</span>
                    <span className="font-bold text-[#1A1F24]">{result.organization}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA] border border-[#E4E7EA]">
                  <Calendar className="w-5 h-5 text-[#2E7D4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#5A646D] uppercase font-semibold block">{t('verify.result.validityLabel')}</span>
                    <span className="font-bold text-[#1A1F24] font-mono">{result.valid_from} — {result.valid_to}</span>
                  </div>
                </div>
              </div>

              {/* E-IMZO Security Certificate Block */}
              <div className="p-4 bg-[#F0F7F1] border border-[#D9EBDC] rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#123522]">
                  <FileCheck className="w-4 h-4 text-[#15803D]" />
                  <span>
                    {result.signatures_valid
                      ? t('verify.result.signaturesValid')
                      : t('verify.result.signaturesPending')}
                  </span>
                </div>
                {/* `signatures` arrived with #213 and the landing deploys from
                    a single `main`, ahead of or behind the core: a card without
                    the field must render the rest of the card, never throw. */}
                {signatureLines.length > 0 && (
                  <>
                    <span className="text-xs text-[#5A646D] uppercase font-semibold block">
                      {t('verify.result.signaturesTitle')}
                    </span>
                    <ul className="mt-2 space-y-1 text-xs text-[#1A1F24]">
                      {/* Index, not `row.line`: a returned-and-resubmitted
                          application signs `application_submit` again, so the
                          same line legitimately repeats with a different
                          `signed_on` — the API gives no per-line id, and
                          `line`+`signed_on` is not unique either (date-only). */}
                      {signatureLines.map((row, index) => (
                        <li key={`${row.line}-${index}`} className="flex justify-between gap-3">
                          <span>{pickLocalized(row.line_label, uiLanguage) || row.line}</span>
                          <span className="font-mono text-[#5A646D]">{row.signed_on}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Map panel — ONLY when the API actually sent a contour.
                  `contour` is withheld until the Agency's disclosure setting
                  is on (off in production), so with no geometry there is
                  nothing to draw: the panel used to render a blank rectangle
                  with zoom buttons and a legend for an invisible boundary.
                  The leshoz is named in the detail grid above, as text. */}
              {result.contour && (
                <div className="space-y-2">
                  <span className="text-xs text-[#5A646D] uppercase font-semibold block">
                    {t('verify.map.title')}
                  </span>
                  <Suspense fallback={<Skeleton height="h-72" width="w-full" />}>
                    <LazyPermitContourMap contour={result.contour} />
                  </Suspense>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Application arm result ─────────────────────────────────────── */}
      {arm === 'application' && appStatus === 'loading' && (
        <div className="flex items-center justify-center gap-3 text-[#5A646D] py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">{t('verify.status.loading')}</span>
        </div>
      )}

      {arm === 'application' && appStatus === 'error' && (
        <Alert variant="danger" title={t('verify.status.errorTitle')}>
          {appErrorMessage}
        </Alert>
      )}

      {arm === 'application' && appStatus === 'miss' && (
        <Alert variant="danger" title={t('verify.application.missTitle')}>
          {t('verify.application.missMessage')}
        </Alert>
      )}

      {arm === 'application' && appStatus === 'found' && appResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="card-lift bg-white border border-[#E4E7EA] rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-[#D9EBDC] bg-[#F0F7F1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#767F87] uppercase font-semibold block">
                  {t('verify.application.numberLabel')}
                </span>
                <span className="mt-1 block text-xl font-bold font-mono text-[#123522]">
                  {appResult.number ?? DASH}
                </span>
              </div>
              {appStatusLabel && (
                <StatusBadge status={applicationStatusVariant(appResult.status)} label={appStatusLabel} />
              )}
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA] border border-[#E4E7EA]">
                  <Building className="w-5 h-5 text-[#2E7D4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#5A646D] uppercase font-semibold block">
                      {t('verify.application.activityLabel')}
                    </span>
                    <span className="font-bold text-[#1A1F24]">{appResult.activity_type ?? DASH}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA] border border-[#E4E7EA]">
                  <MapPin className="w-5 h-5 text-[#2E7D4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#5A646D] uppercase font-semibold block">
                      {t('verify.application.organizationLabel')}
                    </span>
                    <span className="font-bold text-[#1A1F24]">{appResult.organization ?? DASH}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA] border border-[#E4E7EA]">
                  <Calendar className="w-5 h-5 text-[#2E7D4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#5A646D] uppercase font-semibold block">
                      {t('verify.application.submittedLabel')}
                    </span>
                    <span className="font-bold text-[#1A1F24] font-mono">
                      {appResult.submitted_at ? appResult.submitted_at.slice(0, 10) : DASH}
                    </span>
                  </div>
                </div>
              </div>

              {/* `next_step` is an omitted row, not an em dash, when absent —
                  it is a whole callout, not a label:value pair. */}
              {appResult.next_step && (
                <div className="p-4 bg-[#F8F9FA] border-l-4 border-[#B45309] rounded-xl">
                  <div className="text-sm font-bold text-[#123522]">{t('verify.application.nextStepLabel')}</div>
                  <p className="mt-2 text-sm leading-relaxed text-[#3F4A52]">{appResult.next_step}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
