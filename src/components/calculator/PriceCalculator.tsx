import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input, Select, FormField } from '../ui/FormControls';
import { Alert, Skeleton } from '../ui/Feedback';
import { api } from '../../api/client';
import { apiError } from '../../api/errors';
import { CABINET_PATHS, goToCabinet } from '../../lib/cabinet';
import { pickName } from '../../lib/localized';
import { DASH } from '../../lib/format';
import { useLanguage, useT } from '../../i18n/useT';
import type { components } from '../../api/schema';

type ActivityType = components['schemas']['PublicActivityTypeOut'];
type LivestockType = components['schemas']['PublicLivestockTypeOut'];
type EstimateResult = components['schemas']['PublicEstimateOut'];

const GRAZING_CODE = 'grazing'; // `norms/calculator.py::GRAZING` — the one activity that prices per livestock head, not per declared quantity.
const SCIENCE_CODE = 'science'; // `Imtiyozli, ariza asosida` — no quantity, no sum, no estimate call at all.
/** Pre-selected activity. Grazing is first in the catalogue, but its tariff
 *  waits on VMQ 689's annex 5, so opening on it greets every visitor with
 *  "tariff not published"; haymaking shows a real figure. */
const DEFAULT_ACTIVITY_CODE = 'haymaking';

/** The error the backend's own `calculator.calculate` raises when a rule
 *  parameter it needs (a `coef_sb:*` row from VMQ 689 annex 5) has never
 *  been published — `app/modules/norms/service.py::estimate_public`'s own
 *  comment names this exact code. Never rendered as a generic failure: the
 *  citizen is told plainly that the tariff does not exist yet, not that
 *  "something went wrong". */
const TARIFF_NOT_PUBLISHED_CODE = 'ERR-NORM-004';

type QuantityKind = 'livestock' | 'quantity' | 'none';

interface ActivityFieldConfig {
  kind: QuantityKind;
  /** `tariffs.calculator.field.*`; absent for the two kinds that have no
   *  quantity field, and the default falls back to the generic
   *  `tariffs.calculator.quantityLabel`. */
  labelKey?: string;
}

/**
 * What each activity is priced on (task 11 brief: "hives for an apiary,
 * hectares for haymaking and recreation, cubic metres for deadwood, head for
 * grazing; scientific research ... has no sum at all"). Keyed the same way
 * `Scene`'s `SceneKind` is — the six activity `code`s the catalogue API
 * returns.
 *
 * The public catalogue deliberately does NOT carry `quantity_unit`
 * (`PublicActivityTypeOut`'s own docstring: that field is for the
 * authenticated `/refs/*` router only), so this mapping is the landing's
 * own — but only the mapping. The labels themselves were Uzbek Latin
 * constants here, which is why the whole calculator stayed Uzbek when the
 * switcher said Russian.
 */
const ACTIVITY_FIELDS: Record<string, ActivityFieldConfig> = {
  [GRAZING_CODE]: { kind: 'livestock' },
  haymaking: { kind: 'quantity', labelKey: 'tariffs.calculator.field.haymaking' },
  apiary: { kind: 'quantity', labelKey: 'tariffs.calculator.field.apiary' },
  recreation: { kind: 'quantity', labelKey: 'tariffs.calculator.field.recreation' },
  deadwood: { kind: 'quantity', labelKey: 'tariffs.calculator.field.deadwood' },
  [SCIENCE_CODE]: { kind: 'none' },
};

const DEFAULT_FIELD_CONFIG: ActivityFieldConfig = {
  kind: 'quantity',
  labelKey: 'tariffs.calculator.quantityLabel',
};

function fieldConfigFor(code: string | undefined): ActivityFieldConfig {
  if (!code) return DEFAULT_FIELD_CONFIG;
  return ACTIVITY_FIELDS[code] ?? DEFAULT_FIELD_CONFIG;
}

const INTRO_BULLET_KEYS = [
  'tariffs.calculator.bullet.norms',
  'tariffs.calculator.bullet.anonymous',
  'tariffs.calculator.bullet.finalSum',
];

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

