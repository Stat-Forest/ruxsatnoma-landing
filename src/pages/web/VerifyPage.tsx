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
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input, FormField } from '../../components/ui/FormControls';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { StatusType } from '../../components/ui/StatusBadge';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { api } from '../../api/client';
import { apiError } from '../../api/errors';
import type { components } from '../../api/schema';
import { useT, useLanguage } from '../../i18n/useT';
import { pickLocalized } from '../../lib/localized';
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

/** Copy this task needs that has no `i18n` key yet — the tab switcher and
 *  the whole "Ariza holati" arm are new. Flagged in the track report; add
 *  `verify.tabs.*` / `verify.application.*` keys to `src/i18n/*` (all five
 *  languages, `parity.test.ts` enforces that) and replace these with
 *  `t(...)` once they exist. Uzbek only, per the task's own UI-copy rule. */
const LOCAL_COPY = {
  tabPermit: 'Ruxsatnoma',
  tabApplication: 'Ariza holati',
  tabListLabel: 'Tekshirish turi',
  appNumberLabel: 'Ariza raqami',
  appNumberPlaceholder: 'Masalan: AR-2026-004518',
  appPhoneLabel: 'Telefon',
  appPhonePlaceholder: '+998 90 123 45 67',
  appValidation: 'Ariza raqami va telefon raqamini kiriting',
  appMissTitle: 'Ariza topilmadi',
  appMissMessage:
    'Kiritilgan ariza raqami va telefon raqami boʻyicha maʼlumot topilmadi. Maʼlumotlarni qaytadan tekshiring.',
  appPrivacyBold: 'Maxfiylik:',
  appPrivacyAfter:
    'telefon raqami faqat arizaning sizga tegishli ekanini tasdiqlash uchun ishlatiladi.',
  appNumberResultLabel: 'Ariza raqami',
  appActivityLabel: 'Faoliyat turi',
  appOrganizationLabel: 'Oʻrmon xoʻjaligi',
  appSubmittedLabel: 'Topshirilgan sana',
  appNextStepLabel: 'Keyingi qadam',
} as const;

/** Splits a loose permit-number string (the home page's single quick-search
 * box, e.g. "А № 000123" or "A-123") into `series`+`number` — the two halves
 * `GET /public/permits/check` actually takes (`permits/service.py`'s
 * `_permit_number`: `f"{series} № {number:06d}"`). Best-effort only: a
 * string with no digits cannot name a permit, so the caller falls back to a
 * plain "not found" instead of guessing further. */
