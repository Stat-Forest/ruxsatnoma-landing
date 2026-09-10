import { Star } from 'lucide-react';
import { useLanguage } from '../../i18n/useT';
import { BASE_URL } from '../../api/client';
import { DASH } from '../../lib/format';
import type { UiLanguage } from '../../i18n/context';

/**
 * `GET /api/v1/public/ratings/summary` — NOT YET MERGED into `dev` at the
 * time this track was built (backend track `stage-8-landing-api`, ruling
 * from decisions #172-174). `src/api/schema.d.ts` is generated from the live
 * server and does not describe this route yet, so `api.GET` (openapi-fetch's
 * typed client) cannot be pointed at it. HAND-WRITTEN and PROVISIONAL: once
 * the backend branch merges and `yarn api:types` can see the route, replace
 * `RatingSummary` below with `components['schemas']['RatingSummaryOut']` (or
 * whatever the generated name turns out to be) and call it through `api.GET`
 * like every other endpoint in `src/api/*`.
 */
export interface RatingSummary {
  published: boolean;
  average: string | null;
  count: number;
  histogram: Record<string, number> | null;
  threshold: number;
}

/**
 * `null` on ANY failure (network error, non-2xx, unparsable body) — same
 * contract as `fetchSiteSettings` (`src/api/site.ts`, Task 7): the caller
 * renders the "unavailable" state rather than inventing a figure.
 */
export async function fetchRatingSummary(): Promise<RatingSummary | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/public/ratings/summary`);
    if (!response.ok) return null;
    return (await response.json()) as RatingSummary;
  } catch {
    return null;
  }
}

export type RatingBandState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; summary: RatingSummary };

export interface RatingBandProps {
  state: RatingBandState;
}

/** Every string this band needs that has no existing i18n key — this track
 *  cannot touch `src/i18n/*`, so it is translated locally into all five
 *  portal languages instead of leaving four of them in Latin Uzbek. */
const TEXT: Record<
  UiLanguage,
  { title: string; description: (count: number) => string; suppressed: string; unavailable: string }
> = {
  uz_latn: {
    title: 'Xizmat sifatini baholash',
    description: (count) =>
      `Ruxsatnomani olgan fuqarolar shaxsiy kabinetda qoldirgan baholar. Jami ${count} ta baho asosida hisoblangan.`,
    suppressed: 'Xizmat sifatini baholash uchun hozircha yetarli baho toʻplanmagan.',
    unavailable: 'Baholar vaqtincha mavjud emas — xizmat javob bermadi.',
  },
  ru: {
    title: 'Оценка качества обслуживания',
    description: (count) =>
      `Оценки, оставленные в личном кабинете гражданами, получившими разрешение. Всего ${count} оценок.`,
    suppressed: 'Пока недостаточно оценок, чтобы показать качество обслуживания.',
    unavailable: 'Оценки временно недоступны — сервис не ответил.',
  },
  en: {
    title: 'Service quality rating',
    description: (count) =>
      `Ratings left in their personal cabinet by citizens who received a permit. Based on ${count} ratings in total.`,
    suppressed: 'Not enough ratings have been collected yet to show service quality.',
    unavailable: 'Ratings are temporarily unavailable — the service did not respond.',
  },
  uz_cyrl: {
    title: 'Хизмат сифатини баҳолаш',
    description: (count) =>
      `Рухсатномани олган фуқаролар шахсий кабинетда қолдирган баҳолар. Жами ${count} та баҳо асосида ҳисобланган.`,
    suppressed: 'Хизмат сифатини баҳолаш учун ҳозирча етарли баҳо тўпланмаган.',
    unavailable: 'Баҳолар вақтинча мавжуд эмас — хизмат жавоб бермади.',
  },
  kaa: {
    title: 'Xizmet sapasın bahalaw',
    description: (count) =>
      `Ruxsatnama alǵan puqaralardıń jеке kabinetten qaldırǵan bahaları. Jámi ${count} baha tiykarında esaplanǵan.`,
    suppressed: 'Xizmet sapasın bahalaw ushın házirshe jeterli baha jıynalmaǵan.',
    unavailable: 'Bahalar waqtınsha joq — xizmet juwap bermedi.',
  },
};

const SCORES = [5, 4, 3, 2, 1] as const;

function barColor(score: number): string {
  if (score >= 4) return '#4ADE80';
  if (score === 3) return '#FBBF24';
  return '#F87171';
}

/**
 * The rating band from the redesigned home page (Task 9, `#174`). Three
 * states, and the middle one matters most: while the summary is loading, a
 * quiet placeholder; once it answers with `published: false` (fewer ratings
 * than the k-anonymity threshold), a plain statement that there are not
 * enough ratings yet — never an average computed over too few of them; once
 * `published: true`, the average, star row, count and per-score histogram.
 */
export function RatingBand({ state }: RatingBandProps) {
  const { uiLanguage } = useLanguage();
  const text = TEXT[uiLanguage];

  if (state.status === 'loading') {
    return (
      <div
        data-testid="home-rating"
        className="mt-5 rounded-2xl border border-[#D9EBDC] bg-[#123522] px-6 py-8 sm:px-9 animate-pulse"
      >
        <div className="h-6 w-40 rounded bg-white/10" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div
        data-testid="home-rating"
        className="mt-5 rounded-2xl border border-[#D9EBDC] bg-[#123522] px-6 py-7 sm:px-9"
      >
        <p className="text-sm text-[#C4D8C9]">{text.unavailable}</p>
      </div>
    );
  }

  const { summary } = state;

  if (!summary.published) {
    return (
      <div
        data-testid="home-rating"
        className="mt-5 rounded-2xl border border-[#D9EBDC] bg-[#123522] px-6 py-7 sm:px-9"
      >
        <p className="text-sm leading-relaxed text-[#C4D8C9]">{text.suppressed}</p>
      </div>
    );
  }

  const filled = Math.round(Number(summary.average ?? 0));
  const averageDisplay = summary.average ? summary.average.replace('.', ',') : DASH;

  return (
    <div
      data-testid="home-rating"
      className="mt-5 rounded-2xl border border-[#D9EBDC] bg-[#123522] px-6 py-7 sm:px-9 sm:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        <div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-4xl sm:text-5xl font-black text-white tracking-tight">
              {averageDisplay}
            </span>
            <span className="text-sm font-bold text-[#9CE3AE]">/ 5</span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className="w-[18px] h-[18px]"
                fill={n <= filled ? '#FBBF24' : 'none'}
                stroke="#FBBF24"
                strokeWidth={1.6}
              />
            ))}
          </div>
        </div>
        <div className="hidden sm:block w-px h-14 bg-white/15" />
        <div className="max-w-md">
          <div className="text-base font-extrabold text-white">{text.title}</div>
          <div className="mt-1.5 text-sm leading-relaxed text-[#C4D8C9]">
            {text.description(summary.count)}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 w-full md:w-64">
        {SCORES.map((score) => {
          const value = summary.histogram?.[String(score)] ?? 0;
          const pct = summary.count > 0 ? Math.round((value / summary.count) * 100) : 0;
          return (
            <div key={score} className="flex items-center gap-2.5">
              <span className="w-3 text-xs font-semibold text-[#C4D8C9]">{score}</span>
              <div className="flex-1 h-[7px] rounded-full bg-white/15">
                <div className="h-[7px] rounded-full" style={{ width: `${pct}%`, background: barColor(score) }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
