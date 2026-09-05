import React, { useEffect, useState } from 'react';
import { Calculator, AlertTriangle, Loader2, Info } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input, Select, FormField } from '../../components/ui/FormControls';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { api } from '../../api/client';
import { apiError } from '../../api/errors';
import { CABINET_PATHS, goToCabinet } from '../../lib/cabinet';
import { pickName } from '../../lib/localized';
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
  | { status: 'error'; message: string }
  | { status: 'ready'; activityTypes: ActivityType[]; livestockTypes: LivestockType[] };

export const TariffsPage: React.FC = () => {
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
        setRefs({ status: 'error', message: 'Maʼlumotlar xizmatiga ulanib boʻlmadi.' });
      }
    }
    void loadRefs();
    return () => {
      cancelled = true;
    };
  }, []);

  if (refs.status === 'loading') {
    return (
      <div className="max-w-5xl mx-auto space-y-6 font-sans">
        <Skeleton height="h-10" width="w-2/3" className="mx-auto" />
        <Skeleton height="h-48" />
      </div>
    );
  }

  if (refs.status === 'error') {
    return (
      <div className="max-w-3xl mx-auto font-sans">
        <Alert variant="danger" title="Kalkulyator vaqtincha ishlamayapti">
          Faoliyat turlari roʻyxatini yuklab boʻlmadi: {refs.message}
        </Alert>
      </div>
    );
  }

  return <TariffsCalculator activityTypes={refs.activityTypes} livestockTypes={refs.livestockTypes} />;
};

function TariffsCalculator({
  activityTypes,
  livestockTypes,
}: {
  activityTypes: ActivityType[];
  livestockTypes: LivestockType[];
}) {
  const [activityId, setActivityId] = useState(activityTypes[0]?.id ?? '');
  const [durationMonths, setDurationMonths] = useState(6);
  const [headCounts, setHeadCounts] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState<number>(1);

  const [estimateStatus, setEstimateStatus] = useState<'idle' | 'loading' | 'ready' | 'refused'>('idle');
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);
  const [estimateMessage, setEstimateMessage] = useState<string | null>(null);

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
            setEstimateMessage(`${e.message} (${e.code})`);
            return;
          }
          setEstimateResult(data ?? null);
          setEstimateStatus('ready');
        } catch (err) {
          if ((err as { name?: string })?.name === 'AbortError') return;
          setEstimateStatus('refused');
          setEstimateMessage('Hisoblash xizmatiga ulanib boʻlmadi.');
        }
      })();
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedActivity, isGrazing, durationMonths, quantity, headCounts]);

  return (
    <div className="max-w-5xl mx-auto space-y-10 font-sans">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          Rasmiy Tariflar va Stavkalar
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#1A1F24]">
          Toʻlov Stavkalari va Kalkulyator
        </h1>
        <p className="text-sm text-[#5A646D] max-w-xl mx-auto">
          Vazirlar Mahkamasi qarorlariga muvofiq belgilangan oʻrmon fondidan foydalanish koeffitsientlari.
        </p>
      </div>

      {/* Interactive Calculator Section */}
      <section className="bg-white border border-[#E4E7EA] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E4E7EA] pb-4">
          <div className="p-3 bg-[#F0F7F1] text-[#2E7D4F] rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1F24]">Onlayn Narx Kalkulyatori</h2>
            <p className="text-xs text-[#5A646D]">Faoliyat turi, miqdor va muddatni kiriting — taxminiy summa tizimning oʻzida hisoblanadi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Faoliyat turi">
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
            <FormField label="Miqdor">
              <Input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                touchSize
              />
            </FormField>
          )}

          <FormField label="Foydalanish muddati (Oy)">
            <Select
              value={durationMonths.toString()}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              options={[
                { value: '3', label: '3 oy (Mavsumiy)' },
                { value: '6', label: '6 oy (Yarim yillik)' },
                { value: '12', label: '12 oy (Bir yillik)' },
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
          <span>Imtiyoz (anonim taxminda hisobga olinmaydi — imtiyoz faqat ariza toʻldirish jarayonida qoʻllanadi)</span>
        </label>

        {/* Dynamic Calculation Result Box */}
        <div className="p-6 bg-[#F0F7F1] border border-[#D9EBDC] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            {estimateStatus === 'idle' && (
              <p className="text-sm text-[#5A646D]">
                {isGrazing ? 'Hisoblash uchun kamida bitta chorva turi sonini kiriting.' : 'Hisoblash uchun miqdorni kiriting.'}
              </p>
            )}
            {estimateStatus === 'loading' && (
              <div className="flex items-center gap-2 text-[#5A646D] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Hisoblanmoqda…
              </div>
            )}
            {estimateStatus === 'ready' && estimateResult && (
              <div>
                <span className="text-xs text-[#5A646D] uppercase font-semibold block">Taxminiy summa:</span>
                <div className="text-3xl font-bold font-mono text-[#2E7D4F]">
                  {Number(estimateResult.amount).toLocaleString()} UZS
                </div>
              </div>
            )}
            {estimateStatus === 'refused' && (
              <div className="flex items-start gap-2 text-sm text-[#92400E]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{estimateMessage}</span>
              </div>
            )}
          </div>
          <Button variant="primary" size="lg" onClick={() => goToCabinet(CABINET_PATHS.wizard)}>
            Shu boʻyicha ariza topshirish
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
