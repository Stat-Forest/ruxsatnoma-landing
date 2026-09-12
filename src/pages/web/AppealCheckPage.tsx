import React, { useState } from 'react';
import {
  Search,
  Lock,
  Loader2,
  FileCheck,
  Send,
  FileText,
  Mail,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input, FormField, Textarea } from '../../components/ui/FormControls';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { StatusType } from '../../components/ui/StatusBadge';
import { Alert } from '../../components/ui/Feedback';
import { api } from '../../api/client';
import { apiError, formatApiError } from '../../api/errors';
import type { components } from '../../api/schema';
import { useT } from '../../i18n/useT';

type AppealStatusOut = components['schemas']['AppealStatusOut'];

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

type FileState = 'idle' | 'sending' | 'sent' | 'error';

export interface AppealFormProps {
  /** Called with the registration number the backend assigns, so the check
   *  form below can be filled in for the citizen: the number and the contact
   *  they just used ARE the pair `GET /public/appeals/check` matches on, and
   *  asking them to retype both immediately after filing is how a person
   *  loses the number. */
  onFiled?: (filed: { number: string; phone: string; email: string }) => void;
  className?: string;
}

/**
 * Task 14 (filing half) — `/appeal-check`. Until this was added to the
 * page, the adminka had the four staff routes for answering — and
 * `adminka/src/pages/support/appeals/api.ts` stated in a comment that the
 * citizen's filing form "shipped on the public site". It had not. **A citizen
 * could check the status of an appeal they had no way to file**, which is the
 * half of С27 that carries the legal obligation.
 *
 * `AppealContact` requires at least one of phone/email — that pair is the
 * shared secret proving the filer is the one asking later — so this form
 * refuses locally rather than sending a body the API will reject.
 */
