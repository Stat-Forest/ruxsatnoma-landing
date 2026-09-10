import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/useT';
import type { UiLanguage } from '../../i18n/context';
import { pickName } from '../../lib/localized';

export interface SeasonStripProps {
  /** Activity code → the month numbers (1-12) its season is open in. Comes
   *  straight from `GET /public/site-settings`'s `season_windows` field
   *  (Task 2, ruling R3) — the page owns the fetch, this component stays
   *  testable with fixed months. */
  windows: Record<string, number[]>;
}

const ROWS: { code: string; color: string }[] = [
  { code: 'grazing', color: '#2E7D4F' },
  { code: 'haymaking', color: '#B99F63' },
  { code: 'apiary', color: '#C99A3E' },
  { code: 'recreation', color: '#6F9FAE' },
  { code: 'deadwood', color: '#9C907A' },
  { code: 'science', color: '#8494BA' },
];

/** No existing i18n key covers a season calendar — this track cannot touch
 *  `src/i18n/*`, so the strip's own copy (including the R3-mandated
 *  provisional banner) is translated locally into all five portal
 *  languages. */
const TEXT: Record<
  UiLanguage,
  {
    badge: string;
    title: string;
    subtitle: string;
    currentMonthLabel: string;
    noteBold: string;
    noteRest: string;
    open: string;
    closed: string;
    unknown: string;
  }
> = {
  uz_latn: {
    badge: 'Mavsumlar jadvali',
    title: 'Hozir qaysi yoʻnalish ochiq?',
    subtitle:
      'Har bir foydalanish turi oʻz mavsumiga ega. Jadvalda joriy oy ajratib koʻrsatilgan — ariza topshirish vaqtini shu boʻyicha rejalashtiring.',
    currentMonthLabel: 'Joriy oy',
    noteBold: 'Namunaviy jadval.',
    noteRest:
      'Mavsum oylari Agentlik tomonidan tasdiqlanadi va hududga qarab farq qilishi mumkin — yakuniy sanalar tasdiqlangach shu yerda koʻrsatiladi.',
    open: 'Ochiq',
    closed: 'Yopiq',
    unknown: 'Nomaʼlum',
  },
  ru: {
    badge: 'Календарь сезонов',
    title: 'Какое направление открыто сейчас?',
    subtitle:
      'У каждого вида пользования свой сезон. Текущий месяц выделен в таблице — планируйте подачу заявки с учётом этого.',
    currentMonthLabel: 'Текущий месяц',
    noteBold: 'Примерный график.',
    noteRest:
      'Месяцы сезонов утверждаются Агентством и могут отличаться по регионам — окончательные даты появятся здесь после утверждения.',
    open: 'Открыто',
    closed: 'Закрыто',
    unknown: 'Неизвестно',
  },
  en: {
    badge: 'Season calendar',
    title: 'Which direction is open right now?',
    subtitle:
      'Each type of use has its own season. The current month is highlighted in the table — plan your application around it.',
    currentMonthLabel: 'Current month',
    noteBold: 'Sample schedule.',
    noteRest:
      'Season months are confirmed by the Agency and may differ by region — the final dates will appear here once approved.',
    open: 'Open',
    closed: 'Closed',
    unknown: 'Unknown',
  },
  uz_cyrl: {
    badge: 'Мавсумлар жадвали',
    title: 'Ҳозир қайси йўналиш очиқ?',
    subtitle:
      'Ҳар бир фойдаланиш тури ўз мавсумига эга. Жадвалда жорий ой ажратиб кўрсатилган — ариза топшириш вақтини шу бўйича режалаштиринг.',
    currentMonthLabel: 'Жорий ой',
    noteBold: 'Намунавий жадвал.',
    noteRest:
      'Мавсум ойлари Агентлик томонидан тасдиқланади ва ҳудудга қараб фарқ қилиши мумкин — якуний саналар тасдиқлангач шу ерда кўрсатилади.',
    open: 'Очиқ',
    closed: 'Ёпиқ',
    unknown: 'Номаълум',
  },
  kaa: {
    badge: 'Máwsim kestesi',
    title: 'Házir qaysı baǵdar ashıq?',
    subtitle:
      'Hár bir paydalanıw túrniń óz máwsimi bar. Kestede ámeldegi ay ajıratıp kórsetilgen — árizanı sol boyınsha jobalań.',
    currentMonthLabel: 'Ámeldegi ay',
    noteBold: 'Úlgi keste.',
    noteRest:
      'Máwsim aylar Agentlik tárepinen tastıyıqlanadı hám aymaqqa qaray parıq etiwi múmkin — juwmaqlawshı sánreler tastıyıqlanǵannan keyin usı jerde kórsetiledi.',
    open: 'Ashıq',
    closed: 'Jabıq',
    unknown: 'Belgisiz',
  },
};

