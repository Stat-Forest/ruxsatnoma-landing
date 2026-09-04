import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input, Select, FormField } from '../../components/ui/FormControls';
import { Alert, Skeleton } from '../../components/ui/Feedback';
import { api } from '../../api/client';
import { apiError } from '../../api/errors';
import { pickName } from '../../lib/localized';
import type { components } from '../../api/schema';

type ActivityType = components['schemas']['ActivityTypeOut'];
type LivestockType = components['schemas']['LivestockTypeOut'];
type Tariff = components['schemas']['TariffOut'];

/** `GET /calculations/preview`'s response is documented as free-form in the
 * OpenAPI schema itself (`norms/calc_router.py`: "No response_model: the
 * shape is a free-form dict"), so there is no generated type to reuse here —
 * this mirrors exactly what `norms/service.py::preview` returns
 * (`calculator.jsonable({"amount", "used_sb", "max_sb", "remaining_sb",
 * "breakdown", "rule_code_version", "checks", "input_snapshot"})`), read
 * defensively since it is the one response on this page nothing generates. */
interface PreviewCheck {
  check: string;
  result: 'pass' | 'fail' | 'warning' | 'skipped';
  details: Record<string, unknown>;
}
interface PreviewResponse {
  amount: string;
  used_sb: string | null;
  max_sb: number | null;
  remaining_sb: string | null;
  breakdown: Array<Record<string, unknown>>;
  rule_code_version: string;
  checks: PreviewCheck[];
  input_snapshot: Record<string, unknown>;
}

const GRAZING_CODE = 'grazing'; // `norms/calculator.py::GRAZING` — the one activity that prices per livestock head, not per declared quantity.

/** The demo's calculator estimates against one representative published
 * contour rather than making the citizen pick one — contour selection is
 * B7's job (the application wizard), not A3's. Unset until a real contour id
 * is wired in via the environment (see `.env.example`). */
const DEMO_CONTOUR_ID = import.meta.env.VITE_DEMO_CONTOUR_ID ?? '';

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
  | { status: 'ready'; activityTypes: ActivityType[]; livestockTypes: LivestockType[]; tariffs: Tariff[] };

