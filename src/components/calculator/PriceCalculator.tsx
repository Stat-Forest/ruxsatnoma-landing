import React, { useEffect, useState } from 'react';
import { Calculator, AlertTriangle, Loader2, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Input, Select, FormField } from '../ui/FormControls';
import { Alert, Skeleton } from '../ui/Feedback';
import { api } from '../../api/client';
import { apiError } from '../../api/errors';
import { CABINET_PATHS, goToCabinet } from '../../lib/cabinet';
import { pickName } from '../../lib/localized';
import { useT } from '../../i18n/useT';
import type { components } from '../../api/schema';

type ActivityType = components['schemas']['PublicActivityTypeOut'];
type LivestockType = components['schemas']['PublicLivestockTypeOut'];
type EstimateResult = components['schemas']['PublicEstimateOut'];

const GRAZING_CODE = 'grazing'; // `norms/calculator.py::GRAZING` — the one activity that prices per livestock head, not per declared quantity.

function addMonthsIso(base: Date, months: number): string {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type RefsState =
  | { status: 'loading' }
  // `message` is the server's own text; `messageKey` is one of ours, kept as a
  // key so a language switch after the failure re-renders it translated.
  | { status: 'error'; message?: string; messageKey?: string }
  | { status: 'ready'; activityTypes: ActivityType[]; livestockTypes: LivestockType[] };

/** The anchor `routes.tsx` sends the header CTA and the old `/tariffs`
 *  URL to. Exported so neither of them can drift from the `id` below. */
export const CALCULATOR_ANCHOR = 'calculator';

export const PriceCalculator: React.FC = () => {
  const t = useT();
  const [refs, setRefs] = useState<RefsState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function loadRefs() {
      try {
        const [activityRes, livestockRes] = await Promise.all([
          api.GET('/api/v1/public/refs/activity-types'),
          api.GET('/api/v1/public/refs/livestock-types'),
        ]);
        if (cancelled) return;
        const firstError = activityRes.error ?? livestockRes.error;
        if (firstError) {
          const e = apiError(firstError);
          setRefs({ status: 'error', message: `${e.message} (${e.code})` });
          return;
        }
        setRefs({
          status: 'ready',
          activityTypes: activityRes.data ?? [],
          livestockTypes: livestockRes.data ?? [],
        });
      } catch {
        if (cancelled) return;
        setRefs({ status: 'error', messageKey: 'tariffs.error.connectionFailed' });
      }
    }
    void loadRefs();
    return () => {
      cancelled = true;
    };
  }, []);

  if (refs.status === 'loading') {
    return (
      <div id={CALCULATOR_ANCHOR} className="max-w-5xl mx-auto space-y-6 font-sans">
        <Skeleton height="h-10" width="w-2/3" className="mx-auto" />
        <Skeleton height="h-48" />
      </div>
    );
  }

  if (refs.status === 'error') {
    return (
      <div id={CALCULATOR_ANCHOR} className="max-w-3xl mx-auto font-sans">
        <Alert variant="danger" title={t('tariffs.error.title')}>
          {t('tariffs.error.loadFailedPrefix')} {refs.message ?? (refs.messageKey ? t(refs.messageKey) : null)}
        </Alert>
      </div>
    );
  }

  return <CalculatorForm activityTypes={refs.activityTypes} livestockTypes={refs.livestockTypes} />;
};