function splitPermitNumber(raw: string): { series: string; number: string } | null {
  const match = raw.trim().match(/^(.*?)\D*(\d+)\D*$/);
  if (!match) return null;
  const series = match[1].replace(/[№#]/g, '').trim();
  const number = match[2];
  if (!series || !number) return null;
  return { series, number };
}

type Query = { qr: string } | { series: string; number: string };

/** Reads the page's own contract out of the URL, in priority order: `?qr=`
 * (a scanned QR — A7's whole reason to exist), then `?series=&number=` (a
 * bookmarkable manual lookup), then the home page's free-text `?q=`. */
function queryFromParams(params: URLSearchParams): Query | null {
  const qr = params.get('qr');
  if (qr) return { qr };
  const series = params.get('series');
  const number = params.get('number');
  if (series && number) return { series, number };
  const q = params.get('q');
  if (q) {
    const split = splitPermitNumber(q);
    if (split) return split;
  }
  return null;
}

type Status = 'idle' | 'loading' | 'found' | 'miss' | 'error';
type Arm = 'permit' | 'application';

export const VerifyPage: React.FC = () => {
  const t = useT();
  const { uiLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [arm, setArm] = useState<Arm>('permit');

  // ── Permit arm (existing) ────────────────────────────────────────────────
  const [seriesInput, setSeriesInput] = useState(searchParams.get('series') ?? '');
  const [numberInput, setNumberInput] = useState(searchParams.get('number') ?? '');
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
          params: { query: 'qr' in q ? { qr: q.qr } : { series: q.series, number: Number(q.number) } },
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
    const next = new URLSearchParams();
    if (seriesInput.trim() && numberInput.trim()) {
      next.set('series', seriesInput.trim());
      next.set('number', numberInput.trim());
    }
    setSearchParams(next);
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
      setAppValidationError(LOCAL_COPY.appValidation);
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
            runs. Not itself part of `verify.header.*` — see `LOCAL_COPY`. */}
        <div
          role="tablist"
          aria-label={LOCAL_COPY.tabListLabel}
          className="inline-flex gap-1 rounded-xl border border-[#D9EBDC] bg-[#F0F7F1] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={arm === 'permit'}
            onClick={() => setArm('permit')}
            className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-colors ${
              arm === 'permit' ? 'bg-[#123522] text-white' : 'text-[#23653F]'
            }`}
          >
            {LOCAL_COPY.tabPermit}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={arm === 'application'}
            onClick={() => setArm('application')}
            className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-colors ${
              arm === 'application' ? 'bg-[#123522] text-white' : 'text-[#23653F]'
            }`}
          >
            {LOCAL_COPY.tabApplication}
          </button>
        </div>
      </div>

      {/* Search Input Card */}
      <div className="reveal bg-white border border-[#E4E7EA] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {arm === 'permit' ? (
          <>
            <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full sm:w-1/3">
                <FormField label={t('verify.form.seriesLabel')} htmlFor="verify-series">
                  <Input
                    id="verify-series"
                    placeholder={t('verify.form.seriesPlaceholder')}
                    value={seriesInput}
                    onChange={(e) => setSeriesInput(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                    touchSize
                  />
                </FormField>
              </div>
              <div className="w-full sm:w-1/3">
                <FormField label={t('verify.form.numberLabel')} htmlFor="verify-number">
                  <Input
                    id="verify-number"
                    placeholder={t('verify.form.numberPlaceholder')}
                    value={numberInput}
                    onChange={(e) => setNumberInput(e.target.value)}
                    inputMode="numeric"
                    touchSize
                  />
                </FormField>
              </div>
              <Button type="submit" variant="primary" size="lg" className="whitespace-nowrap">
                {t('verify.form.submit')}
              </Button>
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
                  label={LOCAL_COPY.appNumberLabel}
                  htmlFor="application-number"
                  error={appValidationError ?? undefined}
                >
                  <Input
                    id="application-number"
                    placeholder={LOCAL_COPY.appNumberPlaceholder}
                    value={appNumberInput}
                    onChange={(e) => setAppNumberInput(e.target.value)}
                    leftIcon={<Hash className="w-4 h-4" />}
                    touchSize
                  />
                </FormField>
              </div>
              <div className="w-full sm:w-2/5">
                <FormField label={LOCAL_COPY.appPhoneLabel} htmlFor="application-phone">
                  <Input
                    id="application-phone"
                    placeholder={LOCAL_COPY.appPhonePlaceholder}
                    value={appPhoneInput}
                    onChange={(e) => setAppPhoneInput(e.target.value)}
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
                <b>{LOCAL_COPY.appPrivacyBold}</b> {LOCAL_COPY.appPrivacyAfter}
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
                    <span className="text-xl font-bold font-mono">{result.status}</span>
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
        <Alert variant="danger" title={LOCAL_COPY.appMissTitle}>
          {LOCAL_COPY.appMissMessage}
        </Alert>
      )}

      {arm === 'application' && appStatus === 'found' && appResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="card-lift bg-white border border-[#E4E7EA] rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-[#D9EBDC] bg-[#F0F7F1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#767F87] uppercase font-semibold block">
                  {LOCAL_COPY.appNumberResultLabel}
                </span>
                <span className="mt-1 block text-xl font-bold font-mono text-[#123522]">
                  {appResult.number ?? '—'}
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
                      {LOCAL_COPY.appActivityLabel}
                    </span>
                    <span className="font-bold text-[#1A1F24]">{appResult.activity_type ?? '—'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA] border border-[#E4E7EA]">
                  <MapPin className="w-5 h-5 text-[#2E7D4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#5A646D] uppercase font-semibold block">
                      {LOCAL_COPY.appOrganizationLabel}
                    </span>
                    <span className="font-bold text-[#1A1F24]">{appResult.organization ?? '—'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA] border border-[#E4E7EA]">
                  <Calendar className="w-5 h-5 text-[#2E7D4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#5A646D] uppercase font-semibold block">
                      {LOCAL_COPY.appSubmittedLabel}
                    </span>
                    <span className="font-bold text-[#1A1F24] font-mono">
                      {appResult.submitted_at ? appResult.submitted_at.slice(0, 10) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* `next_step` is an omitted row, not an em dash, when absent —
                  it is a whole callout, not a label:value pair. */}
              {appResult.next_step && (
                <div className="p-4 bg-[#F8F9FA] border-l-4 border-[#B45309] rounded-xl">
                  <div className="text-sm font-bold text-[#123522]">{LOCAL_COPY.appNextStepLabel}</div>
                  <p className="mt-2 text-sm leading-relaxed text-[#3F4A52]">{appResult.next_step}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
