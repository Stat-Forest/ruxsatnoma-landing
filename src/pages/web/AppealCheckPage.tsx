import React, { useState } from 'react';
import { Search, Lock, Loader2, FileCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input, FormField } from '../../components/ui/FormControls';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { StatusType } from '../../components/ui/StatusBadge';
import { Alert } from '../../components/ui/Feedback';
import { api } from '../../api/client';
import { apiError } from '../../api/errors';
import type { ApiError } from '../../api/errors';
import type { components } from '../../api/schema';
import { useT } from '../../i18n/useT';

type AppealStatusOut = components['schemas']['AppealStatusOut'];
type TFunction = ReturnType<typeof useT>;

type Status = 'idle' | 'loading' | 'found' | 'miss' | 'error';

// The backend's `status` is an internal code, not user-facing text (unlike
// `/check`'s Uzbek-Cyrillic status strings) — every value needs both a
// `StatusBadge` visual variant and an i18n label override.
const STATUS_BADGE_VARIANT: Record<string, StatusType> = {
  new: 'pending',
  in_progress: 'info',
  answered: 'approved',
  closed: 'draft',
};

const STATUS_LABEL_KEY: Record<string, string> = {
  new: 'appeal.status.new',
  in_progress: 'appeal.status.inProgress',
  answered: 'appeal.status.answered',
  closed: 'appeal.status.closed',
};

/** Same rate-limit (`ERR-SYS-006`) special-case as `OpenDataPage`'s own local
 * helper — written again here rather than shared, per the plan's own call:
 * two lines is not worth a cross-file dependency for. */
function formatCheckError(t: TFunction, err: ApiError): string {
  if (err.code === 'ERR-SYS-006') {
    const details = err.details as { retry_after_seconds?: unknown } | undefined;
    const seconds = typeof details?.retry_after_seconds === 'number' ? details.retry_after_seconds : null;
    if (seconds !== null) {
      return `${t('appeal.error.rateLimited.before')} ${seconds} ${t('appeal.error.rateLimited.after')}`;
    }
  }
  return `${err.message} (${err.code})`;
}

export const AppealCheckPage: React.FC = () => {
  const t = useT();
  // Deliberately local `useState`, NOT `useSearchParams` — unlike `/check`'s
  // `series`/`number`, an appeal's phone/email are the shared secret proving
  // the caller filed it, and the backend excludes this endpoint's `phone`/
  // `email` query params from its own access log for exactly that reason. A
  // URL-mirrored value would undo that on the browser's own history/referrer.
  const [number, setNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<AppealStatusOut | null>(null);
  const [checkedNumber, setCheckedNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNumber = number.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedNumber || (!trimmedPhone && !trimmedEmail)) {
      setValidationError(t('appeal.form.contactRequired'));
      return;
    }
    setValidationError(null);
    setStatus('loading');
    setErrorMessage(null);

    void (async () => {
      try {
        const { data, error } = await api.GET('/api/v1/public/appeals/check', {
          params: {
            query: {
              number: trimmedNumber,
              phone: trimmedPhone || undefined,
              email: trimmedEmail || undefined,
            },
          },
        });
        if (error) {
          setStatus('error');
          setErrorMessage(formatCheckError(t, apiError(error)));
          return;
        }
        const body = data as AppealStatusOut;
        setCheckedNumber(trimmedNumber);
        if (body.found) {
          setResult(body);
          setStatus('found');
        } else {
          setResult(null);
          setStatus('miss');
        }
      } catch {
        setStatus('error');
        setErrorMessage(t('appeal.status.networkError'));
      }
    })();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('appeal.header.badge')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1F24]">{t('appeal.header.title')}</h1>
        <p className="text-sm text-[#5A646D] max-w-xl mx-auto">{t('appeal.header.subtitle')}</p>
      </div>

      <div className="bg-white border border-[#E4E7EA] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label={t('appeal.form.numberLabel')} htmlFor="appeal-number" error={validationError ?? undefined}>
              <Input
                id="appeal-number"
                placeholder={t('appeal.form.numberPlaceholder')}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                touchSize
              />
            </FormField>
            <FormField label={t('appeal.form.phoneLabel')} htmlFor="appeal-phone">
              <Input id="appeal-phone" value={phone} onChange={(e) => setPhone(e.target.value)} touchSize />
            </FormField>
            <FormField label={t('appeal.form.emailLabel')} htmlFor="appeal-email">
              <Input id="appeal-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} touchSize />
            </FormField>
          </div>
          <Button type="submit" variant="primary" size="lg" isLoading={status === 'loading'}>
            {t('appeal.form.submit')}
          </Button>
        </form>

        <div className="flex items-center gap-2 text-xs text-[#767F87] bg-[#F8F9FA] p-3 rounded-lg border border-[#E4E7EA]">
          <Lock className="w-4 h-4 text-[#2E7D4F] shrink-0" />
          <span>
            <b>{t('appeal.privacy.bold')}</b> {t('appeal.privacy.after')}
          </span>
        </div>
      </div>

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-3 text-[#5A646D] py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">{t('appeal.status.loading')}</span>
        </div>
      )}

      {status === 'error' && (
        <Alert variant="danger" title={t('appeal.status.errorTitle')}>
          {errorMessage}
        </Alert>
      )}

      {status === 'miss' && (
        <Alert variant="danger" title={t('appeal.status.missTitle')}>
          {t('appeal.status.missMessage')}
        </Alert>
      )}

      {status === 'found' && result && (
        <div className="bg-white border border-[#E4E7EA] rounded-2xl shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#5A646D] uppercase font-semibold block">
                {t('appeal.result.numberLabel')}
              </span>
              <span className="font-bold text-[#1A1F24] text-lg font-mono">{checkedNumber}</span>
            </div>
            {result.status && (
              <StatusBadge
                status={STATUS_BADGE_VARIANT[result.status] ?? 'draft'}
                label={t(STATUS_LABEL_KEY[result.status] ?? 'appeal.status.new')}
              />
            )}
          </div>

          {result.subject && (
            <div>
              <span className="text-xs text-[#5A646D] uppercase font-semibold block">
                {t('appeal.result.subjectLabel')}
              </span>
              <p className="text-sm text-[#1A1F24] font-medium">{result.subject}</p>
            </div>
          )}

          {result.answer_text ? (
            <div className="p-4 bg-[#F0F7F1] border border-[#D9EBDC] rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#123522]">
                <FileCheck className="w-4 h-4 text-[#15803D]" />
                <span>{t('appeal.result.answerHeading')}</span>
              </div>
              <p className="text-sm text-[#1A1F24] leading-relaxed">{result.answer_text}</p>
              {result.answered_at && (
                <p className="text-xs text-[#5A646D]">
                  {t('appeal.result.answeredAtLabel')} <span className="font-mono">{result.answered_at.slice(0, 10)}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#5A646D]">{t('appeal.result.noAnswerYet')}</p>
          )}
        </div>
      )}
    </div>
  );
};