/**
 * The dark result box shared by every render path — refs still loading, refs
 * failed, or a live estimate. `data-testid="calculator-sum"` exists exactly
 * once regardless of which path renders it, and its content is `—` in every
 * state except a real `ready` estimate or the fixed science label: never a
 * number this page made up (task 11 brief).
 */
function CalculatorSum({
  label,
  primary,
  unit,
  note,
  noteVariant = 'idle',
}: {
  label: string;
  primary: string;
  unit?: string;
  note?: React.ReactNode;
  noteVariant?: 'idle' | 'loading' | 'warning' | 'error';
}) {
  const noteColor =
    noteVariant === 'error'
      ? 'text-[#FCA5A5]'
      : noteVariant === 'warning'
        ? 'text-[#FDE68A]'
        : 'text-[#C4D8C9]';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A2215] via-[#103420] to-[#17462B] p-4 sm:p-5 border border-[#2E7D4F]/40 shadow-[0_8px_25px_rgba(18,53,34,0.18)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all">
      {/* Top subtle sheen */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#4ADE80]/50 to-transparent pointer-events-none" />
      {/* Radial soft emerald glow in right corner */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#4ADE80]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Left: Calculation figure */}
      <div className="relative z-10">
        <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#9CE3AE] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_#4ADE80] animate-pulse" />
          <span>{label}</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span
            data-testid="calculator-sum"
            className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight leading-none drop-shadow-sm"
          >
            {primary}
          </span>
          {unit && (
            <span className="text-xs sm:text-sm font-bold text-[#A8D5B5] uppercase tracking-wider">
              {unit}
            </span>
          )}
        </div>
        {note && (
          <p className={`mt-2 flex items-start gap-1.5 text-xs leading-relaxed ${noteColor}`}>
            {noteVariant === 'error' && <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
            {noteVariant === 'warning' && <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
            {noteVariant === 'loading' && <Loader2 className="w-3.5 h-3.5 shrink-0 mt-0.5 animate-spin" />}
            <span>{note}</span>
          </p>
        )}
      </div>

      {/* Right: Certified tariff badge (executive balance) */}
      <div className="relative z-10 hidden sm:flex flex-col items-end justify-center shrink-0 pl-4 border-l border-white/10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs text-[11px] font-semibold text-[#B9F3CB]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
          <span>Avtomatlashtirilgan hisob</span>
        </div>
        <span className="text-[10px] text-[#86B492] mt-1 font-mono tracking-tight">VMQ 689 normalari asosida</span>
      </div>
    </div>
  );
}

/** The left, always-static info panel from the approved prototype
 *  (`design-canvas/Services.dc.html`'s calculator section) — no data
 *  dependency, so it renders identically whether the refs below are still
 *  loading, failed, or ready. */
function CalculatorIntro({ heading, description }: { heading: string; description: string }) {
  const t = useT();
  return (
    <div className="p-5 sm:p-6 lg:p-7 bg-gradient-to-br from-[#EAF5ED]/95 via-[#F4FAF5]/85 to-[#E5F3E9]/90 border-b md:border-b-0 md:border-r border-[#DDEAE0] flex flex-col justify-between relative overflow-hidden">
      {/* Ambient decorative orb */}
      <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-[#4ADE80]/12 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-[#CEE5D3] shadow-xs">
          <Calculator className="w-3.5 h-3.5 text-[#23653F]" />
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#23653F]">
            {t('tariffs.calculator.badge')}
          </span>
        </div>
        <h2 className="mt-3 text-lg sm:text-xl leading-snug font-black text-[#123522] tracking-tight">
          {heading}
        </h2>
        <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-[#5A646D]">{description}</p>
        <ul className="mt-4 flex flex-col gap-2">
          {INTRO_BULLET_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2 text-xs text-[#1A1F24] font-medium">
              <span className="w-4 h-4 rounded-full bg-[#E2F2E7] text-[#2E7D4F] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
              </span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 pt-4 mt-4 border-t border-[#D6E6DA] flex items-center gap-1.5 text-[11px] text-[#63796A] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F] shrink-0" />
        <span>VMQ 689 normativ mezonlari</span>
      </div>
    </div>
  );
}

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
          activityTypes: Array.isArray(activityRes.data) ? activityRes.data : [],
          livestockTypes: Array.isArray(livestockRes.data) ? livestockRes.data : [],
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

  const heading = t('tariffs.calculator.heading');
  const description = t('tariffs.calculator.description');
  const resultLabel = t('tariffs.calculator.resultLabel');

  return (
    <div id={CALCULATOR_ANCHOR} className="max-w-4xl mx-auto font-sans scroll-mt-24">
      <div className="relative border border-[#D6E6DB] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_1.2fr] bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(18,53,34,0.06)] hover:shadow-[0_14px_40px_rgba(18,53,34,0.09)] transition-all duration-300">
        {/* Top glowing laser line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-[#2E7D4F] to-[#123522] z-10" />

        <CalculatorIntro heading={heading} description={description} />

        <div className="p-5 sm:p-6 lg:p-7 bg-white/95 space-y-4">
          {refs.status === 'loading' && (
            <div className="space-y-4" data-testid="calculator-loading">
              <Skeleton height="h-9" />
              <Skeleton height="h-20" />
              <CalculatorSum label={resultLabel} primary={DASH} />
            </div>
          )}

          {refs.status === 'error' && (
            <div className="space-y-4">
              <Alert variant="danger" title={t('tariffs.error.title')}>
                {t('tariffs.error.loadFailedPrefix')}{' '}
                {refs.message ?? (refs.messageKey ? t(refs.messageKey) : null)}
              </Alert>
              <CalculatorSum label={resultLabel} primary={DASH} />
            </div>
          )}

          {refs.status === 'ready' && (
            <CalculatorForm
              activityTypes={refs.activityTypes}
              livestockTypes={refs.livestockTypes}
              resultLabel={resultLabel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

function CalculatorForm({
  activityTypes = [],
  livestockTypes = [],
  resultLabel,
}: {
  activityTypes: ActivityType[];
  livestockTypes: LivestockType[];
  resultLabel: string;
}) {
  const safeActivities = Array.isArray(activityTypes) ? activityTypes : [];
  const safeLivestock = Array.isArray(livestockTypes) ? livestockTypes : [];
  const t = useT();
  const { language } = useLanguage();
  const [activityId, setActivityId] = useState(
    () =>
      (safeActivities.find((a) => a.code === DEFAULT_ACTIVITY_CODE) ?? safeActivities[0])?.id ?? '',
  );
  const [durationMonths, setDurationMonths] = useState(6);
  const [headCounts, setHeadCounts] = useState<Record<string, number | ''>>({});
  const [quantity, setQuantity] = useState<number | ''>(1);

  type EstimateState =
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'ready'; result: EstimateResult }
    | { kind: 'not_published' }
    | { kind: 'refused'; message: { kind: 'server'; text: string } | { kind: 'key'; key: string } };

  const [estimate, setEstimate] = useState<EstimateState>({ kind: 'idle' });

  const selectedActivity = safeActivities.find((a) => a.id === activityId) ?? null;
  const fieldConfig = fieldConfigFor(selectedActivity?.code);
  const isGrazing = fieldConfig.kind === 'livestock';
  const isPriceless = fieldConfig.kind === 'none';

  useEffect(() => {
    if (!selectedActivity || isPriceless) {
      setEstimate({ kind: 'idle' });
      return;
    }

    const items = Object.entries(headCounts)
      .filter(([, count]) => typeof count === 'number' && count > 0)
      .map(([livestock_code, count]) => ({ livestock_code, count: count as number }));

    const numQuantity = typeof quantity === 'number' ? quantity : 0;

    if (isGrazing ? items.length === 0 : numQuantity <= 0) {
      setEstimate({ kind: 'idle' });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setEstimate({ kind: 'loading' });

      void (async () => {
        try {
          const { data, error } = await api.POST('/api/v1/public/calculations/estimate', {
            signal: controller.signal,
            body: {
              activity_type_id: selectedActivity.id,
              period_from: todayIso(),
              period_to: addMonthsIso(new Date(), durationMonths),
              quantity: isGrazing ? undefined : numQuantity,
              items: isGrazing ? items : [],
            },
          });
          if (error) {
            const e = apiError(error);
            // The backend never invents a figure for a rule parameter that
            // was never published (VMQ 689 annex 5) — this page must not
            // either. `ERR-NORM-004` is refused with its own explanatory
            // line, not folded into the generic "refused" copy below.
            if (e.code === TARIFF_NOT_PUBLISHED_CODE) {
              setEstimate({ kind: 'not_published' });
              return;
            }
            setEstimate({ kind: 'refused', message: { kind: 'server', text: `${e.message} (${e.code})` } });
            return;
          }
          if (!data) {
            setEstimate({ kind: 'refused', message: { kind: 'key', key: 'tariffs.calculator.estimateFailed' } });
            return;
          }
          setEstimate({ kind: 'ready', result: data });
        } catch (err) {
          if ((err as { name?: string })?.name === 'AbortError') return;
          setEstimate({ kind: 'refused', message: { kind: 'key', key: 'tariffs.calculator.estimateFailed' } });
        }
      })();
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedActivity, isGrazing, isPriceless, durationMonths, quantity, headCounts]);

  return (
    <>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A646D] mb-2 flex items-center justify-between">
          <span>{t('tariffs.calculator.activityLabel')}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {safeActivities.map((a) => {
            const selected = a.id === activityId;
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActivityId(a.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  selected
                    ? 'bg-gradient-to-r from-[#123522] to-[#1E4E33] text-white shadow-sm shadow-[#123522]/30 scale-[1.02] ring-1 ring-[#2E7D4F]/40'
                    : 'bg-[#F8FAF9] hover:bg-white text-[#4A5568] hover:text-[#123522] border border-[#E2E8F0] hover:border-[#86C495] shadow-xs hover:scale-[1.01]'
                }`}
              >
                {pickName(a.name, language, a.code)}
              </button>
            );
          })}
        </div>
      </div>

      {isPriceless ? (
        <Alert variant="info">{t('tariffs.calculator.science.note')}</Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isGrazing ? (
            safeLivestock.map((lt) => {
              const inputId = `head-${lt.code}`;
              return (
                <FormField key={lt.id} htmlFor={inputId} label={`${pickName(lt.name, language, lt.code)}, ${t('tariffs.calculator.headCountSuffix')}`}>
                  <Input
                    id={inputId}
                    type="number"
                    min={0}
                    placeholder="0"
                    value={headCounts[lt.code] ?? ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setHeadCounts((prev) => ({ ...prev, [lt.code]: '' }));
                        return;
                      }
                      const clean = raw.replace(/^0+(?=\d)/, '');
                      const num = parseInt(clean, 10);
                      setHeadCounts((prev) => ({
                        ...prev,
                        [lt.code]: isNaN(num) ? '' : Math.max(0, num),
                      }));
                    }}
                  />
                </FormField>
              );
            })
          ) : (
            <FormField
              htmlFor="calculator-quantity"
              label={t(fieldConfig.labelKey ?? DEFAULT_FIELD_CONFIG.labelKey!)}
            >
              <Input
                id="calculator-quantity"
                type="number"
                min={0}
                placeholder="1"
                value={quantity}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    setQuantity('');
                    return;
                  }
                  const clean = raw.replace(/^0+(?=\d)/, '');
                  const num = parseFloat(clean);
                  setQuantity(isNaN(num) ? '' : Math.max(0, num));
                }}
              />
            </FormField>
          )}

          <FormField htmlFor="calculator-duration" label={t('tariffs.calculator.durationLabel')}>
            <Select
              id="calculator-duration"
              value={durationMonths.toString()}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              options={[
                { value: '3', label: t('tariffs.calculator.duration.months3') },
                { value: '6', label: t('tariffs.calculator.duration.months6') },
                { value: '12', label: t('tariffs.calculator.duration.months12') },
              ]}
            />
          </FormField>
        </div>
      )}

      {/* Privilege — the anonymous estimate takes no benefit_code at all
          (decision #63: an unverified claim from a visitor with no session
          cannot be honoured), not merely "not yet wired". */}
      {!isPriceless && (
        <label className="flex items-center gap-2 text-[11px] font-medium text-[#7E8B95] bg-[#F8FAF8] px-3 py-2 rounded-lg border border-[#E3ECE5] cursor-not-allowed select-none">
          <input type="checkbox" disabled className="w-3.5 h-3.5 accent-[#2E7D4F] rounded opacity-60" />
          <span>{t('tariffs.calculator.privilegeNote')}</span>
        </label>
      )}

      {isPriceless ? (
        <CalculatorSum
          label={resultLabel}
          primary={t('tariffs.calculator.science.sumLabel')}
          unit={t('tariffs.calculator.science.sumUnit')}
        />
      ) : estimate.kind === 'ready' ? (
        <CalculatorSum
          label={resultLabel}
          primary={Number(estimate.result.amount).toLocaleString()}
          unit="UZS"
        />
      ) : estimate.kind === 'loading' ? (
        <CalculatorSum label={resultLabel} primary={DASH} note={t('tariffs.calculator.loading')} noteVariant="loading" />
      ) : estimate.kind === 'not_published' ? (
        <CalculatorSum
          label={resultLabel}
          primary={DASH}
          note={t('tariffs.calculator.tariffNotPublished')}
          noteVariant="warning"
        />
      ) : estimate.kind === 'refused' ? (
        <CalculatorSum
          label={resultLabel}
          primary={DASH}
          note={estimate.message.kind === 'server' ? estimate.message.text : t(estimate.message.key)}
          noteVariant="error"
        />
      ) : (
        <CalculatorSum
          label={resultLabel}
          primary={DASH}
          note={isGrazing ? t('tariffs.calculator.idle.grazing') : t('tariffs.calculator.idle.default')}
        />
      )}

      {/* Disclaimer as an elegant, styled informational alert box */}
      {estimate.kind === 'ready' && estimate.result.approximate && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4FAF6] border border-[#DCEEE0] text-[11px] sm:text-[11.5px] leading-relaxed text-[#495B4E] shadow-xs">
          <div className="w-5 h-5 rounded-full bg-[#E3F2E7] text-[#2E7D4F] flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-3.5 h-3.5" />
          </div>
          <p className="flex-1">
            <strong className="text-[#1D4A2D] font-semibold mr-1">Eslatma:</strong>
            {t('tariffs.calculator.disclaimer') || estimate.result.disclaimer}
          </p>
        </div>
      )}

      {/* Bottom Action Row with Trust Seal & Elevated CTA Button */}
      <div className="pt-2 border-t border-[#E8EFE9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#5A646D]">
          <div className="w-6 h-6 rounded-full bg-[#EAF5EE] text-[#2E7D4F] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11.5px] font-medium text-[#4B5660]">
            Yagona Id.egov.uz orqali xavfsiz ariza topshirish
          </span>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => goToCabinet(CABINET_PATHS.wizard)}
          rightIcon={<ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />}
          className="group h-10 px-5 rounded-xl font-bold text-xs sm:text-[13px] bg-gradient-to-r from-[#22633C] via-[#2E7D4F] to-[#1C5533] hover:from-[#1A4E2F] hover:via-[#266842] hover:to-[#17462B] text-white shadow-[0_4px_14px_rgba(46,125,79,0.28)] hover:shadow-[0_6px_20px_rgba(46,125,79,0.38)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0 justify-center"
        >
          {t('tariffs.calculator.submitCta')}
        </Button>
      </div>
    </>
  );
}