export const AppealForm: React.FC<AppealFormProps> = ({ onFiled, className = '' }) => {
  const t = useT();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [state, setState] = useState<FileState>('idle');
  const [assignedNumber, setAssignedNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleFile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    if (!trimmedPhone && !trimmedEmail) {
      setContactError(t('appeal.file.contactRequired'));
      return;
    }
    setContactError(null);
    setError(null);
    setState('sending');

    void (async () => {
      try {
        const { data, error: apiErr } = await api.POST('/api/v1/public/appeals', {
          body: {
            applicant_name: name.trim(),
            contact: { phone: trimmedPhone || null, email: trimmedEmail || null },
            subject: subject.trim(),
            body: body.trim(),
          },
        });
        if (apiErr || !data) {
          setState('error');
          setError(formatApiError(t, apiError(apiErr ?? {})));
          return;
        }
        setAssignedNumber(data.number);
        setState('sent');
        onFiled?.({ number: data.number, phone: trimmedPhone, email: trimmedEmail });
      } catch {
        setState('error');
        setError(t('appeal.status.networkError'));
      }
    })();
  };

  return (
    <div
      className={`relative bg-white/95 backdrop-blur-md border border-[#CCE4D3] rounded-3xl p-6 sm:p-8 sm:p-9 shadow-[0_12px_40px_-15px_rgba(18,53,34,0.08)] space-y-6 overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Top emerald gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B5E20] via-[#2E7D4F] to-[#34D399]" />

      {/* Decorative ambient background glow */}
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#34D399]/5 blur-3xl pointer-events-none" />

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF7EE] border border-[#BCE7C7] text-xs font-bold text-[#1E5631]">
          <Sparkles className="w-3.5 h-3.5 text-[#2E7D4F]" />
          <span>Rasmiy murojaat</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#123522] tracking-tight">
          {t('appeal.file.title')}
        </h2>
        <p className="text-xs sm:text-sm text-[#4E6354] leading-relaxed max-w-xl">
          {t('appeal.file.subtitle')}
        </p>
      </div>

      <form onSubmit={handleFile} className="space-y-5">
        <FormField label={t('appeal.file.nameLabel')} htmlFor="appeal-file-name">
          <Input
            id="appeal-file-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={255}
            touchSize
            leftIcon={<User className="w-4 h-4 text-[#2E7D4F]" />}
            placeholder="Familiya Ism Sharifingiz"
            className="!rounded-xl border-[#CFDFD4] focus:border-[#2E7D4F] transition-all"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label={t('appeal.file.phoneLabel')}
            htmlFor="appeal-file-phone"
            error={contactError ?? undefined}
          >
            <Input
              id="appeal-file-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={32}
              touchSize
              leftIcon={<Phone className="w-4 h-4 text-[#2E7D4F]" />}
              placeholder="+998 90 123 45 67"
              className="!rounded-xl border-[#CFDFD4] focus:border-[#2E7D4F] transition-all"
            />
          </FormField>
          <FormField label={t('appeal.file.emailLabel')} htmlFor="appeal-file-email">
            <Input
              id="appeal-file-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              touchSize
              leftIcon={<Mail className="w-4 h-4 text-[#2E7D4F]" />}
              placeholder="namuna@domain.uz"
              className="!rounded-xl border-[#CFDFD4] focus:border-[#2E7D4F] transition-all"
            />
          </FormField>
        </div>

        <FormField label={t('appeal.file.subjectLabel')} htmlFor="appeal-file-subject">
          <Input
            id="appeal-file-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={255}
            touchSize
            leftIcon={<FileText className="w-4 h-4 text-[#2E7D4F]" />}
            placeholder="Murojaatning qisqacha mazmuni"
            className="!rounded-xl border-[#CFDFD4] focus:border-[#2E7D4F] transition-all"
          />
        </FormField>

        <FormField label={t('appeal.file.bodyLabel')} htmlFor="appeal-file-body">
          <Textarea
            id="appeal-file-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={5000}
            rows={5}
            placeholder="Murojaatingiz matnini batafsil bayon eting..."
            className="!rounded-xl border-[#CFDFD4] focus:border-[#2E7D4F] transition-all"
          />
        </FormField>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={state === 'sending'}
            className="!rounded-xl !bg-gradient-to-r !from-[#1B5E20] !via-[#2E7D4F] !to-[#256F44] hover:!from-[#144A18] hover:!to-[#1E5D38] !py-3.5 !px-8 shadow-md shadow-[#2E7D4F]/25 hover:shadow-xl hover:shadow-[#2E7D4F]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 font-bold text-sm sm:text-base cursor-pointer group"
          >
            <Send className="w-4 h-4 text-white group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300" />
            <span>{t('appeal.file.submit')}</span>
          </Button>
          <div className="flex items-center gap-2 text-xs text-[#526B5A]">
            <Lock className="w-3.5 h-3.5 text-[#2E7D4F]" />
            <span>Maʼlumotlar xavfsizligi kafolatlangan</span>
          </div>
        </div>
      </form>

      {state === 'sent' && (
        <Alert variant="success" title={t('appeal.file.sentTitle')}>
          <span>
            {t('appeal.file.sentBefore')}{' '}
            <b className="font-mono text-[#1A1F24]">{assignedNumber}</b>{' '}
            {t('appeal.file.sentAfter')}
          </span>
        </Alert>
      )}

      {state === 'error' && (
        <Alert variant="danger" title={t('appeal.file.errorTitle')}>
          {error}
        </Alert>
      )}
    </div>
  );
};

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
          setErrorMessage(formatApiError(t, apiError(error)));
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
      <div className="text-center space-y-3">
        <span className="reveal inline-block text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          {t('appeal.header.badge')}
        </span>
        <h1
          className="reveal text-2xl sm:text-3xl font-bold text-[#1A1F24]"
          style={{ animationDelay: '0.06s' }}
        >
          {t('appeal.header.title')}
        </h1>
        <p
          className="reveal text-sm text-[#5A646D] max-w-xl mx-auto pt-1 leading-relaxed"
          style={{ animationDelay: '0.12s' }}
        >
          {t('appeal.header.subtitle')}
        </p>
      </div>

      <AppealForm
        onFiled={({ number: filedNumber, phone: filedPhone, email: filedEmail }) => {
          setNumber(filedNumber);
          if (filedPhone) setPhone(filedPhone);
          if (filedEmail) setEmail(filedEmail);
        }}
      />

      <div
        className="reveal bg-white border border-[#E4E7EA] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
        style={{ animationDelay: '0.06s' }}
      >
        <div>
          <h2 className="text-base font-bold text-[#1A1F24]">{t('appeal.check.title')}</h2>
          <p className="text-xs text-[#5A646D]">{t('appeal.check.subtitle')}</p>
        </div>
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
        <div className="reveal bg-white border border-[#E4E7EA] rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
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