export const TariffsPage: React.FC = () => {
  const [refs, setRefs] = useState<RefsState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function loadRefs() {
      try {
        const [activityRes, livestockRes, tariffRes] = await Promise.all([
          api.GET('/api/v1/refs/activity-types'),
          api.GET('/api/v1/refs/livestock-types'),
          api.GET('/api/v1/tariffs', { params: { query: { limit: 200 } } }),
        ]);
        if (cancelled) return;
        const firstError = activityRes.error ?? livestockRes.error ?? tariffRes.error;
        if (firstError) {
          const e = apiError(firstError);
          setRefs({ status: 'error', message: `${e.message} (${e.code})` });
          return;
        }
        setRefs({
          status: 'ready',
          activityTypes: activityRes.data ?? [],
          livestockTypes: livestockRes.data ?? [],
          tariffs: tariffRes.data?.items ?? [],
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
        <Skeleton height="h-64" />
      </div>
    );
  }

  if (refs.status === 'error') {
    return (
      <div className="max-w-3xl mx-auto font-sans">
        <Alert variant="danger" title="Kalkulyator vaqtincha ishlamayapti">
          Tariflar va faoliyat turlari roʻyxatini yuklab boʻlmadi: {refs.message}
        </Alert>
      </div>
    );
  }

  return <TariffsCalculator activityTypes={refs.activityTypes} livestockTypes={refs.livestockTypes} tariffs={refs.tariffs} />;
};

function TariffsCalculator({
  activityTypes,
  livestockTypes,
  tariffs,
}: {
  activityTypes: ActivityType[];
  livestockTypes: LivestockType[];
  tariffs: Tariff[];
}) {
  const [activityId, setActivityId] = useState(activityTypes[0]?.id ?? '');
  const [durationMonths, setDurationMonths] = useState(6);
  const [headCounts, setHeadCounts] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState<number>(1);

  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'ready' | 'refused' | 'error'>('idle');
  const [previewResult, setPreviewResult] = useState<PreviewResponse | null>(null);
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);

  const selectedActivity = activityTypes.find((a) => a.id === activityId) ?? null;
  const isGrazing = selectedActivity?.code === GRAZING_CODE;

  useEffect(() => {
    if (!selectedActivity) return;
    if (!DEMO_CONTOUR_ID) {
      setPreviewStatus('idle');
      return;
    }

    const items = Object.entries(headCounts)
      .filter(([, count]) => count > 0)
      .map(([livestock_code, count]) => ({ livestock_code, count }));

    if (isGrazing && items.length === 0) {
      setPreviewStatus('idle');
      return;
    }

    const timer = setTimeout(() => {
      const controller = new AbortController();
      setPreviewStatus('loading');
      setPreviewMessage(null);

      void (async () => {
        try {
          const { data, error } = await api.POST('/api/v1/calculations/preview', {
            signal: controller.signal,
            body: {
              contour_id: DEMO_CONTOUR_ID,
              activity_type_id: selectedActivity.id,
              period_from: todayIso(),
              period_to: addMonthsIso(new Date(), durationMonths),
              quantity: isGrazing ? undefined : quantity,
              items: isGrazing ? items : [],
            },
          });
          if (error) {
            const e = apiError(error);
            setPreviewStatus('refused');
            setPreviewMessage(`${e.message} (${e.code})`);
            return;
          }
          const body = data as PreviewResponse;
          const failing = body.checks?.find((c) => c.result === 'fail');
          if (failing) {
            setPreviewStatus('refused');
            setPreviewMessage(`${failing.check}: ${JSON.stringify(failing.details)}`);
            setPreviewResult(body);
            return;
          }
          setPreviewResult(body);
          setPreviewStatus('ready');
        } catch (err) {
          if ((err as { name?: string })?.name === 'AbortError') return;
          setPreviewStatus('error');
          setPreviewMessage('Hisoblash xizmatiga ulanib boʻlmadi.');
        }
      })();

      return () => controller.abort();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActivity?.id, durationMonths, quantity, JSON.stringify(headCounts)]);

  const tariffRows = useMemo(
    () =>
      tariffs.map((t) => {
        const activity = activityTypes.find((a) => a.id === t.activity_type_id);
        return {
          id: t.id,
          activity: activity ? pickName(activity.name) : t.activity_type_id,
          livestockGroup: t.livestock_group,
          coefficient: t.coefficient,
          unit: t.quantity_unit,
        };
      }),
    [tariffs, activityTypes],
  );

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

      {!DEMO_CONTOUR_ID && (
        <Alert variant="warning" title="Kalkulyator taxminiy rejimda">
          Bu sahifa hozircha narxni haqiqiy kontur tanlanmasdan hisoblay olmaydi (`VITE_DEMO_CONTOUR_ID` sozlanmagan). Aniq narx faqat ariza toʻldirish jarayonida, real kontur tanlangandan soʻng koʻrsatiladi.
        </Alert>
      )}

      {/* Interactive Calculator Section */}
      <section className="bg-white border border-[#E4E7EA] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E4E7EA] pb-4">
          <div className="p-3 bg-[#F0F7F1] text-[#2E7D4F] rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1F24]">Onlayn Narx Kalkulyatori</h2>
            <p className="text-xs text-[#5A646D]">Faoliyat turi, miqdor va muddatni kiriting — toʻlov summasi tizimning oʻzida hisoblanadi</p>
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
            <FormField label={`Miqdor (${selectedActivity?.quantity_unit ?? ''})`}>
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

        {/* Privilege — kept visible (tz/12 #13: the benefit list is still a
            fail-closed draft, so it is not wired to a live code yet), but
            disabled rather than silently doing nothing. */}
        <label className="flex items-center gap-2 text-xs font-semibold text-[#9AA3AB] bg-[#F8F9FA] p-3 rounded-xl border border-[#E4E7EA] cursor-not-allowed">
          <input type="checkbox" disabled className="w-4 h-4" />
          <span>Imtiyoz (hozircha yopiq — imtiyozlar roʻyxati markaziy admin tomonidan hali tasdiqlanmagan)</span>
        </label>

        {/* Dynamic Calculation Result Box */}
        <div className="p-6 bg-[#F0F7F1] border border-[#D9EBDC] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            {previewStatus === 'idle' && (
              <p className="text-sm text-[#5A646D]">
                {isGrazing ? 'Hisoblash uchun kamida bitta chorva turi sonini kiriting.' : 'Hisoblash uchun miqdorni kiriting.'}
              </p>
            )}
            {previewStatus === 'loading' && (
              <div className="flex items-center gap-2 text-[#5A646D] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Hisoblanmoqda…
              </div>
            )}
            {previewStatus === 'ready' && previewResult && (
              <div>
                <span className="text-xs text-[#5A646D] uppercase font-semibold block">Hisoblangan umumiy toʻlov summasi:</span>
                <div className="text-3xl font-bold font-mono text-[#2E7D4F]">
                  {Number(previewResult.amount).toLocaleString()} UZS
                </div>
              </div>
            )}
            {(previewStatus === 'refused' || previewStatus === 'error') && (
              <div className="flex items-start gap-2 text-sm text-[#92400E]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{previewMessage}</span>
              </div>
            )}
          </div>
          <Button variant="primary" size="lg" onClick={() => window.open('https://id.egov.uz', '_blank')}>
            Shu boʻyicha ariza topshirish
          </Button>
        </div>
      </section>

      {/* Official Coefficients Table */}
      <section className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#1A1F24]">Rasmiy Koeffitsientlar Jadvali</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8F9FA] border-b border-[#E4E7EA]">
              <tr>
                <th className="p-3 font-semibold text-[#5A646D]">Faoliyat turi</th>
                <th className="p-3 font-semibold text-[#5A646D]">Chorva guruhi</th>
                <th className="p-3 font-semibold text-[#5A646D]">Koeffitsient (БҲМ)</th>
                <th className="p-3 font-semibold text-[#5A646D]">Birlik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EA]">
              {tariffRows.length === 0 ? (
                <tr>
                  <td className="p-3 text-[#5A646D]" colSpan={4}>
                    Hozircha nashr etilgan tarif topilmadi.
                  </td>
                </tr>
              ) : (
                tariffRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F8F9FA]">
                    <td className="p-3 font-bold text-[#1A1F24]">{row.activity}</td>
                    <td className="p-3 text-[#5A646D]">{row.livestockGroup ?? '—'}</td>
                    <td className="p-3 font-mono font-semibold text-[#2E7D4F]">{row.coefficient}</td>
                    <td className="p-3 text-[#5A646D]">{row.unit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
