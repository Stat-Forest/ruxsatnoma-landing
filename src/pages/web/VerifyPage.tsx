import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input, FormField } from '../../components/ui/FormControls';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Alert } from '../../components/ui/Feedback';
import { api } from '../../api/client';
import { apiError } from '../../api/errors';
import type { components } from '../../api/schema';
import { useT } from '../../i18n/useT';

type CheckCard = components['schemas']['PublicCheckCard'];
type CheckResult = CheckCard | components['schemas']['PublicCheckMiss'];

/** `PublicStatus` (`permits/schemas.py`) mapped to this page's existing
 * `StatusBadge` variants — the four words the backend actually returns,
 * never invented labels. */
const STATUS_BADGE: Record<CheckCard['status'], 'approved' | 'warning' | 'rejected'> = {
  амалда: 'approved',
  тўхтатилган: 'warning',
  'муддати тугаган': 'rejected',
  'бекор қилинган': 'rejected',
};

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

export const VerifyPage: React.FC = () => {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const [seriesInput, setSeriesInput] = useState(searchParams.get('series') ?? '');
  const [numberInput, setNumberInput] = useState(searchParams.get('number') ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<CheckCard | null>(null);
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
          setResult(body);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('verify.header.badge')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1F24]">
          {t('verify.header.title')}
        </h1>
        <p className="text-sm text-[#5A646D] max-w-lg mx-auto">
          {t('verify.header.subtitle')}
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white border border-[#E4E7EA] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="w-full sm:w-1/3">
            <FormField label={t('verify.form.seriesLabel')}>
              <Input
                placeholder={t('verify.form.seriesPlaceholder')}
                value={seriesInput}
                onChange={(e) => setSeriesInput(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                touchSize
              />
            </FormField>
          </div>
          <div className="w-full sm:w-1/3">
            <FormField label={t('verify.form.numberLabel')}>
              <Input
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
      </div>

      {/* Result Section */}
      {status === 'loading' && (
        <div className="flex items-center justify-center gap-3 text-[#5A646D] py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">{t('verify.status.loading')}</span>
        </div>
      )}

      {status === 'error' && (
        <Alert variant="danger" title={t('verify.status.errorTitle')}>
          {errorMessage}
        </Alert>
      )}

      {status === 'miss' && (
        <Alert variant="danger" title={t('verify.status.missTitle')}>
          {t('verify.status.missMessage')}
        </Alert>
      )}

      {status === 'found' && result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-[#E4E7EA] rounded-2xl shadow-md overflow-hidden">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