function CalculatorForm({
  activityTypes,
  livestockTypes,
}: {
  activityTypes: ActivityType[];
  livestockTypes: LivestockType[];
}) {
  const t = useT();
  const [activityId, setActivityId] = useState(activityTypes[0]?.id ?? '');
  const [durationMonths, setDurationMonths] = useState(6);
  const [headCounts, setHeadCounts] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState<number>(1);

  const [estimateStatus, setEstimateStatus] = useState<'idle' | 'loading' | 'ready' | 'refused'>('idle');
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);
  // A refusal is either the server's own text (already in the caller's
  // language, and not ours to translate) or one of our own messages. The
  // second is stored as a KEY, not as rendered text: a message frozen at the
  // moment of the failure would keep the old language after a switch.
  const [estimateMessage, setEstimateMessage] = useState<
    { kind: 'server'; text: string } | { kind: 'key'; key: string } | null
  >(null);

  const selectedActivity = activityTypes.find((a) => a.id === activityId) ?? null;
  const isGrazing = selectedActivity?.code === GRAZING_CODE;

  useEffect(() => {
    if (!selectedActivity) return;

    const items = Object.entries(headCounts)
      .filter(([, count]) => count > 0)
      .map(([livestock_code, count]) => ({ livestock_code, count }));

    if (isGrazing ? items.length === 0 : quantity <= 0) {
      setEstimateStatus('idle');
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setEstimateStatus('loading');
      setEstimateMessage(null);

      void (async () => {
        try {
          const { data, error } = await api.POST('/api/v1/public/calculations/estimate', {
            signal: controller.signal,
            body: {
              activity_type_id: selectedActivity.id,
              period_from: todayIso(),
              period_to: addMonthsIso(new Date(), durationMonths),
              quantity: isGrazing ? undefined : quantity,
              items: isGrazing ? items : [],
            },
          });
          if (error) {
            const e = apiError(error);
            setEstimateStatus('refused');
            setEstimateMessage({ kind: 'server', text: `${e.message} (${e.code})` });
            return;
          }
          setEstimateResult(data ?? null);
          setEstimateStatus('ready');
        } catch (err) {
          if ((err as { name?: string })?.name === 'AbortError') return;
          setEstimateStatus('refused');
          setEstimateMessage({ kind: 'key', key: 'tariffs.calculator.estimateFailed' });
        }
      })();
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedActivity, isGrazing, durationMonths, quantity, headCounts]);

  return (
    <div id={CALCULATOR_ANCHOR} className="max-w-5xl mx-auto space-y-10 font-sans scroll-mt-24">
      {/* Interactive Calculator Section */}
      <section className="bg-white border border-[#E4E7EA] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E4E7EA] pb-4">
          <div className="p-3 bg-[#F0F7F1] text-[#2E7D4F] rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1F24]">{t('tariffs.calculator.heading')}</h2>
            <p className="text-xs text-[#5A646D]">{t('tariffs.calculator.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label={t('tariffs.calculator.activityLabel')}>
            <Select
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              options={activityTypes.map((a) => ({ value: a.id, label: pickName(a.name) }))}
              touchSize
            />
          </FormField>

          {isGrazing ? (
            livestockTypes.map((lt) => (
              <FormField key={lt.id} label={pickName(lt.name)}>
                <Input
                  type="number"
                  min={0}
                  value={headCounts[lt.code] ?? 0}
                  onChange={(e) =>
                    setHeadCounts((prev) => ({ ...prev, [lt.code]: Math.max(0, Number(e.target.value)) }))
                  }
                  touchSize
                />
              </FormField>
            ))
          ) : (
            <FormField label={t('tariffs.calculator.quantityLabel')}>
              <Input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                touchSize
              />
            </FormField>
          )}

          <FormField label={t('tariffs.calculator.durationLabel')}>
            <Select
              value={durationMonths.toString()}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              options={[
                { value: '3', label: t('tariffs.calculator.duration.months3') },
                { value: '6', label: t('tariffs.calculator.duration.months6') },
                { value: '12', label: t('tariffs.calculator.duration.months12') },
              ]}
              touchSize
            />
          </FormField>
        </div>

        {/* Privilege — the anonymous estimate takes no benefit_code at all
            (decision #63: an unverified claim from a visitor with no session
            cannot be honoured), not merely "not yet wired". */}
        <label className="flex items-center gap-2 text-xs font-semibold text-[#9AA3AB] bg-[#F8F9FA] p-3 rounded-xl border border-[#E4E7EA] cursor-not-allowed">
          <input type="checkbox" disabled className="w-4 h-4" />
          <span>{t('tariffs.calculator.privilegeNote')}</span>
        </label>

        {/* Dynamic Calculation Result Box */}
        <div className="p-6 bg-[#F0F7F1] border border-[#D9EBDC] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            {estimateStatus === 'idle' && (
              <p className="text-sm text-[#5A646D]">
                {isGrazing ? t('tariffs.calculator.idle.grazing') : t('tariffs.calculator.idle.default')}
              </p>
            )}
            {estimateStatus === 'loading' && (
              <div className="flex items-center gap-2 text-[#5A646D] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> {t('tariffs.calculator.loading')}
              </div>
            )}
            {estimateStatus === 'ready' && estimateResult && (
              <div>
                <span className="text-xs text-[#5A646D] uppercase font-semibold block">{t('tariffs.calculator.resultLabel')}</span>
                <div className="text-3xl font-bold font-mono text-[#2E7D4F]">
                  {Number(estimateResult.amount).toLocaleString()} UZS
                </div>
              </div>
            )}
            {estimateStatus === 'refused' && (
              <div className="flex items-start gap-2 text-sm text-[#92400E]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {estimateMessage?.kind === 'server'
                    ? estimateMessage.text
                    : estimateMessage
                      ? t(estimateMessage.key)
                      : null}
                </span>
              </div>
            )}
          </div>
          <Button variant="primary" size="lg" onClick={() => goToCabinet(CABINET_PATHS.wizard)}>
            {t('tariffs.calculator.submitCta')}
          </Button>
        </div>

        {/* The response's own `approximate`/`disclaimer` fields drive this —
            never a string of our own — so the citizen cannot mistake a
            no-parcel estimate for a bill (coordinator instruction, decision
            #63). The disclaimer is the backend's own wording, rendered
            verbatim, not paraphrased or softened. */}
        {estimateStatus === 'ready' && estimateResult?.approximate && (
          <div className="flex items-start gap-2 p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E]">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{estimateResult.disclaimer}</span>
          </div>
        )}
      </section>
    </div>
  );
}