const MONTHS: Record<UiLanguage, { short: string[]; full: string[] }> = {
  uz_latn: {
    short: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
    full: [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
    ],
  },
  ru: {
    short: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    full: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
    ],
  },
  en: {
    short: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
    full: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  },
  uz_cyrl: {
    short: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    full: [
      'Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн',
      'Июл', 'Август', 'Сентабр', 'Октабр', 'Ноябр', 'Декабр',
    ],
  },
  kaa: {
    short: ['qań', 'few', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
    full: [
      'Qańtar', 'Fewral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
    ],
  },
};

/**
 * The season calendar from the redesigned home page (Task 10, ruling R3):
 * six rows × twelve months, current month ringed, fed entirely by the
 * `windows` prop the page reads off `GET /public/site-settings`. Always
 * carries the provisional banner (`role="note"`) — the months are not
 * confirmed by the Agency and this strip may never present them as fact.
 *
 * Each of the six rows is in one of THREE states, and the third is the one
 * that matters: an activity `season_windows` does not mention at all is
 * UNKNOWN, not closed. It used to be closed — `windows[code] ?? []` turned a
 * missing key into twelve grey cells and a "Yopiq" badge, which tells a
 * citizen an activity is shut when nobody has said so. An empty array is
 * still closed; only an absent key is unknown.
 */
