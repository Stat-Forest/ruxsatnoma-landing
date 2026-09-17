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
    direction: string;
    status: string;
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
    direction: 'Yoʻnalish',
    status: 'Holat',
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
    direction: 'Направление',
    status: 'Статус',
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
    direction: 'Direction',
    status: 'Status',
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
    direction: 'Йўналиш',
    status: 'Ҳолат',
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
    direction: 'Baǵdar',
    status: 'Jaǵday',
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
    <div className="relative bg-transparent transition-all duration-300">
      {/* ── Header Section ── */}
      <div className="flex flex-col items-center text-center gap-5 mb-10">
        <div className="max-w-2xl flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#BEDEC7] text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#18532F] shadow-xs">
            {text.badge}
          </span>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-[42px] leading-tight font-black text-[#0D301B] tracking-tight">
            {text.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#2C523A] font-medium max-w-2xl">{text.subtitle}</p>
        </div>

        {/* Dynamic Current Month Card */}
        <div className="flex items-center gap-3 bg-white/95 border border-[#BEDEC7] px-4 py-2 rounded-xl shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-[#EBF5EE] flex flex-col items-center justify-center shadow-xs border border-[#CDE5D4]">
            <span className="text-[9px] font-black text-[#1E6B3D] uppercase leading-none">
              {months.short[currentMonth - 1]}
            </span>
            <span className="text-sm font-black text-[#0D301B] leading-none mt-0.5">
              {new Date().getDate()}
            </span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#18532F]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
              </span>
              {text.currentMonthLabel}
            </div>
            <div data-testid="season-current-month" className="text-base sm:text-lg font-black text-[#0D301B] tracking-tight leading-tight">
              {months.full[currentMonth - 1]}
            </div>
          </div>
        </div>
      </div>

      {/* ── Compact Table Matrix ── */}
      <div className="mt-4 overflow-x-auto pb-1">
        <div className="min-w-[760px]">
          {/* Months Header Row */}
          <div className="grid gap-2.5 items-center mb-2 px-2.5" style={{ gridTemplateColumns: '210px 1fr 85px' }}>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#436A4F]">{text.direction}</div>
            <div className="grid grid-cols-12 gap-1">
              {months.short.map((label, idx) => {
                const isCurrent = idx + 1 === currentMonth;
                return (
                  <div key={label} className="flex justify-center">
                    {isCurrent ? (
                      <span className="px-1.5 py-0.5 rounded bg-[#0D301B] text-[#9CE3AE] font-black text-[9px] uppercase tracking-wider shadow-xs animate-pulse">
                        {label}
                      </span>
                    ) : (
                      <span className="text-center text-[10px] font-bold text-[#436A4F] hover:text-[#0D301B] uppercase tracking-wide transition-colors">
                        {label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-right text-[10px] font-extrabold uppercase tracking-wider text-[#436A4F]">{text.status}</div>
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
                  className="group/row grid gap-2.5 items-center px-2.5 py-1.5 rounded-lg hover:bg-white/50 transition-all duration-150"
                  style={{ gridTemplateColumns: '210px 1fr 85px' }}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0D2E1A] group-hover/row:text-[#071F11] transition-colors">
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
                          className={`h-[24px] rounded-md transition-all duration-150 relative group/cell cursor-pointer ${
                            isCurrent ? 'scale-[1.06] z-10' : 'hover:scale-110 hover:z-10'
                          }`}
                          style={{
                            background: open
                              ? color
                              : known
                                ? 'rgba(255, 255, 255, 0.72)'
                                : 'repeating-linear-gradient(45deg, #C2DFCA 0 3px, #D4EBDB 3px 6px)',
                            boxShadow: isCurrent
                              ? '0 0 0 2px #0D301B, 0 2px 8px rgba(13,48,27,0.22)'
                              : undefined,
                          }}
                        >
                          {open && (
                            <div className="absolute inset-0 rounded-md bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
                          )}
                          {isCurrent && (
                            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0D301B] z-20 pointer-events-none" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-right">
                    {!known ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-white/80 border border-dashed border-[#A7C8B1] text-[10.5px] font-semibold text-[#3F6149]">
                        {text.unknown}
                      </span>
                    ) : isOpenNow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#9DD4AF] text-[10.5px] font-extrabold text-[#135C30] shadow-xs group-hover/row:border-[#2E7D4F] transition-all">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22C55E]" />
                        </span>
                        {text.open}
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-white/50 border border-[#BEDEC7] text-[10.5px] font-medium text-[#557860]">
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
      <div role="note" className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-white/90 border border-[#BEDEC7] shadow-xs">
        <AlertCircle className="w-3.5 h-3.5 text-[#C05621] shrink-0 mt-0.5" />
        <span className="text-[11px] leading-relaxed text-[#2C523A]">
          <span className="font-bold text-[#0D301B]">{text.noteBold}</span> {text.noteRest}
        </span>
      </div>
    </div>
  );
}