export function SeasonStrip({ windows }: SeasonStripProps) {
  const { uiLanguage } = useLanguage();
  const text = TEXT[uiLanguage];
  const months = MONTHS[uiLanguage];
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="relative bg-white/95 backdrop-blur-md border border-[#D6E6DB] rounded-2xl p-4 sm:p-6 shadow-[0_8px_28px_rgba(18,53,34,0.05)] overflow-hidden transition-all duration-300">
      {/* ── Top Ambient Accent & Glow ── */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#2E7D4F]/50 to-transparent" />
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#2E7D4F]/5 rounded-full blur-2xl pointer-events-none" />

      {/* ── Header Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0F7F1] border border-[#D9EBDC] text-[10px] font-bold uppercase tracking-wider text-[#23653F]">
            {text.badge}
          </span>
          <h2 className="mt-1.5 text-lg sm:text-xl font-black text-[#123522] tracking-tight">
            {text.title}
          </h2>
          <p className="mt-1 text-[11.5px] sm:text-xs leading-relaxed text-[#5A646D]">{text.subtitle}</p>
        </div>

        {/* Compact Dynamic Current Month Card */}
        <div className="flex items-center gap-2.5 bg-gradient-to-br from-[#F0F8F3] to-[#E3F3E8] border border-[#C6E6CF] px-3 py-1.5 rounded-xl shadow-xs shrink-0 self-start sm:self-auto">
          <div className="w-8 h-8 rounded-lg bg-white flex flex-col items-center justify-center shadow-xs border border-[#D1EBD8]">
            <span className="text-[7.5px] font-black text-[#2E7D4F] uppercase leading-none">
              {months.short[currentMonth - 1]}
            </span>
            <span className="text-xs font-black text-[#123522] leading-none mt-0.5">
              {new Date().getDate()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#23653F]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#16A34A]" />
              </span>
              {text.currentMonthLabel}
            </div>
            <div data-testid="season-current-month" className="text-sm sm:text-base font-black text-[#123522] tracking-tight leading-tight">
              {months.full[currentMonth - 1]}
            </div>
          </div>
        </div>
      </div>

      {/* ── Compact Table Matrix ── */}
      <div className="mt-4 overflow-x-auto pb-1">
        <div className="min-w-[680px]">
          {/* Months Header Row */}
          <div className="grid gap-2.5 items-center mb-2 px-2.5" style={{ gridTemplateColumns: '175px 1fr 78px' }}>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#767F87]">Yoʻnalish</div>
            <div className="grid grid-cols-12 gap-1">
              {months.short.map((label, idx) => {
                const isCurrent = idx + 1 === currentMonth;
                return (
                  <div key={label} className="flex justify-center">
                    {isCurrent ? (
                      <span className="px-1.5 py-0.5 rounded bg-[#123522] text-[#9CE3AE] font-black text-[9px] uppercase tracking-wider shadow-xs animate-pulse">
                        {label}
                      </span>
                    ) : (
                      <span className="text-center text-[10px] font-bold text-[#767F87] hover:text-[#123522] uppercase tracking-wide transition-colors">
                        {label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-right text-[10px] font-extrabold uppercase tracking-wider text-[#767F87]">Holat</div>
          </div>

          {/* Compact Activity Rows */}
          <div className="flex flex-col gap-1">
            {ROWS.map(({ code, color }) => {
              const openMonths = windows?.[code];
              const known = Array.isArray(openMonths);
              const isOpenNow = known && openMonths.includes(currentMonth);
              return (
                <div
                  key={code}
                  data-testid={`season-row-${code}`}
                  className="group/row grid gap-2.5 items-center px-2.5 py-1.5 rounded-lg hover:bg-[#F2F8F4] transition-all duration-150"
                  style={{ gridTemplateColumns: '175px 1fr 78px' }}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A1F24] group-hover/row:text-[#123522] transition-colors">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-xs transition-transform duration-150 group-hover/row:scale-125"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate">{pickName(undefined, uiLanguage, code)}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                      const open = known && openMonths.includes(month);
                      const isCurrent = month === currentMonth;
                      return (
                        <div
                          key={month}
                          title={`${pickName(undefined, uiLanguage, code)} — ${months.full[month - 1]}: ${open ? text.open : text.closed}`}
                          className={`h-[21px] rounded-md transition-all duration-150 relative group/cell cursor-pointer ${
                            isCurrent ? 'scale-[1.08] z-10' : 'hover:scale-110 hover:z-10'
                          }`}
                          style={{
                            background: open
                              ? color
                              : known
                                ? '#EFF2F4'
                                : 'repeating-linear-gradient(45deg, #E9ECEE 0 3px, #F8F9FA 3px 6px)',
                            boxShadow: isCurrent
                              ? '0 0 0 2px #123522, 0 2px 8px rgba(18,53,34,0.22)'
                              : undefined,
                          }}
                        >
                          {open && (
                            <div className="absolute inset-0 rounded-md bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-right">
                    {!known ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-white border border-dashed border-[#C9D0D6] text-[10.5px] font-semibold text-[#767F87]">
                        {text.unknown}
                      </span>
                    ) : isOpenNow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] border border-[#BDE5CB] text-[10.5px] font-extrabold text-[#1E6B3D] shadow-xs group-hover/row:border-[#2E7D4F] transition-all">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22C55E]" />
                        </span>
                        {text.open}
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-[#F4F6F5] border border-[#E1E6E3] text-[10.5px] font-medium text-[#8F9AA2]">
                        {text.closed}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Compact Note Banner ── */}
      <div role="note" className="mt-3.5 flex items-start gap-2.5 px-3 py-2 rounded-xl bg-[#FEF8F0] border border-[#F6E1C3] shadow-xs">
        <AlertCircle className="w-3.5 h-3.5 text-[#C05621] shrink-0 mt-0.5" />
        <span className="text-[11px] leading-relaxed text-[#5C4535]">
          <span className="font-bold text-[#1A1F24]">{text.noteBold}</span> {text.noteRest}
        </span>
      </div>
    </div>
  );
}
